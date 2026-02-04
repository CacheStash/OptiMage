export enum ImageFormat {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp',
}

export interface ProcessingSettings {
  maxWidth: number;
  maxHeight: number;
  maintainAspectRatio: boolean;
  quality: number; // 0.1 to 1.0
  format: ImageFormat;
}

export type ProcessStatus = 'pending' | 'processing' | 'success' | 'error';

export interface ProcessedImage {
  id: string;
  originalFile: File;
  originalPreview: string; // URL for the original image
  processedBlob: Blob | null;
  processedPreview: string | null; // URL for the processed image
  status: ProcessStatus;
  error?: string;
  originalSize: number;
  processedSize: number;
  width: number;
  height: number;
}