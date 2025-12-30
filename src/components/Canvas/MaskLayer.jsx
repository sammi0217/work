import { useState } from 'react';
import { Line, Group, Rect } from 'react-konva';
import { useImageStore } from '../../stores/imageStore';
import { useAppStore, TOOLS } from '../../stores/appStore';

/**
 * Mask Layer Component
 *
 * Allows users to erase unwanted parts of the image
 * Red lines indicate areas that will be removed
 */
function MaskLayer() {
  const currentTool = useAppStore((state) => state.currentTool);
  const brushSize = useAppStore((state) => state.brushSize);
  const imageDimensions = useImageStore((state) => state.imageDimensions);
  const pushHistory = useImageStore((state) => state.pushHistory);

  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleMouseDown = (e) => {
    if (currentTool !== TOOLS.ERASE) return;

    setIsDrawing(true);
    pushHistory();

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const localPos = transform.point(pos);

    setLines([...lines, { points: [localPos.x, localPos.y], brushSize }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || currentTool !== TOOLS.ERASE) return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const localPos = transform.point(pos);

    const lastLine = lines[lines.length - 1];
    if (lastLine) {
      lastLine.points = lastLine.points.concat([localPos.x, localPos.y]);
      setLines([...lines.slice(0, -1), lastLine]);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  if (!imageDimensions.width || !imageDimensions.height) {
    return null;
  }

  return (
    <Group>
      {/* Invisible rect to capture mouse events */}
      <Rect
        x={0}
        y={0}
        width={imageDimensions.width}
        height={imageDimensions.height}
        fill="transparent"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Render erase lines */}
      {lines.map((line, i) => (
        <Line
          key={i}
          points={line.points}
          stroke="rgba(255, 0, 0, 0.6)"
          strokeWidth={line.brushSize}
          tension={0}
          lineCap="round"
          lineJoin="round"
          listening={false}
        />
      ))}
    </Group>
  );
}

export default MaskLayer;
