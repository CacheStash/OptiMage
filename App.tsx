import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { ImageFormat, ProcessedImage, ProcessingSettings } from './types';
import { generateId, formatBytes } from './utils/format';
import { processImage } from './services/imageProcessing';
import { Dropzone } from './components/Dropzone';
import { SettingsPanel } from './components/SettingsPanel';
import { ImageCard } from './components/ImageCard';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { FileArchive, Sparkles, Trash2, DownloadCloud, AlertTriangle, Moon, Sun } from 'lucide-react';

const MAX_FILES = 30;

export default function App() {
  const [files, setFiles] = useState<ProcessedImage[]>([]);
  const [settings, setSettings] = useState<ProcessingSettings>({
    maxWidth: 0,
    maxHeight: 0,
    maintainAspectRatio: true,
    quality: 0.8,
    format: ImageFormat.JPEG,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [previewImage, setPreviewImage] = useState<ProcessedImage | null>(null);

  // Theme initialization
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      localStorage.theme = 'dark';
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      localStorage.theme = 'light';
      document.documentElement.classList.remove('dark');
    }
  };

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.originalPreview) URL.revokeObjectURL(file.originalPreview);
        if (file.processedPreview) URL.revokeObjectURL(file.processedPreview);
      });
    };
  }, []);

  const handleFilesDropped = async (newFiles: File[]) => {
    setGlobalError(null);

    if (files.length + newFiles.length > MAX_FILES) {
      setGlobalError(`You can only process up to ${MAX_FILES} files at once. Please remove some files first.`);
      return;
    }

    const newProcessedImages: ProcessedImage[] = newFiles.map(file => ({
      id: generateId(),
      originalFile: file,
      originalPreview: URL.createObjectURL(file),
      processedBlob: null,
      processedPreview: null,
      status: 'pending',
      originalSize: file.size,
      processedSize: 0,
      width: 0,
      height: 0,
    }));

    setFiles(prev => [...prev, ...newProcessedImages]);
    processQueue([...files, ...newProcessedImages]);
  };

  const processQueue = async (currentFiles: ProcessedImage[]) => {
    setIsProcessing(true);
    
    const pendingFiles = currentFiles.filter(f => f.status === 'pending');
    
    for (const fileItem of pendingFiles) {
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'processing' } : f));

        try {
            const { blob, width, height } = await processImage(fileItem.originalFile, settings);
            const processedUrl = URL.createObjectURL(blob);

            setFiles(prev => prev.map(f => {
                if (f.id === fileItem.id) {
                    return {
                        ...f,
                        status: 'success',
                        processedBlob: blob,
                        processedPreview: processedUrl,
                        processedSize: blob.size,
                        width,
                        height
                    };
                }
                return f;
            }));
        } catch (error) {
            console.error("Error processing file", fileItem.originalFile.name, error);
            setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'error', error: 'Processing failed' } : f));
        }
    }
    setIsProcessing(false);
  };

  const handleReprocessAll = () => {
      setFiles(prev => {
          const reset = prev.map(f => ({...f, status: 'pending' as const}));
          setTimeout(() => processQueue(reset), 100); 
          return reset;
      });
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => {
        const fileToRemove = prev.find(f => f.id === id);
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.originalPreview);
            if (fileToRemove.processedPreview) URL.revokeObjectURL(fileToRemove.processedPreview);
        }
        return prev.filter(f => f.id !== id);
    });
    if (previewImage?.id === id) {
        setPreviewImage(null);
    }
  };

  const handleClearAll = () => {
      files.forEach(f => {
          URL.revokeObjectURL(f.originalPreview);
          if (f.processedPreview) URL.revokeObjectURL(f.processedPreview);
      });
      setFiles([]);
      setGlobalError(null);
      setPreviewImage(null);
  };

  const handleDownloadAllZip = async () => {
    const zip = new JSZip();
    const folder = zip.folder("optimized_images");

    let count = 0;
    files.forEach(file => {
        if (file.status === 'success' && file.processedBlob) {
            const extension = file.processedBlob.type.split('/')[1];
            const name = file.originalFile.name.split('.')[0];
            folder?.file(`${name}_optimized.${extension}`, file.processedBlob);
            count++;
        }
    });

    if (count === 0) return;

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized_images.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const successCount = files.filter(f => f.status === 'success').length;
  const totalOriginalSize = files.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalProcessedSize = files.reduce((acc, curr) => acc + (curr.processedSize || curr.originalSize), 0);
  const totalSaved = totalOriginalSize - totalProcessedSize;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
                <Sparkles className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">OptiImage</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Offline Image Optimizer</p>
             </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
             <button
               onClick={toggleTheme}
               className="p-2.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
               title="Toggle Theme"
             >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
             </button>

             {files.length > 0 && (
                 <button
                    onClick={handleClearAll}
                    className="flex items-center gap-2 px-4 py-2.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
                 >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                 </button>
             )}
             <button
                disabled={successCount === 0}
                onClick={handleDownloadAllZip}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200 dark:shadow-blue-900/30 transition-all text-sm font-medium"
             >
                <FileArchive className="w-4 h-4" />
                Download All ({successCount})
             </button>
          </div>
        </header>

        {/* Global Error */}
        {globalError && (
             <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 border border-red-100 dark:border-red-900/30">
                 <AlertTriangle className="w-5 h-5 shrink-0" />
                 <p>{globalError}</p>
             </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left/Top: Settings & Dropzone */}
            <div className="lg:col-span-4 space-y-6">
                <SettingsPanel 
                    settings={settings} 
                    onChange={setSettings} 
                    disabled={isProcessing} 
                />
                
                {files.length > 0 && (
                   <button 
                      onClick={handleReprocessAll}
                      disabled={isProcessing}
                      className="w-full py-3 bg-slate-800 dark:bg-primary text-white rounded-xl font-medium shadow-lg hover:bg-slate-900 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                   >
                       {isProcessing ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                       {isProcessing ? 'Processing...' : 'Apply Settings & Reprocess'}
                   </button>
                )}

                <Dropzone onFilesDropped={handleFilesDropped} disabled={isProcessing} />

                {/* Stats Summary */}
                {files.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <DownloadCloud className="w-4 h-4" /> Batch Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                <span>Total Original Size:</span>
                                <span>{formatBytes(totalOriginalSize)}</span>
                            </div>
                            <div className="flex justify-between text-slate-900 dark:text-slate-200 font-medium">
                                <span>Optimized Size:</span>
                                <span>{formatBytes(totalProcessedSize)}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between text-green-600 dark:text-green-400 font-bold">
                                <span>Total Saved:</span>
                                <span>{formatBytes(totalSaved)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right/Bottom: Grid */}
            <div className="lg:col-span-8">
                {files.length === 0 ? (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full mb-4 text-slate-400 dark:text-slate-500">
                            <ImageIconPlaceholder className="w-8 h-8" />
                        </div>
                        <p>No images added yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map(file => (
                            <ImageCard 
                                key={file.id} 
                                image={file} 
                                onRemove={handleRemoveFile} 
                                onPreview={setPreviewImage}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Modal */}
        {previewImage && (
            <ImagePreviewModal 
                image={previewImage} 
                onClose={() => setPreviewImage(null)} 
            />
        )}

      </div>
    </div>
  );
}

// Simple placeholder icon component for empty state
function ImageIconPlaceholder({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    )
}