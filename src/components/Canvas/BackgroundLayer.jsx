import { useEffect, useState } from 'react';
import { Image } from 'react-konva';
import { useImageStore } from '../../stores/imageStore';
import { LAYERS, useCanvasStore } from '../../stores/canvasStore';

/**
 * Background Layer Component
 *
 * Displays the original or processed image as background
 */
function BackgroundLayer() {
  const [image, setImage] = useState(null);

  const originalImage = useImageStore((state) => state.originalImage);
  const processedImageData = useImageStore((state) => state.processedImageData);
  const layerVisible = useCanvasStore((state) => state.layerVisibility[LAYERS.BACKGROUND]);

  useEffect(() => {
    // Show processed image if available, otherwise original
    const imageToShow = processedImageData || originalImage;

    if (imageToShow) {
      const img = new window.Image();

      if (processedImageData) {
        // Create image from ImageData
        const canvas = document.createElement('canvas');
        canvas.width = processedImageData.width;
        canvas.height = processedImageData.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(processedImageData, 0, 0);

        img.onload = () => setImage(img);
        img.src = canvas.toDataURL();
      } else if (originalImage) {
        img.onload = () => setImage(img);
        img.src = originalImage;
      }
    } else {
      setImage(null);
    }
  }, [originalImage, processedImageData]);

  if (!image || !layerVisible) {
    return null;
  }

  return (
    <Image
      image={image}
      x={0}
      y={0}
      opacity={0.8}
      listening={false} // Don't capture events
    />
  );
}

export default BackgroundLayer;
