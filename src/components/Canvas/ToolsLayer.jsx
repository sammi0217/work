import { Line, Circle, Text } from 'react-konva';
import { useImageStore } from '../../stores/imageStore';
import { LAYERS, useCanvasStore } from '../../stores/canvasStore';
import { distance } from '../../utils/ortho/orthoAdjuster';
import { formatMeasurement } from '../../utils/image/scaleCalibration';

/**
 * Tools Layer Component
 *
 * Displays UI overlays:
 * - Scale calibration line
 * - Coordinate axes
 * - Selection tools
 */
function ToolsLayer() {
  const scale = useImageStore((state) => state.scale);
  const layerVisible = useCanvasStore((state) => state.layerVisibility[LAYERS.UI]);

  if (!layerVisible) {
    return null;
  }

  return (
    <>
      {/* Scale Calibration Line */}
      {scale.calibrationLine && <CalibrationLine line={scale.calibrationLine} scale={scale} />}
    </>
  );
}

/**
 * Calibration Line Display
 */
function CalibrationLine({ line, scale }) {
  const pixelLength = distance({ x: line.x1, y: line.y1 }, { x: line.x2, y: line.y2 });

  const realLength = scale.pixelsPerUnit ? pixelLength / scale.pixelsPerUnit : 0;

  return (
    <>
      {/* Line */}
      <Line
        points={[line.x1, line.y1, line.x2, line.y2]}
        stroke="#ff6b00"
        strokeWidth={3}
        dash={[10, 5]}
      />

      {/* Start point */}
      <Circle x={line.x1} y={line.y1} radius={5} fill="#ff6b00" />

      {/* End point */}
      <Circle x={line.x2} y={line.y2} radius={5} fill="#ff6b00" />

      {/* Label */}
      {realLength > 0 && (
        <Text
          x={(line.x1 + line.x2) / 2}
          y={(line.y1 + line.y2) / 2 - 20}
          text={formatMeasurement(realLength, scale.unit)}
          fontSize={16}
          fill="#ff6b00"
          fontStyle="bold"
        />
      )}
    </>
  );
}

export default ToolsLayer;
