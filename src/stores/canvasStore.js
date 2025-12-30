import { create } from 'zustand';

/**
 * Canvas Store
 *
 * Manages canvas view state:
 * - Zoom/scale
 * - Pan/position
 * - Layer visibility
 */

export const LAYERS = {
  BACKGROUND: 'background',
  MASK: 'mask',
  VECTOR: 'vector',
  UI: 'ui',
};

export const useCanvasStore = create((set, get) => ({
  // Canvas dimensions
  canvasSize: { width: 0, height: 0 },
  setCanvasSize: (size) => set({ canvasSize: size }),

  // Zoom and pan
  scale: 1,
  position: { x: 0, y: 0 },

  setScale: (scale) => set({ scale: Math.max(0.1, Math.min(10, scale)) }),
  setPosition: (position) => set({ position }),

  zoomIn: () => {
    const { scale } = get();
    set({ scale: Math.min(10, scale * 1.2) });
  },

  zoomOut: () => {
    const { scale } = get();
    set({ scale: Math.max(0.1, scale / 1.2) });
  },

  resetView: () => set({ scale: 1, position: { x: 0, y: 0 } }),

  fitToScreen: (imageWidth, imageHeight) => {
    const { canvasSize } = get();
    const scaleX = (canvasSize.width * 0.9) / imageWidth;
    const scaleY = (canvasSize.height * 0.9) / imageHeight;
    const newScale = Math.min(scaleX, scaleY, 1);

    set({
      scale: newScale,
      position: {
        x: (canvasSize.width - imageWidth * newScale) / 2,
        y: (canvasSize.height - imageHeight * newScale) / 2,
      },
    });
  },

  // Layer visibility
  layerVisibility: {
    [LAYERS.BACKGROUND]: true,
    [LAYERS.MASK]: true,
    [LAYERS.VECTOR]: true,
    [LAYERS.UI]: true,
  },

  toggleLayer: (layer) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [layer]: !state.layerVisibility[layer],
      },
    })),

  setLayerVisibility: (layer, visible) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [layer]: visible,
      },
    })),

  // Mouse/cursor state
  cursorPosition: { x: 0, y: 0 },
  setCursorPosition: (position) => set({ cursorPosition: position }),

  isSpacePressed: false,
  setIsSpacePressed: (pressed) => set({ isSpacePressed: pressed }),
}));
