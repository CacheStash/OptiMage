import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface DropzoneProps {
  onFilesDropped: (files: File[]) => void;
  disabled?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesDropped, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    setError(null);
    const files = Array.from(e.dataTransfer.files).filter((file: File) => file.type.startsWith('image/'));
    
    if (files.length === 0) {
      setError("Please drop valid image files.");
      return;
    }

    onFilesDropped(files);
  }, [onFilesDropped, disabled]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setError(null);
      const files = Array.from(e.target.files).filter((file: File) => file.type.startsWith('image/'));
      onFilesDropped(files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer
        border-2 border-dashed rounded-2xl p-10
        transition-all duration-300 ease-in-out
        flex flex-col items-center justify-center text-center
        ${isDragging 
          ? 'border-primary bg-blue-50 dark:bg-blue-900/20 scale-[1.01] shadow-lg' 
          : 'border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      
      <div className={`p-4 rounded-full bg-blue-100 dark:bg-slate-700 text-primary mb-4 transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
        <Upload className="w-8 h-8" />
      </div>
      
      <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
        {isDragging ? 'Drop images now!' : 'Drag & Drop Images Here'}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
        Or click to browse from your device. Supports JPG, PNG, WEBP.
        <br/>
        <span className="text-xs text-slate-400 dark:text-slate-500">Fast client-side processing. Large batches may take a moment.</span>
      </p>

      {error && (
        <div className="absolute bottom-4 flex items-center text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full animate-pulse">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
        </div>
      )}
    </div>
  );
};