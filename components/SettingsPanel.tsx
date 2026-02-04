import React from 'react';
import { ImageFormat, ProcessingSettings } from '../types';
import { Settings, Sliders, Image as ImageIcon, Smartphone, Monitor } from 'lucide-react';

interface SettingsPanelProps {
  settings: ProcessingSettings;
  onChange: (settings: ProcessingSettings) => void;
  disabled: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onChange,
  disabled,
}) => {
  const handleChange = (key: keyof ProcessingSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6 transition-colors duration-300">
      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-4">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-lg">Output Configuration</h2>
      </div>

      <div className="flex flex-col space-y-6">
        {/* Row 1: Dimensions */}
        <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-700">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Resize Dimensions
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-32">
                  <input
                    type="number"
                    disabled={disabled}
                    placeholder="Auto"
                    value={settings.maxWidth || ''}
                    onChange={(e) => handleChange('maxWidth', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">W</span>
                </div>
                <div className="relative w-full md:w-32">
                  <input
                    type="number"
                    disabled={disabled}
                    placeholder="Auto"
                    value={settings.maxHeight || ''}
                    onChange={(e) => handleChange('maxHeight', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">H</span>
                </div>
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={disabled}
                checked={settings.maintainAspectRatio}
                onChange={(e) => handleChange('maintainAspectRatio', e.target.checked)}
                className="w-4 h-4 text-primary rounded border-slate-300 dark:border-slate-500 focus:ring-primary bg-white dark:bg-slate-700"
              />
              <span className="text-sm text-slate-600 dark:text-slate-300">Maintain Aspect Ratio</span>
            </label>
          </div>
        </div>

        {/* Row 2: Quality */}
        <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-700">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <Sliders className="w-4 h-4" /> Compression Quality
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              disabled={disabled}
              value={settings.quality}
              onChange={(e) => handleChange('quality', parseFloat(e.target.value))}
              className="w-full md:w-64 h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-sm font-bold text-primary w-12 text-right">
              {Math.round(settings.quality * 100)}%
            </span>
            <span className="text-xs text-slate-400 ml-auto md:ml-0">Lower % = smaller size</span>
          </div>
        </div>

        {/* Row 3: Format */}
        <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-700">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <Monitor className="w-4 h-4" /> Output Format
          </label>
          <div className="w-full md:w-64">
            <select
                disabled={disabled}
                value={settings.format}
                onChange={(e) => handleChange('format', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white dark:bg-slate-700 dark:text-white"
            >
                <option value={ImageFormat.JPEG}>JPEG (Photos)</option>
                <option value={ImageFormat.PNG}>PNG (Graphics)</option>
                <option value={ImageFormat.WEBP}>WebP (Compact)</option>
            </select>
          </div>
        </div>
        
        {/* Row 4: Presets */}
         <div className="space-y-3">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Quick Presets
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
               disabled={disabled}
               onClick={() => onChange({...settings, maxWidth: 1920, maxHeight: 1080, quality: 0.8, format: ImageFormat.JPEG})}
               className="text-xs px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
            >
                Full HD (JPEG 80%)
            </button>
            <button
               disabled={disabled}
               onClick={() => onChange({...settings, maxWidth: 800, maxHeight: 0, quality: 0.6, format: ImageFormat.WEBP})}
               className="text-xs px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
            >
                Thumbnail (WebP 60%)
            </button>
             <button
               disabled={disabled}
               onClick={() => onChange({...settings, maxWidth: 0, maxHeight: 0, quality: 0.5, format: ImageFormat.JPEG})}
               className="text-xs px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
            >
                Compress Only (50%)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};