import { Line } from 'react-konva';
import { useImageStore } from '../../stores/imageStore';
import { LAYERS, useCanvasStore } from '../../stores/canvasStore';

/**
 * Vector Layer Component
 *
 * Displays vectorized contours as clean paths
 */
function VectorLayer() {
  const vectorData = useImageStore((state) => state.vectorData);
  const layerVisible = useCanvasStore((state) => state.layerVisibility[LAYERS.VECTOR]);

  if (!vectorData || !layerVisible) {
    return null;
  }

  return (
    <>
      {vectorData.map((contour, index) => {
        // Flatten points array for Konva
        const points = contour.points.flatMap((p) => [p.x, p.y]);

        return (
          <Line
            key={`contour-${index}`}
            points={points}
            stroke="#00ff00"
            strokeWidth={2}
            closed={true}
            listening={false}
            opacity={0.8}
          />
        );
      })}
    </>
  );
}

export default VectorLayer;
