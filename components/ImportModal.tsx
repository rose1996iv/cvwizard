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
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Import Resume</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg">
             <button 
               onClick={() => setActiveTab('upload')}
               className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
             >
               <Upload size={16} className="mr-2" /> Upload File
             </button>
             <button 
               onClick={() => setActiveTab('text')}
               className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
             >
               <FileText size={16} className="mr-2" /> Paste Text
             </button>
          </div>

          {activeTab === 'upload' ? (
            <div className="space-y-4">
               {/* Instructions for LinkedIn */}
               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-800 flex items-center mb-1">
                    <Linkedin size={16} className="mr-2" /> Import from LinkedIn
                  </h3>
                  <p className="text-xs text-blue-600">
                    Go to your LinkedIn Profile {'>'} More {'>'} Save to PDF. Then upload the PDF below.
                  </p>
               </div>

               <div 
                 className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
                 onDragEnter={handleDrag}
                 onDragLeave={handleDrag}
                 onDragOver={handleDrag}
                 onDrop={handleDrop}
               >
                 <input 
                    type="file" 
                    id="resume-upload" 
                    className="hidden" 
                    accept=".pdf, .jpg, .jpeg, .png"
                    onChange={handleChange}
                  />
                 
                 {selectedFile ? (
                   <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                        <FileType size={24} />
                      </div>
                      <p className="font-medium text-gray-800 mb-1">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button 
                        onClick={() => setSelectedFile(null)}
                        className="mt-3 text-xs text-red-500 hover:text-red-700 underline"
                      >
                        Remove file
                      </button>
                   </div>
                 ) : (
                   <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                     <Upload size={32} className="text-gray-400 mb-2" />
                     <p className="text-sm font-medium text-gray-700">Click to upload or drag & drop</p>
                     <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                   </label>
                 )}
               </div>
            </div>
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your resume content here..."
              className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          )}

          {/* Error/Info Message */}
          <div className="mt-4 flex items-start p-3 bg-yellow-50 text-yellow-800 rounded-lg text-xs">
             <span className="mr-2">💡</span>
             <p>AI parsing works best with clear, standard resume formats. You can edit all fields after importing.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
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