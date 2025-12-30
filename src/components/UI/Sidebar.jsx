import { useEffect, useRef, useState } from 'react';
import { Settings, ChevronLeft, ChevronRight, Zap, ZapOff } from 'lucide-react';
import { useAppStore, PRESETS } from '../../stores/appStore';
import { useImageProcessor } from '../../hooks/useImageProcessor';
import { useImageStore } from '../../stores/imageStore';
import { adjustContoursToOrtho } from '../../utils/ortho/orthoAdjuster';

/**
 * Sidebar Component
 *
 * Parameter controls for image processing
 */
function Sidebar() {
  const leftPanelOpen = useAppStore((state) => state.leftPanelOpen);
  const setLeftPanelOpen = useAppStore((state) => state.setLeftPanelOpen);

  const preset = useAppStore((state) => state.preset);
  const setPreset = useAppStore((state) => state.setPreset);

  const threshold = useAppStore((state) => state.threshold);
  const setThreshold = useAppStore((state) => state.setThreshold);

  const morphologySize = useAppStore((state) => state.morphologySize);
  const setMorphologySize = useAppStore((state) => state.setMorphologySize);

  const morphologyIterations = useAppStore((state) => state.morphologyIterations);
  const setMorphologyIterations = useAppStore((state) => state.setMorphologyIterations);

  const blurSize = useAppStore((state) => state.blurSize);
  const setBlurSize = useAppStore((state) => state.setBlurSize);

  const smoothness = useAppStore((state) => state.smoothness);
  const setSmoothness = useAppStore((state) => state.setSmoothness);

  const orthoEnabled = useAppStore((state) => state.orthoEnabled);
  const orthoThreshold = useAppStore((state) => state.orthoThreshold);
  const setOrthoThreshold = useAppStore((state) => state.setOrthoThreshold);

  const { processImage, findContours, isReady } = useImageProcessor();
  const originalImageData = useImageStore((state) => state.originalImageData);
  const setProcessedImageData = useImageStore((state) => state.setProcessedImageData);
  const setVectorData = useImageStore((state) => state.setVectorData);

  // Auto-process toggle
  const [autoProcess, setAutoProcess] = useState(true);
  const debounceTimerRef = useRef(null);

  const handleProcess = async () => {
    if (!originalImageData || !isReady) return;

    try {
      const params = {
        threshold,
        morphologySize,
        morphologyIterations,
        blurSize,
        smoothness,
      };

      const processed = await processImage(originalImageData, params);
      setProcessedImageData(processed);
    } catch (error) {
      console.error('Processing error:', error);
      alert('Error processing image: ' + error.message);
    }
  };

  const handleVectorize = async () => {
    const processedImageData = useImageStore.getState().processedImageData;
    if (!processedImageData || !isReady) return;

    try {
      let contours = await findContours(processedImageData, smoothness);

      // Apply ortho correction if enabled
      if (orthoEnabled) {
        contours = adjustContoursToOrtho(contours, orthoThreshold);
      }

      setVectorData(contours);
    } catch (error) {
      console.error('Vectorization error:', error);
      alert('Error vectorizing image: ' + error.message);
    }
  };

  // Auto-process when parameters change
  useEffect(() => {
    if (!autoProcess || !originalImageData || !isReady) return;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer (debounce 500ms)
    debounceTimerRef.current = setTimeout(() => {
      handleProcess();
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [threshold, morphologySize, morphologyIterations, blurSize, autoProcess, originalImageData, isReady]);

  if (!leftPanelOpen) {
    return (
      <button
        onClick={() => setLeftPanelOpen(true)}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 p-2 rounded-r-lg hover:bg-gray-700 z-10"
      >
        <ChevronRight size={20} />
      </button>
    );
  }

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto scrollbar-thin">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings size={20} />
            Processing Settings
          </h2>
          <button onClick={() => setLeftPanelOpen(false)} className="toolbar-button">
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Auto-Process Toggle */}
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2 text-sm font-medium">
              {autoProcess ? <Zap size={16} className="text-yellow-500" /> : <ZapOff size={16} />}
              Auto Preview
            </span>
            <button
              onClick={() => setAutoProcess(!autoProcess)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoProcess ? 'bg-primary-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoProcess ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
          <p className="text-xs text-gray-400 mt-1">
            {autoProcess ? 'Parameters update in real-time' : 'Click "Process Image" to apply changes'}
          </p>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Preset</label>
          <select value={preset} onChange={(e) => setPreset(e.target.value)} className="input w-full">
            <option value={PRESETS.HAND_DRAWN}>Hand Drawn</option>
            <option value={PRESETS.CAD_SCREENSHOT}>CAD Screenshot</option>
            <option value={PRESETS.SCANNED_CLEAN}>Scanned Clean</option>
            <option value={PRESETS.CUSTOM}>Custom</option>
          </select>
        </div>

        {/* Threshold */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Threshold: <span className="text-primary-400">{threshold}</span>
          </label>
          <input
            type="range"
            min="0"
            max="255"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-400 mt-1">Adjust to separate lines from background</p>
        </div>

        {/* Blur Size */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Blur Size: <span className="text-primary-400">{blurSize}</span>
          </label>
          <input
            type="range"
            min="0"
            max="9"
            step="2"
            value={blurSize}
            onChange={(e) => setBlurSize(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-400 mt-1">Reduce noise before processing</p>
        </div>

        {/* Morphology Size */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Morphology Size: <span className="text-primary-400">{morphologySize}</span>
          </label>
          <input
            type="range"
            min="1"
            max="11"
            step="2"
            value={morphologySize}
            onChange={(e) => setMorphologySize(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-400 mt-1">Connect broken lines</p>
        </div>

        {/* Morphology Iterations */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Morphology Iterations: <span className="text-primary-400">{morphologyIterations}</span>
          </label>
          <input
            type="range"
            min="0"
            max="5"
            value={morphologyIterations}
            onChange={(e) => setMorphologyIterations(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Smoothness */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Smoothness: <span className="text-primary-400">{smoothness.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={smoothness}
            onChange={(e) => setSmoothness(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-400 mt-1">Higher = smoother paths, fewer points</p>
        </div>

        {/* Ortho Correction */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Ortho Threshold: <span className="text-primary-400">{orthoThreshold}°</span>
          </label>
          <input
            type="range"
            min="0"
            max="15"
            value={orthoThreshold}
            onChange={(e) => setOrthoThreshold(Number(e.target.value))}
            className="w-full"
            disabled={!orthoEnabled}
          />
          <p className="text-xs text-gray-400 mt-1">Snap lines to 90° if within threshold</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button onClick={handleProcess} disabled={!originalImageData || !isReady} className="btn btn-primary w-full">
            Process Image
          </button>

          <button
            onClick={handleVectorize}
            disabled={!useImageStore.getState().processedImageData || !isReady}
            className="btn btn-primary w-full"
          >
            Vectorize
          </button>
        </div>

        {/* Worker Status */}
        {!isReady && (
          <div className="mt-4 text-sm text-yellow-500">
            Loading OpenCV.js...
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
