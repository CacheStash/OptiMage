import React, { useEffect } from 'react';
import { X, Download, ArrowRight, FileImage } from 'lucide-react';
import { ProcessedImage } from '../types';
import { formatBytes } from '../utils/format';

interface ImagePreviewModalProps {
  image: ProcessedImage;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ image, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden'; // Lock scroll
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset'; // Unlock scroll
    };
  }, [onClose]);

  const showProcessed = image.status === 'success' && image.processedPreview;
  const previewUrl = showProcessed ? image.processedPreview : image.originalPreview;
  const currentSize = showProcessed ? image.processedSize : image.originalSize;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl h-full max-h-[90vh] flex flex-col bg-transparent pointer-events-none">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 pointer-events-auto">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                <FileImage className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-medium text-lg truncate max-w-[200px] sm:max-w-md">{image.originalFile.name}</h3>
                <p className="text-sm text-slate-400">
                    {image.width > 0 ? `${image.width}x${image.height}px • ` : ''}
                    {formatBytes(currentSize)}
                </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showProcessed && (
                 <a
                 href={image.processedPreview!}
                 download={`optimized_${image.originalFile.name.split('.')[0]}.${image.processedBlob?.type.split('/')[1]}`}
                 className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
               >
                   <Download className="w-4 h-4" />
                   <span className="hidden sm:inline">Download</span>
               </a>
            )}
            <button 
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 min-h-0 flex items-center justify-center pointer-events-auto">
            <img 
              src={previewUrl!} 
              alt="Full Preview" 
              className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg"
            />
        </div>

        {/* Comparison Footnote (if processed) */}
        {showProcessed && (
            <div className="mt-4 flex justify-center pointer-events-auto">
                <div className="bg-black/50 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full text-sm flex items-center gap-3">
                    <span className="text-slate-400">Original: {formatBytes(image.originalSize)}</span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <span className="text-green-400 font-bold">Optimized: {formatBytes(image.processedSize)}</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};