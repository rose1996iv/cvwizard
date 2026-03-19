import React from 'react';
import { Theme, TemplateId } from '../types';
import { Palette, Type, LayoutTemplate, RotateCcw, Check, Grid, Sparkles } from 'lucide-react';
import { translations } from '../translations';

interface ThemeEditorProps {
  theme: Theme;
  onChange: (field: keyof Theme, value: any) => void;
  language?: 'en' | 'mm';
}

const ACCENT_COLORS = ['#2563eb', '#0f766e', '#dc2626', '#7c3aed', '#111827', '#ea580c', '#be185d'];

const BG_COLORS = ['#ffffff', '#f8fafc', '#eff6ff', '#f8fafc', '#fff7ed', '#f0fdf4', '#fdf4ff'];

const FONTS = ['Manrope', 'IBM Plex Sans', 'DM Sans', 'Space Grotesk', 'Source Serif 4'];

const TEMPLATES: { id: TemplateId; label: string; blurb: string }[] = [
  { id: 'modern', label: 'Executive Split', blurb: 'Balanced two-column layout for most professional roles.' },
  { id: 'classic', label: 'Traditional Brief', blurb: 'Straightforward structure optimized for conservative hiring teams.' },
  { id: 'sidebar', label: 'Portfolio Rail', blurb: 'Left-leaning identity panel with a strong designer feel.' },
  { id: 'creative', label: 'Signature Cover', blurb: 'High-contrast presentation with stronger visual personality.' },
];

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme, onChange, language = 'en' }) => {
  const t = translations[language];

  const handleReset = () => {
    onChange('color', '#2563eb');
    onChange('backgroundColor', '#ffffff');
    onChange('font', 'Manrope');
    onChange('templateId', 'modern');
    onChange('showProfile', true);
    onChange('showIcons', true);
    onChange('compactMode', false);
    onChange('profileShape', 'circle');
    onChange('profileSize', 'md');
    onChange('profileZoom', 1);
  };

  return (
    <div className="theme-editor-card overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
      <div className="relative overflow-hidden border-b border-slate-100 px-5 py-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.96))]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-white">
              <Sparkles size={12} />
              Design control
            </span>
            <h3 className="text-lg font-black tracking-tight text-slate-950">{t.theme}</h3>
            <p className="mt-2 text-sm text-slate-500">Tune the document system, typography, and visual density from one place.</p>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300 hover:text-red-600"
            title="Reset to default theme"
          >
            <RotateCcw size={12} className="mr-2" /> Reset
          </button>
        </div>
      </div>

      <div className="space-y-8 p-5">
        <section>
          <label className="mb-3 flex items-center text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
            <Grid size={12} className="mr-2" /> Template system
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => onChange('templateId', tpl.id)}
                className={`rounded-[24px] border p-4 text-left transition-all ${
                  theme.templateId === tpl.id
                    ? 'border-blue-500 bg-blue-50 shadow-[0_16px_40px_rgba(37,99,235,0.12)] ring-2 ring-blue-200'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className={`mb-3 h-10 rounded-2xl border ${theme.templateId === tpl.id ? 'border-blue-300 bg-[linear-gradient(135deg,rgba(37,99,235,0.16),rgba(15,23,42,0.08))]' : 'border-slate-200 bg-white'}`} />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{tpl.label}</div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{tpl.blurb}</p>
                  </div>
                  {theme.templateId === tpl.id && <Check size={16} className="mt-1 text-blue-600" />}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-2">
          <div>
            <label className="mb-3 flex items-center text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
              <Palette size={12} className="mr-2" /> Accent color
            </label>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onChange('color', color)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all hover:scale-110 ${theme.color === color ? 'border-white ring-2 ring-blue-400 shadow-lg scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select accent color ${color}`}
                >
                  {theme.color === color && <Check size={14} className="text-white" />}
                </button>
              ))}
              <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-slate-200 transition-colors hover:border-blue-400">
                <input
                  type="color"
                  value={theme.color}
                  onChange={(e) => onChange('color', e.target.value)}
                  className="absolute -left-2 -top-2 h-14 w-14 cursor-pointer border-0 p-0"
                  title="Custom accent color"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-3 flex items-center text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
              <LayoutTemplate size={12} className="mr-2" /> Paper tone
            </label>
            <div className="flex flex-wrap gap-3">
              {BG_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onChange('backgroundColor', color)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:scale-110 ${theme.backgroundColor === color ? 'border-blue-500 ring-2 ring-blue-100 shadow-lg scale-110' : 'border-slate-200'}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select background color ${color}`}
                >
                  {theme.backgroundColor === color && <Check size={14} className="text-slate-900" />}
                </button>
              ))}
              <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-slate-200 transition-colors hover:border-blue-400">
                <input
                  type="color"
                  value={theme.backgroundColor}
                  onChange={(e) => onChange('backgroundColor', e.target.value)}
                  className="absolute -left-2 -top-2 h-14 w-14 cursor-pointer border-0 p-0"
                  title="Custom background color"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <label className="mb-3 flex items-center text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
            <Type size={12} className="mr-2" /> Typography
          </label>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {FONTS.map((font) => (
              <button
                key={font}
                onClick={() => onChange('font', font)}
                className={`rounded-2xl border px-4 py-3 text-left transition-all ${theme.font === font ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-400 shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'}`}
                style={{ fontFamily: font }}
              >
                <div className="text-sm font-semibold">{font}</div>
                <div className="mt-1 text-xs opacity-70">Aa Bb Cc</div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="mb-4 flex items-center text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
            <LayoutTemplate size={12} className="mr-2" /> {language === 'en' ? 'Layout tuning' : 'စိတ်ကြိုက် Layout ပြင်ဆင်မှု'}
          </label>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">{language === 'en' ? 'Profile picture' : 'ဓာတ်ပုံပြသရန်'}</span>
                <button
                  onClick={() => onChange('showProfile', !theme.showProfile)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${theme.showProfile ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${theme.showProfile ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              {theme.showProfile && (
                <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                  <div>
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{language === 'en' ? 'Shape' : 'ပုံသဏ္ဍာန်'}</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['circle', 'rounded', 'square'] as const).map((shape) => (
                        <button
                          key={shape}
                          onClick={() => onChange('profileShape', shape)}
                          className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-all ${theme.profileShape === shape ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}
                        >
                          {shape}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{language === 'en' ? 'Size' : 'အရွယ်အစား'}</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['sm', 'md', 'lg'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => onChange('profileSize', size)}
                          className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-all ${theme.profileSize === size ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{language === 'en' ? 'Zoom' : 'ချဲ့မှု'}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">{Math.round(theme.profileZoom * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.1"
                      value={theme.profileZoom}
                      onChange={(e) => onChange('profileZoom', parseFloat(e.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-[26px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <span className="text-xs font-semibold text-slate-700">{language === 'en' ? 'Compact mode' : 'ကျစ်လျစ်သော mode'}</span>
                <button
                  onClick={() => onChange('compactMode', !theme.compactMode)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${theme.compactMode ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${theme.compactMode ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-[26px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <span className="text-xs font-semibold text-slate-700">{language === 'en' ? 'Section icons' : 'Section icon များ'}</span>
                <button
                  onClick={() => onChange('showIcons', !theme.showIcons)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${theme.showIcons ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${theme.showIcons ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-slate-950 p-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-200">Current profile</div>
                <div className="mt-3 text-sm font-semibold">{TEMPLATES.find((tpl) => tpl.id === theme.templateId)?.label}</div>
                <p className="mt-2 text-xs leading-6 text-slate-300">
                  {language === 'en'
                    ? 'This setup blends premium typography, ATS-safe spacing, and brandable visual hierarchy.'
                    : 'ဒီ setup က ATS-safe spacing နဲ့ brand identity ကို တစ်ပြိုင်နက်ပေါင်းစပ်ထားပါတယ်။'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
