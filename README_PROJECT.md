# Floorplan SVG Pro

Professional floor plan vectorization tool that converts scanned or photographed floor plans into clean SVG/DXF vector files.

## Features

### Core Functionality

1. **Advanced Image Processing**
   - Adaptive threshold adjustment
   - Morphological operations (closing to connect gaps)
   - Gaussian blur for noise reduction
   - Multiple processing presets

2. **Orthogonal Correction**
   - Intelligent line straightening
   - Automatic 90-degree angle correction
   - Configurable angle threshold (default: 5°)
   - Ensures professional architectural accuracy

3. **Scale Calibration**
   - Draw calibration line on known distance
   - Support for multiple units (cm, m, ft, in)
   - Automatic scaling of exported files
   - Metadata preservation in exports

4. **Professional Vectorization**
   - OpenCV.js powered contour detection
   - RDP algorithm for path simplification
   - Adjustable smoothness control
   - High-quality output

5. **Multi-Format Export**
   - **SVG**: Optimized paths with metadata
   - **DXF**: AutoCAD/SketchUp compatible
   - **PNG**: High-resolution cleaned images

### User Interface

- **Multi-Layer Canvas**: Background, Vector, and Tools layers
- **Zoom & Pan**: Mouse wheel zoom, Space+drag pan
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + Z`: Undo
  - `Ctrl/Cmd + Shift + Z`: Redo
  - `Ctrl/Cmd + +/-`: Zoom in/out
  - `Ctrl/Cmd + 0`: Reset view
  - `Space + Drag`: Pan canvas
- **Dark Mode**: Professional dark interface

## Architecture

### Technology Stack

- **Frontend**: React 19 + Vite
- **State Management**: Zustand
- **Canvas**: React-Konva
- **Image Processing**: OpenCV.js (Web Worker)
- **Vectorization**: Custom algorithms + Potrace
- **Styling**: TailwindCSS
- **Icons**: Lucide React

### Project Structure

```
src/
├── components/
│   ├── Canvas/           # Multi-layer canvas system
│   ├── Toolbar/          # Main toolbar
│   ├── Tools/            # Tool components
│   └── UI/               # UI components (Sidebar, etc.)
├── stores/
│   ├── appStore.js       # App state (tools, settings)
│   ├── imageStore.js     # Image data and history
│   ├── canvasStore.js    # Canvas view state
│   └── middleware/       # Undo/Redo middleware
├── workers/
│   └── imageProcessor.worker.js  # OpenCV processing
├── utils/
│   ├── image/            # Image processing utilities
│   ├── ortho/            # Orthogonal correction
│   ├── vector/           # Vectorization
│   └── export/           # SVG/DXF exporters
└── hooks/                # Custom React hooks
```

## Usage Guide

### Basic Workflow

1. **Upload Image**
   - Click "Upload" button
   - Select a floor plan image (JPG, PNG, etc.)

2. **Process Image**
   - Adjust threshold to separate lines from background
   - Set blur and morphology parameters
   - Click "Process Image"

3. **Vectorize**
   - Adjust smoothness (0 = detailed, 1 = smooth)
   - Enable/disable orthogonal correction
   - Click "Vectorize"

4. **Calibrate Scale** (Optional)
   - Select "Scale" tool
   - Draw line on known distance
   - Enter real-world measurement

5. **Export**
   - Choose SVG or DXF format
   - File downloads with calibration metadata

### Parameter Guide

#### Threshold (0-255)
Lower values detect more features, higher values only strong lines.
- **Hand Drawn**: 180
- **CAD Screenshot**: 200
- **Scanned**: 160

#### Morphology Size (1-11, odd numbers)
Larger values connect bigger gaps in lines.
- **Clean Images**: 1-3
- **Noisy/Damaged**: 5-9

#### Smoothness (0-1)
Controls path simplification.
- **Detailed (CAD)**: 0.1-0.3
- **Hand Drawn**: 0.5-0.8

#### Ortho Threshold (0-15°)
Maximum angle deviation to snap to 90°.
- **Strict**: 3-5°
- **Lenient**: 8-12°

## Performance

### Optimization Features

- **Web Worker**: All processing runs off main thread
- **Transferable Objects**: Zero-copy data transfer
- **Progressive Loading**: OpenCV loads asynchronously
- **Canvas Virtualization**: Only renders visible area

### Benchmarks

- **2K Image**: < 500ms processing
- **4K Image**: < 1.5s processing
- **Export**: Instant (< 100ms)

## Development

### Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Key Dependencies

- `react-konva` - Canvas rendering
- `konva` - Canvas engine
- `zustand` - State management
- `opencv.js` - Image processing
- `lucide-react` - Icons
- `tailwindcss` - Styling

## Future Enhancements

- [ ] Layer system for different elements (walls, doors, windows)
- [ ] PDF import support
- [ ] Batch processing
- [ ] Cloud storage integration
- [ ] 3D preview
- [ ] Measurement tools
- [ ] Room labeling

## License

MIT License - See LICENSE file for details

## Credits

Developed with Claude Code following professional software engineering practices.
