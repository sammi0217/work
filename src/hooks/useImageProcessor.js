import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppStore } from '../stores/appStore';

/**
 * Hook for using the Image Processor Worker
 *
 * Provides an easy interface to process images in a Web Worker
 */
export function useImageProcessor() {
  const workerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const setProcessingProgress = useAppStore((state) => state.setProcessingProgress);
  const setIsProcessing = useAppStore((state) => state.setIsProcessing);

  // Initialize worker
  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(
      new URL('../workers/imageProcessor.worker.js', import.meta.url),
      { type: 'module' }
    );

    // Handle messages from worker
    workerRef.current.onmessage = (e) => {
      const { type, progress } = e.data;

      if (type === 'ready') {
        setIsReady(true);
      } else if (type === 'progress') {
        setProcessingProgress(progress);
      }
    };

    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [setProcessingProgress]);

  /**
   * Process image with full pipeline
   */
  const processImage = useCallback((imageData, params) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('Worker not ready'));
        return;
      }

      setIsProcessing(true);
      setProcessingProgress(0);

      const handler = (e) => {
        const { type, imageData: result, error } = e.data;

        if (type === 'processed') {
          workerRef.current.removeEventListener('message', handler);
          setIsProcessing(false);
          setProcessingProgress(100);
          resolve(result);
        } else if (type === 'error') {
          workerRef.current.removeEventListener('message', handler);
          setIsProcessing(false);
          reject(new Error(error));
        }
      };

      workerRef.current.addEventListener('message', handler);
      workerRef.current.postMessage(
        {
          type: 'process',
          data: { imageData, params },
        },
        [imageData.data.buffer]
      );
    });
  }, [isReady, setIsProcessing, setProcessingProgress]);

  /**
   * Apply threshold only
   */
  const applyThreshold = useCallback((imageData, threshold) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('Worker not ready'));
        return;
      }

      const handler = (e) => {
        const { type, imageData: result, error } = e.data;

        if (type === 'threshold') {
          workerRef.current.removeEventListener('message', handler);
          resolve(result);
        } else if (type === 'error') {
          workerRef.current.removeEventListener('message', handler);
          reject(new Error(error));
        }
      };

      workerRef.current.addEventListener('message', handler);
      workerRef.current.postMessage(
        {
          type: 'threshold',
          data: { imageData, threshold },
        },
        [imageData.data.buffer]
      );
    });
  }, [isReady]);

  /**
   * Apply morphology operation
   */
  const applyMorphology = useCallback((imageData, operation, kernelSize, iterations) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('Worker not ready'));
        return;
      }

      const handler = (e) => {
        const { type, imageData: result, error } = e.data;

        if (type === 'morphology') {
          workerRef.current.removeEventListener('message', handler);
          resolve(result);
        } else if (type === 'error') {
          workerRef.current.removeEventListener('message', handler);
          reject(new Error(error));
        }
      };

      workerRef.current.addEventListener('message', handler);
      workerRef.current.postMessage(
        {
          type: 'morphology',
          data: { imageData, operation, kernelSize, iterations },
        },
        [imageData.data.buffer]
      );
    });
  }, [isReady]);

  /**
   * Magic Wand selection
   */
  const magicWand = useCallback((imageData, seedPoint, tolerance = 10) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('Worker not ready'));
        return;
      }

      const handler = (e) => {
        const { type, imageData: result, error } = e.data;

        if (type === 'magicWand') {
          workerRef.current.removeEventListener('message', handler);
          resolve(result);
        } else if (type === 'error') {
          workerRef.current.removeEventListener('message', handler);
          reject(new Error(error));
        }
      };

      workerRef.current.addEventListener('message', handler);
      workerRef.current.postMessage(
        {
          type: 'magicWand',
          data: { imageData, seedPoint, tolerance },
        },
        [imageData.data.buffer]
      );
    });
  }, [isReady]);

  /**
   * Find contours
   */
  const findContours = useCallback((imageData, smoothness = 0.5) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('Worker not ready'));
        return;
      }

      const handler = (e) => {
        const { type, contours, error } = e.data;

        if (type === 'contours') {
          workerRef.current.removeEventListener('message', handler);
          resolve(contours);
        } else if (type === 'error') {
          workerRef.current.removeEventListener('message', handler);
          reject(new Error(error));
        }
      };

      workerRef.current.addEventListener('message', handler);
      workerRef.current.postMessage({
        type: 'findContours',
        data: { imageData, smoothness },
      });
    });
  }, [isReady]);

  return {
    isReady,
    processImage,
    applyThreshold,
    applyMorphology,
    magicWand,
    findContours,
  };
}
