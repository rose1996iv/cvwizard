import React from 'react';
import { Theme, TemplateId } from '../types';
import { Palette, Type, LayoutTemplate, RotateCcw, Check, Grid } from 'lucide-react';
import { translations } from '../translations';

interface ThemeEditorProps {
  theme: Theme;
  onChange: (field: keyof Theme, value: any) => void;
  language?: 'en' | 'mm';
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

const TEMPLATES: { id: TemplateId, label: string }[] = [
  { id: 'modern', label: 'Modern Sidebar' },
  { id: 'classic', label: 'Classic Top Header' },
  { id: 'sidebar', label: 'Left Sidebar' },
  { id: 'creative', label: 'Creative Gradient' },
];

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme, onChange, language = 'en' }) => {
  const t = translations[language];
  
  const handleReset = () => {
    onChange('color', '#2563eb');
    onChange('backgroundColor', '#ffffff');
    onChange('font', 'Inter');
    onChange('templateId', 'modern');
    onChange('showProfile', true);
    onChange('showIcons', true);
    onChange('compactMode', false);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 mb-6 transition-all hover:shadow-xl">
      <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center uppercase tracking-wider">
          <Palette size={16} className="mr-2 text-blue-600" /> {t.theme}
        </h3>
        <button 
          onClick={handleReset}
          className="text-xs flex items-center text-gray-500 hover:text-red-600 transition-colors font-medium"
          title="Reset to Default Theme"
        >
          <RotateCcw size={12} className="mr-1" /> Reset
        </button>
      </div>

       {/* Templates */}
       <div className="mb-6">
        <label className="text-xs font-bold text-gray-500 mb-3 block uppercase flex items-center">
          <Grid size={12} className="mr-1" /> Choose Template
        </label>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => onChange('templateId', tpl.id)}
              className={`px-3 py-4 text-xs rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                theme.templateId === tpl.id 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold ring-2 ring-blue-500 shadow-md' 
                  : 'border-gray-200 hover:bg-gray-50 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className={`w-full h-8 rounded border border-dashed ${theme.templateId === tpl.id ? 'border-blue-300 bg-blue-100' : 'border-gray-300 bg-gray-50'}`}></div>
              {tpl.label}
            </button>
          ))}
        </div>
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

      {/* Layout Options */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        <label className="text-xs font-bold text-gray-500 mb-4 block uppercase flex items-center">
          <LayoutTemplate size={12} className="mr-1" /> {language === 'en' ? 'Layout Fine-tuning' : 'ကိုယ်ပိုင် စိတ်ကြိုက်ပြင်ဆင်မှု'}
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Show Profile Image */}
            <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">{language === 'en' ? 'Profile Picture' : 'ဓါတ်ပုံပြရန်'}</span>
                  <button 
                    onClick={() => onChange('showProfile', !theme.showProfile)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${theme.showProfile ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${theme.showProfile ? 'left-6' : 'left-1'}`} />
                  </button>
               </div>

               {theme.showProfile && (
                 <>
                   <div className="pt-2 border-t border-gray-200">
                     <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">{language === 'en' ? 'Shape' : 'ပုံသဏ္ဍာန်'}</span>
                     <div className="flex gap-2">
                        {(['circle', 'rounded', 'square'] as const).map(shape => (
                          <button 
                            key={shape}
                            onClick={() => onChange('profileShape', shape)}
                            className={`flex-1 py-1 text-[10px] font-bold rounded border capitalize ${theme.profileShape === shape ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                          >
                            {shape}
                          </button>
                        ))}
                     </div>
                   </div>

                   <div className="pt-2">
                     <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">{language === 'en' ? 'Size' : 'အရွယ်အစား'}</span>
                     <div className="flex gap-2">
                        {(['sm', 'md', 'lg'] as const).map(size => (
                          <button 
                            key={size}
                            onClick={() => onChange('profileSize', size)}
                            className={`flex-1 py-1 text-[10px] font-bold rounded border uppercase ${theme.profileSize === size ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                          >
                            {size}
                          </button>
                        ))}
                     </div>
                   </div>

                   <div className="pt-2">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{language === 'en' ? 'Zoom' : 'ဇူးမ်ချဲ့ရန်'}</span>
                        <span className="text-[10px] font-bold text-blue-600">{Math.round(theme.profileZoom * 100)}%</span>
                     </div>
                     <input 
                       type="range"
                       min="0.5"
                       max="2.5"
                       step="0.1"
                       value={theme.profileZoom}
                       onChange={(e) => onChange('profileZoom', parseFloat(e.target.value))}
                       className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                     />
                   </div>
                 </>
               )}
            </div>
           
           {/* Compact Mode */}
           <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-700">{language === 'en' ? 'Compact Mode' : 'ကျစ်ကျစ်လစ်လစ်'}</span>
              <button 
                onClick={() => onChange('compactMode', !theme.compactMode)}
                className={`w-10 h-5 rounded-full relative transition-colors ${theme.compactMode ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${theme.compactMode ? 'left-6' : 'left-1'}`} />
              </button>
           </div>

           {/* Show Section Icons */}
           <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-700">{language === 'en' ? 'Section Icons' : 'သင်္ကေတများ'}</span>
              <button 
                onClick={() => onChange('showIcons', !theme.showIcons)}
                className={`w-10 h-5 rounded-full relative transition-colors ${theme.showIcons ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${theme.showIcons ? 'left-6' : 'left-1'}`} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};