/**
 * Orthogonal Adjustment Algorithm
 *
 * Adjusts line segments to be perfectly horizontal or vertical
 * if they are close to those angles (within threshold).
 *
 * This is crucial for architectural floor plans where walls
 * should be at exact 90-degree angles.
 */

/**
 * Calculate angle of a line segment in degrees
 * @param {Object} p1 - Start point {x, y}
 * @param {Object} p2 - End point {x, y}
 * @returns {number} Angle in degrees (0-360)
 */
export function calculateAngle(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const radians = Math.atan2(dy, dx);
  let degrees = (radians * 180) / Math.PI;

  // Normalize to 0-360
  if (degrees < 0) degrees += 360;

  return degrees;
}

/**
 * Calculate distance between two points
 */
export function distance(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find the nearest orthogonal angle (0, 90, 180, 270)
 * @param {number} angle - Angle in degrees
 * @returns {number} Nearest orthogonal angle
 */
export function nearestOrthoAngle(angle) {
  const orthoAngles = [0, 90, 180, 270, 360];
  let nearest = orthoAngles[0];
  let minDiff = Math.abs(angle - orthoAngles[0]);

  for (const ortho of orthoAngles) {
    const diff = Math.abs(angle - ortho);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = ortho;
    }
  }

  return nearest % 360;
}

/**
 * Check if angle is close to orthogonal
 * @param {number} angle - Angle in degrees
 * @param {number} threshold - Threshold in degrees (default 5)
 * @returns {boolean}
 */
export function isNearOrtho(angle, threshold = 5) {
  const nearest = nearestOrthoAngle(angle);
  const diff = Math.abs(angle - nearest);
  return diff <= threshold;
}

/**
 * Adjust a single line segment to be orthogonal if close enough
 * @param {Object} p1 - Start point {x, y}
 * @param {Object} p2 - End point {x, y}
 * @param {number} threshold - Angle threshold in degrees
 * @returns {Object} - Adjusted end point {x, y}
 */
export function adjustLineToOrtho(p1, p2, threshold = 5) {
  const angle = calculateAngle(p1, p2);

  if (!isNearOrtho(angle, threshold)) {
    // Not close to orthogonal, return original
    return { ...p2 };
  }

  const nearest = nearestOrthoAngle(angle);
  const len = distance(p1, p2);

  let newP2 = { ...p2 };

  switch (nearest) {
    case 0: // Horizontal right
      newP2.y = p1.y;
      newP2.x = p1.x + len;
      break;
    case 90: // Vertical down
      newP2.x = p1.x;
      newP2.y = p1.y + len;
      break;
    case 180: // Horizontal left
      newP2.y = p1.y;
      newP2.x = p1.x - len;
      break;
    case 270: // Vertical up
      newP2.x = p1.x;
      newP2.y = p1.y - len;
      break;
  }

  return newP2;
}

/**
 * Adjust a path (array of points) to be orthogonal
 * @param {Array} points - Array of points [{x, y}, ...]
 * @param {number} threshold - Angle threshold in degrees
 * @returns {Array} - Adjusted points
 */
export function adjustPathToOrtho(points, threshold = 5) {
  if (points.length < 2) return points;

  const adjusted = [{ ...points[0] }]; // Keep first point

  for (let i = 1; i < points.length; i++) {
    const prev = adjusted[i - 1];
    const curr = points[i];

    const adjustedPoint = adjustLineToOrtho(prev, curr, threshold);
    adjusted.push(adjustedPoint);
  }

  return adjusted;
}

/**
 * Adjust multiple contours to be orthogonal
 * @param {Array} contours - Array of contours, each with points array
 * @param {number} threshold - Angle threshold in degrees
 * @returns {Array} - Adjusted contours
 */
export function adjustContoursToOrtho(contours, threshold = 5) {
  return contours.map((contour) => ({
    ...contour,
    points: adjustPathToOrtho(contour.points, threshold),
  }));
}

/**
 * Snap point to grid
 * @param {Object} point - Point {x, y}
 * @param {number} gridSize - Grid size in pixels
 * @returns {Object} - Snapped point
 */
export function snapToGrid(point, gridSize) {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

/**
 * Apply ortho adjustment with grid snapping
 * @param {Array} points - Array of points
 * @param {number} threshold - Angle threshold
 * @param {number} gridSize - Grid size (0 to disable)
 * @returns {Array} - Adjusted and snapped points
 */
export function adjustPathWithGrid(points, threshold = 5, gridSize = 0) {
  let adjusted = adjustPathToOrtho(points, threshold);

  if (gridSize > 0) {
    adjusted = adjusted.map((p) => snapToGrid(p, gridSize));
  }

  return adjusted;
}

/**
 * Calculate total angle deviation from orthogonal
 * Useful for quality metrics
 * @param {Array} points - Array of points
 * @returns {number} - Total deviation in degrees
 */
export function calculateOrthoDeviation(points) {
  if (points.length < 2) return 0;

  let totalDeviation = 0;

  for (let i = 1; i < points.length; i++) {
    const angle = calculateAngle(points[i - 1], points[i]);
    const nearest = nearestOrthoAngle(angle);
    totalDeviation += Math.abs(angle - nearest);
  }

  return totalDeviation;
}

/**
 * Test if a path is already orthogonal
 * @param {Array} points - Array of points
 * @param {number} threshold - Angle threshold
 * @returns {boolean}
 */
export function isPathOrtho(points, threshold = 0.1) {
  return calculateOrthoDeviation(points) < threshold * (points.length - 1);
}
