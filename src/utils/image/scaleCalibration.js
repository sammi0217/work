/**
 * Scale Calibration Utilities
 *
 * Tools for calibrating pixel-to-real-world measurements
 * Essential for accurate floor plan dimensions
 */

import { distance } from '../ortho/orthoAdjuster';

/**
 * Calculate pixels per unit from a calibration line
 * @param {Object} line - Calibration line {x1, y1, x2, y2}
 * @param {number} realLength - Real-world length
 * @returns {number} Pixels per unit
 */
export function calculatePixelsPerUnit(line, realLength) {
  const pixelLength = distance(
    { x: line.x1, y: line.y1 },
    { x: line.x2, y: line.y2 }
  );

  if (realLength <= 0 || pixelLength <= 0) {
    throw new Error('Invalid calibration: lengths must be positive');
  }

  return pixelLength / realLength;
}

/**
 * Convert pixels to real-world units
 * @param {number} pixels - Pixel measurement
 * @param {number} pixelsPerUnit - Calibration ratio
 * @returns {number} Real-world measurement
 */
export function pixelsToUnits(pixels, pixelsPerUnit) {
  if (!pixelsPerUnit || pixelsPerUnit <= 0) {
    throw new Error('Invalid pixels per unit');
  }
  return pixels / pixelsPerUnit;
}

/**
 * Convert real-world units to pixels
 * @param {number} units - Real-world measurement
 * @param {number} pixelsPerUnit - Calibration ratio
 * @returns {number} Pixel measurement
 */
export function unitsToPixels(units, pixelsPerUnit) {
  if (!pixelsPerUnit || pixelsPerUnit <= 0) {
    throw new Error('Invalid pixels per unit');
  }
  return units * pixelsPerUnit;
}

/**
 * Convert between different units
 */
export const UNIT_CONVERSIONS = {
  // To centimeters
  cm: 1,
  m: 100,
  mm: 0.1,
  in: 2.54,
  ft: 30.48,
  yd: 91.44,
};

/**
 * Convert measurement between units
 * @param {number} value - Measurement value
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @returns {number} Converted value
 */
export function convertUnits(value, fromUnit, toUnit) {
  // Convert to cm first
  const inCm = value * UNIT_CONVERSIONS[fromUnit];
  // Then to target unit
  return inCm / UNIT_CONVERSIONS[toUnit];
}

/**
 * Format measurement with unit
 * @param {number} value - Measurement value
 * @param {string} unit - Unit of measurement
 * @param {number} precision - Decimal places
 * @returns {string} Formatted string
 */
export function formatMeasurement(value, unit, precision = 2) {
  return `${value.toFixed(precision)} ${unit}`;
}

/**
 * Calculate area in real-world units
 * @param {number} pixelArea - Area in pixels²
 * @param {number} pixelsPerUnit - Calibration ratio
 * @returns {number} Area in units²
 */
export function calculateRealArea(pixelArea, pixelsPerUnit) {
  if (!pixelsPerUnit || pixelsPerUnit <= 0) {
    throw new Error('Invalid pixels per unit');
  }
  return pixelArea / (pixelsPerUnit * pixelsPerUnit);
}

/**
 * Calculate perimeter in real-world units
 * @param {number} pixelPerimeter - Perimeter in pixels
 * @param {number} pixelsPerUnit - Calibration ratio
 * @returns {number} Perimeter in units
 */
export function calculateRealPerimeter(pixelPerimeter, pixelsPerUnit) {
  return pixelsToUnits(pixelPerimeter, pixelsPerUnit);
}

/**
 * Create scale metadata for export
 * @param {Object} scale - Scale object {pixelsPerUnit, unit, calibrationLine}
 * @returns {Object} Metadata object
 */
export function createScaleMetadata(scale) {
  if (!scale.pixelsPerUnit) {
    return null;
  }

  return {
    pixelsPerUnit: scale.pixelsPerUnit,
    unit: scale.unit,
    calibrationLine: scale.calibrationLine,
    unitsPerPixel: 1 / scale.pixelsPerUnit,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate scale calibration
 * @param {Object} scale - Scale object
 * @returns {boolean} Is valid
 */
export function isScaleValid(scale) {
  return (
    scale &&
    scale.pixelsPerUnit > 0 &&
    scale.unit &&
    scale.calibrationLine &&
    scale.calibrationLine.x1 !== undefined
  );
}

/**
 * Apply scale to contour points
 * @param {Array} points - Array of points [{x, y}, ...]
 * @param {number} pixelsPerUnit - Calibration ratio
 * @returns {Array} Scaled points in real-world coordinates
 */
export function scaleContourPoints(points, pixelsPerUnit) {
  return points.map((p) => ({
    x: pixelsToUnits(p.x, pixelsPerUnit),
    y: pixelsToUnits(p.y, pixelsPerUnit),
  }));
}

/**
 * Calculate recommended scale based on image size and typical floor plan dimensions
 * @param {number} imageWidth - Image width in pixels
 * @param {number} imageHeight - Image height in pixels
 * @param {string} unit - Target unit
 * @returns {Object} Recommended scale info
 */
export function estimateScale(imageWidth, imageHeight, unit = 'cm') {
  // Assume typical floor plan is about 10-20 meters wide
  const typicalWidthInCm = 1500; // 15 meters
  const estimatedPixelsPerCm = imageWidth / typicalWidthInCm;

  const pixelsPerUnit = estimatedPixelsPerCm * UNIT_CONVERSIONS[unit];

  return {
    pixelsPerUnit,
    unit,
    confidence: 'low', // This is just an estimate
    message: 'Estimated scale - please calibrate for accuracy',
  };
}
