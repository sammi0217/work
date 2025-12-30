import { useState, useEffect } from 'react';
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

  // Listen for clear event
  useEffect(() => {
    const handleClear = () => {
      setLines([]);
    };

    window.addEventListener('clearEraserMarks', handleClear);
    return () => window.removeEventListener('clearEraserMarks', handleClear);
  }, []);

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

    // Apply mask to processed image
    if (lines.length > 0) {
      applyMaskToImage(lines);
    }
  };

  // Apply mask to the processed image
  const applyMaskToImage = (maskLines) => {
    if (!imageDimensions.width || !imageDimensions.height) return;

    const processedImageData = useImageStore.getState().processedImageData;
    if (!processedImageData) return;

    // Create a copy of the processed image
    const canvas = document.createElement('canvas');
    canvas.width = imageDimensions.width;
    canvas.height = imageDimensions.height;
    const ctx = canvas.getContext('2d');

    // Draw the processed image
    ctx.putImageData(processedImageData, 0, 0);

    // Draw white (255) over the masked areas
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    maskLines.forEach((line) => {
      if (line.points.length < 2) return;

      ctx.lineWidth = line.brushSize;
      ctx.beginPath();
      ctx.moveTo(line.points[0], line.points[1]);

      for (let i = 2; i < line.points.length; i += 2) {
        ctx.lineTo(line.points[i], line.points[i + 1]);
      }

      ctx.stroke();
    });

    // Get the modified image data
    const modifiedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Update the processed image
    useImageStore.getState().setProcessedImageData(modifiedImageData);
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
