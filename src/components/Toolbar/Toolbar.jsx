import {
  Upload,
  Download,
  Settings,
  Eraser,
  Wand2,
  Ruler,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Grid,
  Play,
} from 'lucide-react';
import { useAppStore, TOOLS } from '../../stores/appStore';
import { useImageStore } from '../../stores/imageStore';
import { useCanvasStore } from '../../stores/canvasStore';
import { createSVG, downloadSVG } from '../../utils/export/svgExporter';
import { createDXF, downloadDXF } from '../../utils/export/dxfExporter';

/**
 * Main Toolbar Component
 */
function Toolbar() {
  const currentTool = useAppStore((state) => state.currentTool);
  const setCurrentTool = useAppStore((state) => state.setCurrentTool);
  const orthoEnabled = useAppStore((state) => state.orthoEnabled);
  const setOrthoEnabled = useAppStore((state) => state.setOrthoEnabled);

  const vectorData = useImageStore((state) => state.vectorData);
  const scale = useImageStore((state) => state.scale);
  const canUndo = useImageStore((state) => state.canUndo());
  const canRedo = useImageStore((state) => state.canRedo());
  const undo = useImageStore((state) => state.undo);
  const redo = useImageStore((state) => state.redo);

  const zoomIn = useCanvasStore((state) => state.zoomIn);
  const zoomOut = useCanvasStore((state) => state.zoomOut);
  const resetView = useCanvasStore((state) => state.resetView);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        useImageStore.getState().setOriginalImage(event.target.result, imageData);
        useImageStore.getState().setImageDimensions({ width: img.width, height: img.height });

        // Fit to screen
        useCanvasStore.getState().fitToScreen(img.width, img.height);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleExportSVG = () => {
    if (!vectorData || vectorData.length === 0) {
      alert('No vector data to export. Please vectorize the image first.');
      return;
    }

    const svg = createSVG(vectorData, {
      scale,
      title: 'Floor Plan',
      description: 'Vectorized floor plan from Floorplan SVG Pro',
    });

    downloadSVG(svg, 'floorplan.svg');
  };

  const handleExportDXF = () => {
    if (!vectorData || vectorData.length === 0) {
      alert('No vector data to export. Please vectorize the image first.');
      return;
    }

    const dxf = createDXF(vectorData, {
      scale,
      layerName: 'FLOORPLAN',
    });

    downloadDXF(dxf, 'floorplan.dxf');
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left Section - File Operations */}
        <div className="flex items-center gap-2">
          <label className="btn btn-primary cursor-pointer flex items-center gap-2">
            <Upload size={18} />
            <span>Upload</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="flex items-center gap-1 border-l border-gray-700 pl-2">
            <button onClick={handleExportSVG} className="btn btn-secondary flex items-center gap-2" title="Export as SVG">
              <Download size={18} />
              SVG
            </button>
            <button onClick={handleExportDXF} className="btn btn-secondary flex items-center gap-2" title="Export as DXF">
              <Download size={18} />
              DXF
            </button>
          </div>
        </div>

        {/* Center Section - Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentTool(TOOLS.ERASE)}
            className={`toolbar-button ${currentTool === TOOLS.ERASE ? 'active' : ''}`}
            title="Eraser Tool"
          >
            <Eraser size={20} />
          </button>

          <button
            onClick={() => setCurrentTool(TOOLS.MAGIC_WAND)}
            className={`toolbar-button ${currentTool === TOOLS.MAGIC_WAND ? 'active' : ''}`}
            title="Magic Wand"
          >
            <Wand2 size={20} />
          </button>

          <button
            onClick={() => setCurrentTool(TOOLS.SCALE)}
            className={`toolbar-button ${currentTool === TOOLS.SCALE ? 'active' : ''}`}
            title="Scale Calibration"
          >
            <Ruler size={20} />
          </button>

          <button
            onClick={() => setCurrentTool(TOOLS.VECTORIZE)}
            className={`toolbar-button ${currentTool === TOOLS.VECTORIZE ? 'active' : ''}`}
            title="Vectorize"
          >
            <Play size={20} />
          </button>

          <div className="border-l border-gray-700 mx-2 h-6" />

          <button
            onClick={() => setOrthoEnabled(!orthoEnabled)}
            className={`toolbar-button ${orthoEnabled ? 'active' : ''}`}
            title="Orthogonal Correction"
          >
            <Grid size={20} />
          </button>
        </div>

        {/* Right Section - View Controls */}
        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={!canUndo} className="toolbar-button" title="Undo">
            <Undo size={20} />
          </button>

          <button onClick={redo} disabled={!canRedo} className="toolbar-button" title="Redo">
            <Redo size={20} />
          </button>

          <div className="border-l border-gray-700 mx-2 h-6" />

          <button onClick={zoomIn} className="toolbar-button" title="Zoom In">
            <ZoomIn size={20} />
          </button>

          <button onClick={zoomOut} className="toolbar-button" title="Zoom Out">
            <ZoomOut size={20} />
          </button>

          <button onClick={resetView} className="toolbar-button" title="Reset View">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
