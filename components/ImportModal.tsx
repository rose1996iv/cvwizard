import React, { useState } from 'react';
import { Upload, FileText, X, Linkedin, Loader2, FileType, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File | null, text: string | null) => Promise<void>;
  isLoading: boolean;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [text, setText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'upload' && selectedFile) {
      onImport(selectedFile, null);
    } else if (activeTab === 'text' && text.trim()) {
      onImport(null, text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.35)]">
        <div className="relative overflow-hidden border-b border-slate-100 px-6 py-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.98))]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="mb-3 inline-flex rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-white">
                AI Intake
              </span>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Import an existing resume</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-500">
                Bring in a LinkedIn PDF, an existing resume file, or raw text and let the parser structure it into editable sections.
              </p>
            </div>
            <button onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-700">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="flex rounded-2xl bg-slate-100 p-1">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${activeTab === 'upload' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Upload size={16} /> Upload file
                </span>
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${activeTab === 'text' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <span className="flex items-center justify-center gap-2">
                  <FileText size={16} /> Paste text
                </span>
              </button>
            </div>

            {activeTab === 'upload' ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-blue-900">
                    <Linkedin size={16} /> LinkedIn import flow
                  </h3>
                  <p className="text-xs leading-6 text-blue-700">
                    Open your LinkedIn profile, choose <strong>More</strong>, export it as PDF, then upload it here.
                  </p>
                </div>

                <div
                  className={`rounded-[26px] border-2 border-dashed p-8 text-center transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input type="file" id="resume-upload" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />

                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                        <FileType size={24} />
                      </div>
                      <p className="max-w-[18rem] truncate text-sm font-semibold text-slate-900">{selectedFile.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button onClick={() => setSelectedFile(null)} className="mt-4 text-xs font-semibold text-red-500 transition-colors hover:text-red-700">
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="resume-upload" className="flex cursor-pointer flex-col items-center">
                      <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                        <Upload size={28} />
                      </span>
                      <p className="text-sm font-semibold text-slate-900">Click to upload or drag and drop</p>
                      <p className="mt-2 text-xs text-slate-500">PDF, JPG, PNG up to 5MB</p>
                    </label>
                  )}
                </div>
              </div>
            ) : (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your resume content here..."
                className="min-h-[280px] w-full rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-all placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-[26px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_22px_55px_rgba(15,23,42,0.24)]">
              <div className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-blue-200">
                <Sparkles size={14} />
                Parser notes
              </div>
              <div className="space-y-3 text-sm leading-6 text-slate-200">
                <p>Structured resumes produce the cleanest extraction.</p>
                <p>PDF and image parsing require a valid Gemini API key.</p>
                <p>You can review and edit every field after import.</p>
              </div>
            </div>

            <div className="rounded-[26px] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              <p className="font-semibold">Best practice</p>
              <p className="mt-2 leading-6 text-amber-800">
                Keep the first pass focused on structure. After import, use the AI tools to refine summary, skills, and experience bullets.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (activeTab === 'upload' && !selectedFile) || (activeTab === 'text' && !text.trim())}
            isLoading={isLoading}
            icon={isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            variant="ai"
          >
            {isLoading ? 'Analyzing...' : 'Parse with AI'}
          </Button>
        </div>
      </div>
    </div>
  );
};
