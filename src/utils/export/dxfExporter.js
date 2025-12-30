/**
 * DXF Export Utilities
 *
 * Export vectorized floor plans as DXF (Drawing Exchange Format)
 * Compatible with AutoCAD, SketchUp, and other CAD software
 */

import { scaleContourPoints } from '../image/scaleCalibration';

/**
 * Create DXF file from contours
 * @param {Array} contours - Array of contours with points
 * @param {Object} options - Export options
 * @returns {string} DXF file content
 */
export function createDXF(contours, options = {}) {
  const {
    scale = null,
    layerName = 'FLOORPLAN',
    applyScale = true,
    units = 'Metric', // 'Metric' or 'Imperial'
  } = options;

  let dxf = '';

  // Header Section
  dxf += createHeader(units);

  // Tables Section
  dxf += createTables(layerName);

  // Entities Section
  dxf += '0\nSECTION\n2\nENTITIES\n';

  contours.forEach((contour, index) => {
    let points = contour.points;

    // Apply scale if requested and available
    if (applyScale && scale && scale.pixelsPerUnit) {
      points = scaleContourPoints(points, scale.pixelsPerUnit);
    }

    // Create LWPOLYLINE entity for each contour
    dxf += createPolyline(points, layerName);
  });

  dxf += '0\nENDSEC\n';

  // End of file
  dxf += '0\nEOF\n';

  return dxf;
}

/**
 * Create DXF header section
 */
function createHeader(units) {
  const insunits = units === 'Imperial' ? 1 : 4; // 1 = Inches, 4 = Millimeters

  return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
9
$INSUNITS
70
${insunits}
9
$MEASUREMENT
70
${units === 'Imperial' ? 0 : 1}
0
ENDSEC
`;
}

/**
 * Create DXF tables section
 */
function createTables(layerName) {
  return `0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
1
0
LAYER
2
${layerName}
70
0
62
7
6
CONTINUOUS
0
ENDTAB
0
ENDSEC
`;
}

/**
 * Create LWPOLYLINE entity
 */
function createPolyline(points, layerName) {
  if (points.length < 2) return '';

  let polyline = `0
LWPOLYLINE
8
${layerName}
90
${points.length}
70
1
`;

  // Add vertices
  points.forEach((point) => {
    polyline += `10
${point.x.toFixed(6)}
20
${point.y.toFixed(6)}
`;
  });

  return polyline;
}

/**
 * Create LINE entity (alternative to polyline)
 */
function createLine(p1, p2, layerName) {
  return `0
LINE
8
${layerName}
10
${p1.x.toFixed(6)}
20
${p1.y.toFixed(6)}
11
${p2.x.toFixed(6)}
21
${p2.y.toFixed(6)}
`;
}

/**
 * Create DXF with individual lines instead of polylines
 * @param {Array} contours - Array of contours
 * @param {Object} options - Export options
 * @returns {string} DXF content
 */
export function createDXFWithLines(contours, options = {}) {
  const {
    scale = null,
    layerName = 'FLOORPLAN',
    applyScale = true,
    units = 'Metric',
  } = options;

  let dxf = '';

  // Header Section
  dxf += createHeader(units);

  // Tables Section
  dxf += createTables(layerName);

  // Entities Section
  dxf += '0\nSECTION\n2\nENTITIES\n';

  contours.forEach((contour) => {
    let points = contour.points;

    // Apply scale if requested and available
    if (applyScale && scale && scale.pixelsPerUnit) {
      points = scaleContourPoints(points, scale.pixelsPerUnit);
    }

    // Create individual lines
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length]; // Wrap around

      dxf += createLine(p1, p2, layerName);
    }
  });

  dxf += '0\nENDSEC\n';

  // End of file
  dxf += '0\nEOF\n';

  return dxf;
}

/**
 * Create DXF with multiple layers
 * @param {Object} layers - Object with layer names and contours
 * @param {Object} options - Export options
 * @returns {string} DXF content
 */
export function createLayeredDXF(layers, options = {}) {
  const { scale = null, applyScale = true, units = 'Metric' } = options;

  let dxf = '';

  // Header
  dxf += createHeader(units);

  // Tables - create layer for each
  dxf += '0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n' + Object.keys(layers).length + '\n';

  Object.keys(layers).forEach((layerName, index) => {
    dxf += `0
LAYER
2
${layerName}
70
0
62
${(index % 7) + 1}
6
CONTINUOUS
`;
  });

  dxf += '0\nENDTAB\n0\nENDSEC\n';

  // Entities
  dxf += '0\nSECTION\n2\nENTITIES\n';

  Object.entries(layers).forEach(([layerName, contours]) => {
    contours.forEach((contour) => {
      let points = contour.points;

      if (applyScale && scale && scale.pixelsPerUnit) {
        points = scaleContourPoints(points, scale.pixelsPerUnit);
      }

      dxf += createPolyline(points, layerName);
    });
  });

  dxf += '0\nENDSEC\n';
  dxf += '0\nEOF\n';

  return dxf;
}

/**
 * Download DXF file
 * @param {string} dxfContent - DXF content
 * @param {string} filename - Output filename
 */
export function downloadDXF(dxfContent, filename = 'floorplan.dxf') {
  const blob = new Blob([dxfContent], { type: 'application/dxf' });
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
 * Validate DXF export options
 */
export function validateDXFOptions(options) {
  const errors = [];

  if (options.units && !['Metric', 'Imperial'].includes(options.units)) {
    errors.push('Units must be "Metric" or "Imperial"');
  }

  if (options.scale && options.scale.pixelsPerUnit <= 0) {
    errors.push('Invalid scale: pixels per unit must be positive');
  }

  return errors;
}
