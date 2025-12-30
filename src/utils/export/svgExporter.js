/**
 * SVG Export Utilities
 *
 * Export vectorized floor plans as SVG with:
 * - Clean, optimized paths
 * - Scale metadata
 * - Layer organization
 * - Professional formatting
 */

import { scaleContourPoints, createScaleMetadata } from '../image/scaleCalibration';

/**
 * Convert points array to SVG path string
 * @param {Array} points - Array of points [{x, y}, ...]
 * @param {boolean} closed - Close the path
 * @returns {string} SVG path d attribute
 */
function pointsToPath(points, closed = true) {
  if (points.length === 0) return '';

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }

  if (closed) {
    d += ' Z';
  }

  return d;
}

/**
 * Optimize path by removing redundant points
 * @param {Array} points - Array of points
 * @param {number} tolerance - Tolerance for collinear points
 * @returns {Array} Optimized points
 */
function optimizePath(points, tolerance = 0.1) {
  if (points.length < 3) return points;

  const optimized = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    // Check if current point is collinear with prev and next
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    const cross = Math.abs(dx1 * dy2 - dy1 * dx2);

    if (cross > tolerance) {
      optimized.push(curr);
    }
  }

  optimized.push(points[points.length - 1]);

  return optimized;
}

/**
 * Create SVG from contours
 * @param {Array} contours - Array of contours with points
 * @param {Object} options - Export options
 * @returns {string} SVG string
 */
export function createSVG(contours, options = {}) {
  const {
    width = 800,
    height = 600,
    scale = null,
    title = 'Floor Plan',
    description = 'Vectorized floor plan',
    strokeWidth = 2,
    strokeColor = '#000000',
    fillColor = 'none',
    backgroundColor = '#ffffff',
    optimize = true,
    applyScale = false,
  } = options;

  // Start SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}"
     viewBox="0 0 ${width} ${height}"
     xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink">
`;

  // Add metadata
  svg += `  <title>${escapeXml(title)}</title>
  <desc>${escapeXml(description)}</desc>
`;

  // Add scale metadata if available
  if (scale && scale.pixelsPerUnit) {
    const metadata = createScaleMetadata(scale);
    svg += `  <metadata>
    <floorplan-metadata>
      <scale unit="${metadata.unit}" pixels-per-unit="${metadata.pixelsPerUnit}"/>
      <calibration-line x1="${scale.calibrationLine.x1}" y1="${scale.calibrationLine.y1}"
                        x2="${scale.calibrationLine.x2}" y2="${scale.calibrationLine.y2}"/>
      <created>${metadata.timestamp}</created>
    </floorplan-metadata>
  </metadata>
`;
  }

  // Add background
  svg += `  <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
`;

  // Add contours as paths
  svg += `  <g id="floor-plan" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="${fillColor}">
`;

  contours.forEach((contour, index) => {
    let points = contour.points;

    // Apply scale if requested
    if (applyScale && scale && scale.pixelsPerUnit) {
      points = scaleContourPoints(points, scale.pixelsPerUnit);
    }

    // Optimize path
    if (optimize) {
      points = optimizePath(points);
    }

    // Create path
    const pathD = pointsToPath(points, true);

    svg += `    <path id="contour-${index}" d="${pathD}"/>
`;
  });

  svg += `  </g>
</svg>`;

  return svg;
}

/**
 * Export SVG with layers
 * @param {Object} layers - Object with layer names and contours
 * @param {Object} options - Export options
 * @returns {string} SVG string
 */
export function createLayeredSVG(layers, options = {}) {
  const {
    width = 800,
    height = 600,
    scale = null,
    title = 'Floor Plan',
    backgroundColor = '#ffffff',
  } = options;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}"
     viewBox="0 0 ${width} ${height}"
     xmlns="http://www.w3.org/2000/svg">
  <title>${escapeXml(title)}</title>
  <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
`;

  // Add each layer
  Object.entries(layers).forEach(([layerName, contours]) => {
    svg += `  <g id="${layerName}" class="layer">
`;

    contours.forEach((contour, index) => {
      const points = optimizePath(contour.points);
      const pathD = pointsToPath(points, true);

      svg += `    <path id="${layerName}-${index}" d="${pathD}"
           stroke="#000" stroke-width="2" fill="none"/>
`;
    });

    svg += `  </g>
`;
  });

  svg += `</svg>`;

  return svg;
}

/**
 * Download SVG file
 * @param {string} svgContent - SVG content
 * @param {string} filename - Output filename
 */
export function downloadSVG(svgContent, filename = 'floorplan.svg') {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Escape XML special characters
 */
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Calculate SVG bounds from contours
 * @param {Array} contours - Array of contours
 * @returns {Object} Bounds {minX, minY, maxX, maxY, width, height}
 */
export function calculateBounds(contours) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  contours.forEach((contour) => {
    contour.points.forEach((point) => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Create SVG with auto-fitting viewBox
 * @param {Array} contours - Array of contours
 * @param {Object} options - Export options
 * @returns {string} SVG string
 */
export function createAutoFitSVG(contours, options = {}) {
  const bounds = calculateBounds(contours);
  const padding = options.padding || 20;

  return createSVG(contours, {
    ...options,
    width: bounds.width + padding * 2,
    height: bounds.height + padding * 2,
  });
}
