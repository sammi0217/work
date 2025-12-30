import { create } from 'zustand';

/**
 * Main Application Store
 *
 * Manages global app state including:
 * - Current tool/mode
 * - Processing parameters
 * - UI state
 * - Progress tracking
 */

export const TOOLS = {
  SELECT: 'select',
  ERASE: 'erase',
  MAGIC_WAND: 'magic_wand',
  SCALE: 'scale',
  VECTORIZE: 'vectorize',
  PAN: 'pan',
  ZOOM: 'zoom',
};

export const PRESETS = {
  HAND_DRAWN: 'hand_drawn',
  CAD_SCREENSHOT: 'cad_screenshot',
  SCANNED_CLEAN: 'scanned_clean',
  CUSTOM: 'custom',
};

const presetConfigs = {
  [PRESETS.HAND_DRAWN]: {
    threshold: 180,
    morphologySize: 3,
    morphologyIterations: 2,
    blurSize: 3,
    smoothness: 0.8,
  },
  [PRESETS.CAD_SCREENSHOT]: {
    threshold: 200,
    morphologySize: 1,
    morphologyIterations: 1,
    blurSize: 1,
    smoothness: 0.3,
  },
  [PRESETS.SCANNED_CLEAN]: {
    threshold: 160,
    morphologySize: 2,
    morphologyIterations: 1,
    blurSize: 2,
    smoothness: 0.5,
  },
  [PRESETS.CUSTOM]: {
    threshold: 128,
    morphologySize: 2,
    morphologyIterations: 1,
    blurSize: 2,
    smoothness: 0.5,
  },
};

export const useAppStore = create((set, get) => ({
  // Current tool
  currentTool: TOOLS.SELECT,
  setCurrentTool: (tool) => set({ currentTool: tool }),

  // Brush size for erase tool
  brushSize: 20,
  setBrushSize: (size) => set({ brushSize: Math.max(1, Math.min(200, size)) }),

  // Processing preset
  preset: PRESETS.CUSTOM,
  setPreset: (preset) =>
    set({
      preset,
      ...presetConfigs[preset],
    }),

  // Processing parameters
  threshold: 128,
  setThreshold: (threshold) => set({ threshold, preset: PRESETS.CUSTOM }),

  morphologySize: 2,
  setMorphologySize: (size) => set({ morphologySize: size, preset: PRESETS.CUSTOM }),

  morphologyIterations: 1,
  setMorphologyIterations: (iterations) => set({ morphologyIterations: iterations, preset: PRESETS.CUSTOM }),

  blurSize: 2,
  setBlurSize: (size) => set({ blurSize: size, preset: PRESETS.CUSTOM }),

  smoothness: 0.5, // 0-1, for RDP algorithm epsilon
  setSmoothness: (smoothness) => set({ smoothness, preset: PRESETS.CUSTOM }),

  // Smart cleanup settings
  removeSmallObjects: true,
  setRemoveSmallObjects: (enabled) => set({ removeSmallObjects: enabled }),

  minObjectSize: 200, // Minimum object size to keep (pixels²)
  setMinObjectSize: (size) => set({ minObjectSize: size }),

  // Ortho correction settings
  orthoEnabled: true,
  setOrthoEnabled: (enabled) => set({ orthoEnabled: enabled }),

  orthoThreshold: 5, // degrees
  setOrthoThreshold: (threshold) => set({ orthoThreshold: threshold }),

  // UI State
  leftPanelOpen: true,
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),

  rightPanelOpen: true,
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),

  // Processing state
  isProcessing: false,
  setIsProcessing: (processing) => set({ isProcessing: processing }),

  processingProgress: 0,
  setProcessingProgress: (progress) => set({ processingProgress: progress }),

  processingMessage: '',
  setProcessingMessage: (message) => set({ processingMessage: message }),

  // Dark mode
  darkMode: true,
  setDarkMode: (dark) => set({ darkMode: dark }),
}));
