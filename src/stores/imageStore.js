import { create } from 'zustand';

/**
 * Image Store
 *
 * Manages image data and processing state:
 * - Original image
 * - Processed image
 * - Mask layer (for erasing)
 * - Vector data
 * - Scale calibration
 */

export const useImageStore = create((set, get) => ({
  // Original image data
  originalImage: null,
  originalImageData: null,
  setOriginalImage: (image, imageData) =>
    set({
      originalImage: image,
      originalImageData: imageData,
      processedImageData: null,
      maskImageData: null,
      vectorData: null,
    }),

  // Processed image data (after threshold, morphology, etc.)
  processedImageData: null,
  setProcessedImageData: (imageData) => set({ processedImageData: imageData }),

  // Mask layer (for erasing/editing)
  maskImageData: null,
  setMaskImageData: (imageData) => set({ maskImageData: imageData }),

  // Vector data (contours, paths)
  vectorData: null,
  setVectorData: (data) => set({ vectorData: data }),

  // Scale calibration
  scale: {
    pixelsPerUnit: null, // pixels per cm/m/ft/etc
    unit: 'cm', // cm, m, ft, in
    calibrationLine: null, // { x1, y1, x2, y2, realLength }
  },
  setScale: (scale) =>
    set((state) => ({
      scale: { ...state.scale, ...scale },
    })),

  resetScale: () =>
    set({
      scale: {
        pixelsPerUnit: null,
        unit: 'cm',
        calibrationLine: null,
      },
    }),

  // Image dimensions
  imageDimensions: { width: 0, height: 0 },
  setImageDimensions: (dimensions) => set({ imageDimensions: dimensions }),

  // Clear all image data
  clearAll: () =>
    set({
      originalImage: null,
      originalImageData: null,
      processedImageData: null,
      maskImageData: null,
      vectorData: null,
      scale: {
        pixelsPerUnit: null,
        unit: 'cm',
        calibrationLine: null,
      },
      imageDimensions: { width: 0, height: 0 },
    }),

  // History for undo/redo (simplified - stores masks)
  history: {
    past: [],
    future: [],
  },

  pushHistory: () => {
    const { maskImageData, history } = get();
    if (maskImageData) {
      set({
        history: {
          past: [...history.past, maskImageData],
          future: [],
        },
      });
    }
  },

  undo: () => {
    const { history, maskImageData } = get();
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    set({
      maskImageData: previous,
      history: {
        past: history.past.slice(0, -1),
        future: maskImageData ? [...history.future, maskImageData] : history.future,
      },
    });
  },

  redo: () => {
    const { history, maskImageData } = get();
    if (history.future.length === 0) return;

    const next = history.future[history.future.length - 1];
    set({
      maskImageData: next,
      history: {
        past: maskImageData ? [...history.past, maskImageData] : history.past,
        future: history.future.slice(0, -1),
      },
    });
  },

  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,
}));
