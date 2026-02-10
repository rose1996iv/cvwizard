import React from 'react';
import { Theme } from '../types';
import { Palette, Type, LayoutTemplate, RotateCcw, Check } from 'lucide-react';
import { Button } from './Button';

interface ThemeEditorProps {
  theme: Theme;
  onChange: (field: keyof Theme, value: string) => void;
}

const ACCENT_COLORS = [
  '#2563eb', // Blue (Default)
  '#059669', // Emerald
  '#dc2626', // Red
  '#7c3aed', // Violet
  '#db2777', // Pink
  '#ea580c', // Orange
  '#000000', // Black
];

const BG_COLORS = [
  '#ffffff', // White
  '#f8fafc', // Slate 50
  '#f0f9ff', // Sky 50
  '#fdf2f8', // Pink 50
  '#fffbeb', // Amber 50
  '#f0fdf4', // Green 50
  '#fafafa', // Neutral 50
];

const FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Merriweather'
];

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme, onChange }) => {
  
  const handleReset = () => {
    onChange('color', '#2563eb');
    onChange('backgroundColor', '#ffffff');
    onChange('font', 'Inter');
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 mb-6 transition-all hover:shadow-xl">
      <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center uppercase tracking-wider">
          <Palette size={16} className="mr-2 text-blue-600" /> Resume Design
        </h3>
        <button 
          onClick={handleReset}
          className="text-xs flex items-center text-gray-500 hover:text-red-600 transition-colors font-medium"
          title="Reset to Default Theme"
        >
          <RotateCcw size={12} className="mr-1" /> Reset
        </button>
      </div>
      
      {/* Accent Colors */}
      <div className="mb-6">
        <label className="text-xs font-bold text-gray-500 mb-3 block uppercase">Accent Color</label>
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onChange('color', color)}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${
                theme.color === color 
                  ? 'border-white ring-2 ring-blue-500 shadow-md scale-110' 
                  : 'border-transparent hover:shadow-sm'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select accent color ${color}`}
            >
              {theme.color === color && <Check size={14} className="text-white drop-shadow-md" />}
            </button>
          ))}
          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors">
             <input 
              type="color" 
              value={theme.color}
              onChange={(e) => onChange('color', e.target.value)}
              className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0"
              title="Custom Accent Color"
            />
          </div>
        </div>
      </div>

      {/* Background Colors */}
      <div className="mb-6">
        <label className="text-xs font-bold text-gray-500 mb-3 block uppercase flex items-center">
          <LayoutTemplate size={12} className="mr-1" /> Paper Color
        </label>
        <div className="flex flex-wrap gap-3">
          {BG_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onChange('backgroundColor', color)}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:scale-110 ${
                theme.backgroundColor === color 
                  ? 'border-blue-500 ring-2 ring-blue-100 shadow-md scale-110' 
                  : 'border-gray-200'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select background color ${color}`}
            >
               {theme.backgroundColor === color && <Check size={14} className="text-gray-800" />}
            </button>
          ))}
           <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors">
            <input 
              type="color" 
              value={theme.backgroundColor}
              onChange={(e) => onChange('backgroundColor', e.target.value)}
              className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0"
              title="Custom Background Color"
            />
          </div>
        </div>
      </div>

      {/* Fonts */}
      <div>
        <label className="text-xs font-bold text-gray-500 mb-3 block uppercase flex items-center">
          <Type size={12} className="mr-1" /> Font Family
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FONTS.map((font) => (
            <button
              key={font}
              onClick={() => onChange('font', font)}
              className={`px-3 py-2 text-sm rounded-lg border text-left transition-all ${
                theme.font === font 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium ring-1 ring-blue-500 shadow-sm' 
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700 hover:border-gray-300'
              }`}
              style={{ fontFamily: font }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};