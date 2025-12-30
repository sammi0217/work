/**
 * Image Processing Worker
 *
 * Handles all heavy image processing operations using OpenCV.js
 * Runs in a separate thread to prevent UI blocking.
 *
 * Operations:
 * - Threshold
 * - Morphology (Opening, Closing)
 * - Edge Detection
 * - Connected Components (Magic Wand)
 * - Contour Detection
 */

let cv = null;

// Load OpenCV.js
importScripts('https://docs.opencv.org/4.8.0/opencv.js');

// Wait for OpenCV to be ready
function onOpenCvReady() {
  cv = self.cv;
  postMessage({ type: 'ready' });
}

// OpenCV ready callback
if (typeof cv !== 'undefined') {
  onOpenCvReady();
} else {
  self.addEventListener('load', onOpenCvReady);
}

/**
 * Process image with threshold
 */
function applyThreshold(imageData, threshold) {
  const src = cv.matFromImageData(imageData);
  const gray = new cv.Mat();
  const binary = new cv.Mat();

  // Convert to grayscale if needed
  if (src.channels() === 4) {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  } else if (src.channels() === 3) {
    cv.cvtColor(src, gray, cv.COLOR_RGB2GRAY);
  } else {
    gray = src.clone();
  }

  // Apply threshold
  cv.threshold(gray, binary, threshold, 255, cv.THRESH_BINARY);

  // Convert back to ImageData
  const result = imageDataFromMat(binary);

  // Cleanup
  src.delete();
  gray.delete();
  binary.delete();

  return result;
}

/**
 * Apply morphological operations
 */
function applyMorphology(imageData, operation, kernelSize, iterations) {
  const src = cv.matFromImageData(imageData);
  const dst = new cv.Mat();
  const kernel = cv.getStructuringElement(
    cv.MORPH_RECT,
    new cv.Size(kernelSize, kernelSize)
  );

  const morphOp =
    operation === 'erode'
      ? cv.MORPH_ERODE
      : operation === 'dilate'
      ? cv.MORPH_DILATE
      : operation === 'open'
      ? cv.MORPH_OPEN
      : cv.MORPH_CLOSE;

  cv.morphologyEx(src, dst, morphOp, kernel, new cv.Point(-1, -1), iterations);

  const result = imageDataFromMat(dst);

  src.delete();
  dst.delete();
  kernel.delete();

  return result;
}

/**
 * Gaussian blur
 */
function applyBlur(imageData, kernelSize) {
  const src = cv.matFromImageData(imageData);
  const dst = new cv.Mat();

  const ksize = new cv.Size(kernelSize, kernelSize);
  cv.GaussianBlur(src, dst, ksize, 0, 0, cv.BORDER_DEFAULT);

  const result = imageDataFromMat(dst);

  src.delete();
  dst.delete();

  return result;
}

/**
 * Find connected components (Magic Wand)
 */
function findConnectedComponents(imageData, seedPoint, tolerance) {
  const src = cv.matFromImageData(imageData);
  const mask = cv.Mat.zeros(src.rows + 2, src.cols + 2, cv.CV_8UC1);

  const loDiff = new cv.Scalar(tolerance, tolerance, tolerance, 0);
  const upDiff = new cv.Scalar(tolerance, tolerance, tolerance, 0);

  cv.floodFill(
    src,
    mask,
    new cv.Point(seedPoint.x, seedPoint.y),
    new cv.Scalar(255, 255, 255, 255),
    new cv.Rect(),
    loDiff,
    upDiff,
    cv.FLOODFILL_MASK_ONLY | 4 | (255 << 8)
  );

  // Extract the mask (remove padding)
  const roi = mask.roi(new cv.Rect(1, 1, src.cols, src.rows));
  const result = imageDataFromMat(roi);

  src.delete();
  mask.delete();
  roi.delete();

  return result;
}

/**
 * Find contours
 */
