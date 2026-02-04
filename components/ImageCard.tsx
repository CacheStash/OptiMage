import React from 'react';
import { ProcessedImage } from '../types';
import { formatBytes } from '../utils/format';
import { Loader2, AlertCircle, ArrowDownToLine, Trash2, Eye } from 'lucide-react';

interface ImageCardProps {
  image: ProcessedImage;
  onRemove: (id: string) => void;
  onPreview: (image: ProcessedImage) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onRemove, onPreview }) => {
  const compressionRatio = image.processedSize 
    ? Math.round(((image.originalSize - image.processedSize) / image.originalSize) * 100)
    : 0;

  const isPositiveSaving = compressionRatio > 0;

  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-300">
      
      {/* Floating Actions (Top Right) */}
      <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={() => onPreview(image)}
            className="p-1.5 bg-white/90 dark:bg-slate-900/90 rounded-full text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 shadow-sm backdrop-blur-sm transform hover:scale-105 transition-all"
            title="Preview Full Size"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onRemove(image.id)}
            className="p-1.5 bg-white/90 dark:bg-slate-900/90 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-sm backdrop-blur-sm transform hover:scale-105 transition-all"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
      </div>

      {/* Preview Area (Clickable to Preview) */}
      <div 
        className="h-40 w-full bg-slate-100 dark:bg-slate-900 relative overflow-hidden flex items-center justify-center cursor-pointer"
        onClick={() => onPreview(image)}
      >
        <img 
          src={image.processedPreview || image.originalPreview} 
          alt="Preview" 
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        />
        
        {/* Status Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/20 transition-colors">
            {image.status === 'processing' && (
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs font-semibold text-primary">Processing...</span>
                </div>
            )}
            {image.status === 'error' && (
                <div className="bg-red-50 dark:bg-red-900/50 px-3 py-1 rounded-full flex items-center gap-1 shadow">
                    <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                    <span className="text-xs font-medium text-red-600 dark:text-red-300">Failed</span>
                </div>
            )}
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4">
        <h4 className="font-medium text-slate-800 dark:text-slate-100 text-sm truncate mb-3" title={image.originalFile.name}>
          {image.originalFile.name}
        </h4>

        <div className="flex items-end justify-between text-xs">
           <div className="space-y-1">
               <div className="text-slate-500 dark:text-slate-400">Original: <span className="font-mono text-slate-700 dark:text-slate-300">{formatBytes(image.originalSize)}</span></div>
               {image.status === 'success' && (
                   <div className="text-slate-500 dark:text-slate-400">
                       Optimized: <span className="font-mono text-slate-900 dark:text-white font-bold">{formatBytes(image.processedSize)}</span>
                   </div>
               )}
           </div>

           {image.status === 'success' && (
               <div className={`text-right ${isPositiveSaving ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                   <span className="font-bold text-lg">
                     {isPositiveSaving ? `-${compressionRatio}%` : '0%'}
                   </span>
               </div>
           )}
        </div>

        {/* Action Button */}
        <div className="mt-4">
            {image.status === 'success' && image.processedPreview ? (
                <a
                  href={image.processedPreview}
                  download={`optimized_${image.originalFile.name.split('.')[0]}.${image.processedBlob?.type.split('/')[1]}`}
                  className="flex items-center justify-center w-full gap-2 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-all"
                  onClick={(e) => e.stopPropagation()} // Prevent triggering card preview click
                >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    Download
                </a>
            ) : (
                <div className="h-8 w-full"></div> // Spacer
            )}
        </div>
      </div>
    </div>
  );
};