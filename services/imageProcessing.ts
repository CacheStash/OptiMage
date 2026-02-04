import { ImageFormat, ProcessingSettings } from '../types';

export const processImage = async (
  file: File,
  settings: ProcessingSettings
): Promise<{ blob: Blob; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (settings.maintainAspectRatio) {
        if (settings.maxWidth > 0 && width > settings.maxWidth) {
          height = (height * settings.maxWidth) / width;
          width = settings.maxWidth;
        }
        if (settings.maxHeight > 0 && height > settings.maxHeight) {
          width = (width * settings.maxHeight) / height;
          height = settings.maxHeight;
        }
      } else {
        if (settings.maxWidth > 0) width = settings.maxWidth;
        if (settings.maxHeight > 0) height = settings.maxHeight;
      }

      // Ensure integers
      width = Math.floor(width);
      height = Math.floor(height);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, width, height });
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        },
        settings.format,
        settings.quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};