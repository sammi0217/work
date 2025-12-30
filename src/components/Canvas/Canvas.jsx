import { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { useCanvasStore } from '../../stores/canvasStore';
import { useImageStore } from '../../stores/imageStore';
import { useAppStore, TOOLS } from '../../stores/appStore';
import BackgroundLayer from './BackgroundLayer';
import MaskLayer from './MaskLayer';
import VectorLayer from './VectorLayer';
import ToolsLayer from './ToolsLayer';

/**
 * Main Canvas Component
 *
 * Multi-layer canvas system using React-Konva:
 * - Background layer (original image)
 * - Vector layer (vectorized paths)
 * - Tools layer (UI overlays, scale, etc.)
 */
function Canvas() {
  const stageRef = useRef(null);
  const containerRef = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Canvas state
  const scale = useCanvasStore((state) => state.scale);
  const position = useCanvasStore((state) => state.position);
  const setScale = useCanvasStore((state) => state.setScale);
  const setPosition = useCanvasStore((state) => state.setPosition);
  const setCanvasSize = useCanvasStore((state) => state.setCanvasSize);
  const isSpacePressed = useCanvasStore((state) => state.isSpacePressed);
  const setIsSpacePressed = useCanvasStore((state) => state.setIsSpacePressed);

  // App state
  const currentTool = useAppStore((state) => state.currentTool);

  // Image state
  const originalImage = useImageStore((state) => state.originalImage);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        setCanvasSize({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, [setCanvasSize]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Space for panning
      if (e.code === 'Space' && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
      }

      // Zoom shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.code === 'Equal' || e.code === 'NumpadAdd') {
          e.preventDefault();
          setScale(scale * 1.2);
        } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
          e.preventDefault();
          setScale(scale / 1.2);
        } else if (e.code === 'Digit0' || e.code === 'Numpad0') {
          e.preventDefault();
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [scale, isSpacePressed, setScale, setPosition, setIsSpacePressed]);

  // Handle wheel zoom
  const handleWheel = (e) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / 1.1 : oldScale * 1.1;

    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  // Handle drag for panning
  const handleDragEnd = (e) => {
    setPosition({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const canDrag = isSpacePressed || currentTool === TOOLS.PAN;

  if (!dimensions.width || !dimensions.height) {
    return (
      <div ref={containerRef} className="flex-1 bg-gray-900">
        <div className="flex items-center justify-center h-full text-gray-500">
          Initializing canvas...
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 bg-gray-900 overflow-hidden">
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable={canDrag}
        onDragEnd={handleDragEnd}
        onWheel={handleWheel}
        style={{
          cursor: canDrag ? 'grab' : 'default',
        }}
      >
        {/* Background Layer */}
        <Layer>
          <BackgroundLayer />
        </Layer>

        {/* Mask/Erase Layer */}
        <Layer>
          <MaskLayer />
        </Layer>

        {/* Vector Layer */}
        <Layer>
          <VectorLayer />
        </Layer>

        {/* Tools/UI Layer */}
        <Layer>
          <ToolsLayer />
        </Layer>
      </Stage>

      {/* No image message */}
      {!originalImage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-gray-500 text-center">
            <p className="text-xl mb-2">No image loaded</p>
            <p className="text-sm">Upload an image to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Canvas;