function findContours(imageData, smoothness = 0.5) {
  const src = cv.matFromImageData(imageData);
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  // Find contours
  cv.findContours(src, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

  const result = [];

  for (let i = 0; i < contours.size(); i++) {
    const contour = contours.get(i);
    const approx = new cv.Mat();

    // Approximate contour with RDP algorithm
    const epsilon = smoothness * cv.arcLength(contour, true);
    cv.approxPolyDP(contour, approx, epsilon, true);

    // Convert to array of points
    const points = [];
    for (let j = 0; j < approx.rows; j++) {
      points.push({
        x: approx.data32S[j * 2],
        y: approx.data32S[j * 2 + 1],
      });
    }

    result.push({
      points,
      area: cv.contourArea(contour),
      perimeter: cv.arcLength(contour, true),
    });

    approx.delete();
    contour.delete();
  }

  src.delete();
  contours.delete();
  hierarchy.delete();

  return result;
}

/**
 * Remove small connected components (text, symbols, small objects)
 */
function removeSmallComponents(imageData, minSize = 100) {
  const src = cv.matFromImageData(imageData);
  const labels = new cv.Mat();
  const stats = new cv.Mat();
  const centroids = new cv.Mat();

  // Find all connected components
  const numLabels = cv.connectedComponentsWithStats(src, labels, stats, centroids, 8, cv.CV_32S);

  // Create output (start with white/background)
  const dst = new cv.Mat(src.rows, src.cols, cv.CV_8UC1, new cv.Scalar(255));

  // Keep only large components
  for (let i = 1; i < numLabels; i++) {
    const area = stats.intAt(i, cv.CC_STAT_AREA);

    if (area >= minSize) {
      // Keep this component - copy it to dst
      for (let y = 0; y < labels.rows; y++) {
        for (let x = 0; x < labels.cols; x++) {
          if (labels.intAt(y, x) === i) {
            dst.ucharPtr(y, x)[0] = 0; // Set to black
          }
        }
      }
    }
  }

  const result = imageDataFromMat(dst);

  src.delete();
  labels.delete();
  stats.delete();
  centroids.delete();
  dst.delete();

  return result;
}

/**
 * Complete image processing pipeline
 */
function processImage(imageData, params) {
  let result = imageData;

  // Step 1: Blur (if needed)
  if (params.blurSize > 0) {
    result = applyBlur(result, params.blurSize);
    postMessage({ type: 'progress', progress: 15 });
  }

  // Step 2: Threshold
  result = applyThreshold(result, params.threshold);
  postMessage({ type: 'progress', progress: 30 });

  // Step 3: Remove small components (text, symbols) - SMART CLEANUP
  if (params.removeSmallObjects && params.minObjectSize > 0) {
    result = removeSmallComponents(result, params.minObjectSize);
    postMessage({ type: 'progress', progress: 60 });
  }

  // Step 4: Morphology (Closing to connect gaps)
  if (params.morphologySize > 0 && params.morphologyIterations > 0) {
    result = applyMorphology(
      result,
      'close',
      params.morphologySize,
      params.morphologyIterations
    );
    postMessage({ type: 'progress', progress: 85 });
  }

  postMessage({ type: 'progress', progress: 100 });

  return result;
}

/**
 * Convert OpenCV Mat to ImageData
 */
function imageDataFromMat(mat) {
  const channels = mat.channels();
  let data;

  if (channels === 1) {
    // Grayscale - convert to RGBA
    const rgba = new cv.Mat();
    cv.cvtColor(mat, rgba, cv.COLOR_GRAY2RGBA);
    data = new Uint8ClampedArray(rgba.data);
    rgba.delete();
  } else if (channels === 3) {
    // RGB - convert to RGBA
    const rgba = new cv.Mat();
    cv.cvtColor(mat, rgba, cv.COLOR_RGB2RGBA);
    data = new Uint8ClampedArray(rgba.data);
    rgba.delete();
  } else {
    data = new Uint8ClampedArray(mat.data);
  }

  return new ImageData(data, mat.cols, mat.rows);
}

/**
 * Message handler
 */
self.onmessage = async function (e) {
  const { type, data } = e.data;

  try {
    switch (type) {
      case 'process':
        const processed = processImage(data.imageData, data.params);
        postMessage(
          {
            type: 'processed',
            imageData: processed,
          },
          [processed.data.buffer]
        );
        break;

      case 'threshold':
        const thresholded = applyThreshold(data.imageData, data.threshold);
        postMessage(
          {
            type: 'threshold',
            imageData: thresholded,
          },
          [thresholded.data.buffer]
        );
        break;

      case 'morphology':
        const morphed = applyMorphology(
          data.imageData,
          data.operation,
          data.kernelSize,
          data.iterations
        );
        postMessage(
          {
            type: 'morphology',
            imageData: morphed,
          },
          [morphed.data.buffer]
        );
        break;

      case 'magicWand':
        const mask = findConnectedComponents(data.imageData, data.seedPoint, data.tolerance);
        postMessage(
          {
            type: 'magicWand',
            imageData: mask,
          },
          [mask.data.buffer]
        );
        break;

      case 'findContours':
        const contours = findContours(data.imageData, data.smoothness);
        postMessage({
          type: 'contours',
          contours,
        });
        break;

      default:
        console.error('Unknown message type:', type);
    }
  } catch (error) {
    postMessage({
      type: 'error',
      error: error.message,
    });
  }
};
