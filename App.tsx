import React, { useState, useEffect, useRef } from 'react';
import { Download, Plus, Minus, Check, Globe, Layout, Type as TypeIcon, Save, Printer, Trash2, PlusCircle, UserCircle, LogOut, LayoutTemplate, Briefcase, FileText, Wand2, ArrowLeft, ArrowRight, Grid, X, ChevronRight, ChevronLeft, MoveUp, MoveDown, Book, User, Settings, Folder, Image, GraduationCap, Wrench, Edit3, Import, Upload, Sparkles, Eye, Layers } from 'lucide-react';
import { useAuth } from './services/auth';
import { 
  saveResumeToCloud, 
  getResumesByUser, 
  SavedResume, 
  deleteResumeFromCloud 
} from './services/resumeStorage';
import { ResumeData, WizardStep, Experience, Education, Skill, CustomSection, CustomItem, Theme } from './types';
import { Preview } from './components/Preview';
import { Button } from './components/Button';
import { InputGroup } from './components/InputGroup';
import { ThemeEditor } from './components/ThemeEditor';
import { ImportModal } from './components/ImportModal';
import { generateSummary, enhanceExperienceDescription, suggestSkills, parseResumeContent, generateCoverLetter, checkGrammar } from './services/geminiService';
import { useDebounce } from './hooks/useDebounce';

import { translations } from './translations';

declare const html2pdf: any;

const App = () => {
  const [step, setStep] = useState<WizardStep>(WizardStep.PERSONAL);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [zoom, setZoom] = useState(0.8);
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Ref for auto-scrolling to new items
  const bottomRef = useRef<HTMLDivElement>(null);

  const { user, loginWithGoogle, logout } = useAuth();
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [showResumesModal, setShowResumesModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('cvwizard-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure new fields exist for existing users
        if (!parsed.docType) parsed.docType = 'cv';
        if (parsed.personalInfo && !parsed.personalInfo.summaryType) parsed.personalInfo.summaryType = 'summary';
        if (parsed.theme && !parsed.theme.profileShape) {
          parsed.theme.profileShape = 'circle';
          parsed.theme.profileSize = 'md';
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    return {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        website: '',
        summary: '',
        summaryType: 'summary',
        jobTitle: '',
        profileImage: null,
      },
      docType: 'cv',
      experience: [],
      education: [],
      skills: [],
      customSections: [],
      theme: {
        color: '#2563eb',
        backgroundColor: '#ffffff',
        font: 'Inter',
        templateId: 'modern',
        showProfile: true,
        profileShape: 'circle',
        profileSize: 'md',
        showIcons: true,
        compactMode: false,
      },
      sectionOrder: ['summary', 'experience', 'education', 'skills', 'custom'],
      language: 'en'
    };
  });

  const debouncedResumeData = useDebounce(resumeData, 500);

  // Save to localStorage
  // Auto-save across LocalStorage
  useEffect(() => {
    localStorage.setItem('cvwizard-data', JSON.stringify(resumeData));
  }, [resumeData]);

  // Cloud Sync
  useEffect(() => {
    if (user) {
        const timeout = setTimeout(() => {
            saveResumeToCloud(user.uid, resumeData, activeResumeId || undefined)
                .then(id => {
                    if (id && !activeResumeId) setActiveResumeId(id);
                    setLastSaved(new Date());
                    loadUserResumes();
                });
        }, 2000); // Debounce saves
        return () => clearTimeout(timeout);
    }
  }, [resumeData, user, activeResumeId]);

  const loadUserResumes = async () => {
    if (user) {
        const resumes = await getResumesByUser(user.uid);
        setSavedResumes(resumes);
    }
  };

  useEffect(() => {
    loadUserResumes();
  }, [user]);

  const handleSelectResume = (resumeId: string) => {
    const selected = savedResumes.find(r => r.id === resumeId);
    if (selected) {
        setResumeData(selected.data);
        setActiveResumeId(selected.id);
        setShowResumesModal(false);
    }
  };

  const createNewResume = () => {
    setActiveResumeId(null);
    setResumeData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, fullName: '', summary: '' },
        experience: [],
        education: [],
        skills: [],
        customSections: []
    }));
    setShowResumesModal(false);
  };

  const handleDeleteResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this resume?")) {
        await deleteResumeFromCloud(id);
        if (activeResumeId === id) setActiveResumeId(null);
        loadUserResumes();
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const t = translations[resumeData.language || 'en'];

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handlers
  const updatePersonalInfo = (field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonalInfo('profileImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    updatePersonalInfo('profileImage', null);
  };

  const updateTheme = (field: keyof Theme, value: any) => {
    setResumeData(prev => ({
      ...prev,
      theme: { ...prev.theme, [field]: value }
    }));
  };

  // --- Experience Handlers ---
  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setResumeData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
    scrollToBottom();
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  };

  // --- Education Handlers ---
  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      current: false
    };
    setResumeData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
    scrollToBottom();
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  // --- Skill Handlers ---
  const addSkill = (name: string) => {
    if (!name.trim()) return;
    const newSkill: Skill = { id: crypto.randomUUID(), name, level: 3 };
    setResumeData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
  };

  const removeSkill = (id: string) => {
    setResumeData(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) }));
  };

  // --- Custom Section Handlers ---
  const addCustomSection = () => {
    const newSection: CustomSection = {
      id: crypto.randomUUID(),
      title: 'New Section',
      items: []
    };
    setResumeData(prev => ({ ...prev, customSections: [...prev.customSections, newSection] }));
    scrollToBottom();
  };

  const removeCustomSection = (sectionId: string) => {
    setResumeData(prev => ({ 
      ...prev, 
      customSections: prev.customSections.filter(s => s.id !== sectionId) 
    }));
  };

  const updateCustomSectionTitle = (sectionId: string, title: string) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map(s => s.id === sectionId ? { ...s, title } : s)
    }));
  };

  const addCustomItem = (sectionId: string) => {
    const newItem: CustomItem = {
      id: crypto.randomUUID(),
      title: '',
      subtitle: '',
      description: '',
      date: ''
    };
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map(s => 
        s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
      )
    }));
  };

  const updateCustomItem = (sectionId: string, itemId: string, field: keyof CustomItem, value: string) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map(s => 
        s.id === sectionId ? {
          ...s,
          items: s.items.map(i => i.id === itemId ? { ...i, [field]: value } : i)
        } : s
      )
    }));
  };

  const removeCustomItem = (sectionId: string, itemId: string) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map(s => 
        s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s
      )
    }));
  };

  // AI Handlers
  const handleGenerateSummary = async () => {
    setLoadingAI('summary');
    const summary = await generateSummary(resumeData.personalInfo, resumeData.experience);
    updatePersonalInfo('summary', summary);
    setLoadingAI(null);
  };

  const handleEnhanceExperience = async (id: string) => {
    setLoadingAI(`exp-${id}`);
    const exp = resumeData.experience.find(e => e.id === id);
    if (exp) {
      const enhanced = await enhanceExperienceDescription(exp.position, exp.company, exp.description);
      updateExperience(id, 'description', enhanced);
    }
    setLoadingAI(null);
  };

  const handleSuggestSkills = async () => {
    setLoadingAI('skills');
    const suggested = await suggestSkills(resumeData.personalInfo.jobTitle, resumeData.personalInfo.summary);
    const currentSkillNames = new Set(resumeData.skills.map(s => s.name.toLowerCase()));
    const newSkills = suggested
      .filter(s => !currentSkillNames.has(s.toLowerCase()))
      .map(s => ({ id: crypto.randomUUID(), name: s, level: 3 } as Skill));
    
    setResumeData(prev => ({ ...prev, skills: [...prev.skills, ...newSkills] }));
    setLoadingAI(null);
  };

  const handleImport = async (file: File | null, text: string | null) => {
    setLoadingAI('import');
    try {
        let content = '';
        let mimeType = 'text/plain';

        if (file) {
             const reader = new FileReader();
             content = await new Promise((resolve) => {
                reader.onloadend = () => {
                   const base64String = (reader.result as string).split(',')[1];
                   resolve(base64String);
                };
                reader.readAsDataURL(file);
             });
             mimeType = file.type;
        } else if (text) {
            content = text;
        }

        const parsedData = await parseResumeContent(content, mimeType);
        
        // Merge Parsed Data
        setResumeData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, ...parsedData.personalInfo },
            experience: parsedData.experience || [],
            education: parsedData.education || [],
            skills: parsedData.skills || [],
        }));
        
        setShowImportModal(false);
    } catch (error) {
        const fallbackMessage = "Failed to parse resume. Please try again or enter details manually.";
        let userMessage = fallbackMessage;

        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase();
          if (errorMessage.includes("gemini_api_key") || errorMessage.includes("api key")) {
            userMessage = "AI import needs a Gemini API key. Add GEMINI_API_KEY or use 'Paste Text' in the import modal.";
          } else if (errorMessage.includes("empty")) {
            userMessage = "No resume content found. Please upload a valid file or paste your resume text.";
          }
        }

        alert(userMessage);
        console.error(error);
    } finally {
        setLoadingAI(null);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setLoadingAI('cover-letter');
    const letter = await generateCoverLetter(resumeData);
    setCoverLetter(letter);
    setLoadingAI(null);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...resumeData.sectionOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newOrder.length) return;
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setResumeData(prev => ({ ...prev, sectionOrder: newOrder }));
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('resume-preview');
    if (!element) {
        setIsExporting(false);
        return;
    }

    // Temporarily reset transform and transitions for clean capture
    const originalTransform = element.style.transform;
    const originalTransition = element.style.transition;
    
    element.style.transform = 'none';
    element.style.transition = 'none';

    if (typeof html2pdf !== 'undefined') {
        const opt = {
            margin: 0,
            filename: `${resumeData.personalInfo.fullName || 'Resume'}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { 
                scale: 3, 
                useCORS: true, 
                letterRendering: true,
                scrollY: 0,
                scrollX: 0,
                windowWidth: 1200 // Consistent width for capturing
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
        };
        
        try {
            await html2pdf().set(opt).from(element).save();
        } catch (e) {
            console.error("PDF Export failed", e);
            alert("Download failed. Falling back to print mode.");
            handlePrint();
        } finally {
            // Restore styles
            element.style.transform = originalTransform;
            element.style.transition = originalTransition;
            setIsExporting(false);
        }
    } else {
        handlePrint();
        setIsExporting(false);
    }
  };

  const handleExportTXT = () => {
    const { personalInfo, experience, education, skills } = resumeData;
    let text = `NAME: ${personalInfo.fullName}\n`;
    text += `TITLE: ${personalInfo.jobTitle}\n`;
    text += `EMAIL: ${personalInfo.email}\n`;
    text += `PHONE: ${personalInfo.phone}\n`;
    text += `LINKEDIN: ${personalInfo.linkedin}\n\n`;
    
    text += `SUMMARY:\n${personalInfo.summary}\n\n`;
    
    text += `EXPERIENCE:\n`;
    experience.forEach(exp => {
      text += `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})\n`;
      text += `${exp.description}\n\n`;
    });
    
    text += `EDUCATION:\n`;
    education.forEach(edu => {
      text += `${edu.degree} - ${edu.institution} (${edu.startDate} - ${edu.endDate})\n`;
    });
    
    text += `\nSKILLS:\n${skills.map(s => s.name).join(', ')}`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${personalInfo.fullName || 'Resume'}.txt`;
    link.click();
  };

  const Steps = () => (
    <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 no-print scrollbar-hide">
      {[
        { id: WizardStep.PERSONAL, icon: User, label: t.personal },
        { id: WizardStep.EXPERIENCE, icon: Briefcase, label: t.experience },
        { id: WizardStep.EDUCATION, icon: GraduationCap, label: t.education },
        { id: WizardStep.SKILLS, icon: Wrench, label: t.skills },
        { id: WizardStep.CUSTOM, icon: Layers, label: t.custom },
        { id: WizardStep.THEME, icon: Edit3, label: t.theme },
        { id: WizardStep.FINALIZE, icon: Download, label: t.finalize },
      ].map((s) => (
        <button
          key={s.id}
          onClick={() => setStep(s.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
            step === s.id 
              ? 'bg-blue-600 text-white shadow-md transform scale-105' 
              : 'bg-white text-gray-500 hover:bg-gray-100'
          }`}
        >
          <s.icon size={16} />
          <span className="text-sm font-medium">{s.label}</span>
        </button>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case WizardStep.PERSONAL:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                   <h2 className="text-2xl font-bold text-gray-800">{t.basics}</h2>
                   <p className="text-gray-500 text-sm mt-1">{resumeData.language === 'en' ? 'Fill in your details or import from an existing resume.' : 'အချက်အလက်များကို ဖြည့်စွက်ပါ (သို့မဟုတ်) ရှိပြီးသား CV မှ အချက်အလက်ယူပါ။'}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowImportModal(true)} 
                    variant="ai" 
                    icon={<Import size={16} />}
                  >
                      {t.importResume}
                  </Button>
                </div>
            </div>

            {/* Document Type Selector */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-900">{t.docType}</h3>
                  <p className="text-[10px] text-blue-600 uppercase tracking-wider font-bold">{resumeData.docType === 'cv' ? t.cv : t.resume}</p>
                </div>
              </div>
              <div className="flex bg-white p-1 rounded-lg shadow-sm border border-blue-100">
                <button 
                  onClick={() => setResumeData(prev => ({ ...prev, docType: 'cv' }))}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${resumeData.docType === 'cv' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  CV
                </button>
                <button 
                  onClick={() => setResumeData(prev => ({ ...prev, docType: 'resume' }))}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${resumeData.docType === 'resume' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Resume
                </button>
              </div>
            </div>
            
            {/* Profile Image Upload */}
            <div className="flex items-center space-x-6 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
               <div className="relative">
                 {resumeData.personalInfo.profileImage ? (
                   <img 
                      src={resumeData.personalInfo.profileImage} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm"
                   />
                 ) : (
                   <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                     <User size={32} />
                   </div>
                 )}
                 {resumeData.personalInfo.profileImage && (
                   <button 
                    onClick={removeProfileImage}
                    className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm"
                    title="Remove Image"
                   >
                     <X size={12} />
                   </button>
                 )}
               </div>
               <div className="flex-1">
                 <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Photo (Optional)</label>
                 <div className="flex items-center">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                      <Upload size={16} className="mr-2" />
                      Upload Photo
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                    <span className="ml-3 text-xs text-gray-500">JPG or PNG. Max 2MB.</span>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label={t.fullName} value={resumeData.personalInfo.fullName} onChange={(v) => updatePersonalInfo('fullName', v)} placeholder="Joe" />
              <InputGroup label={t.targetJobTitle} value={resumeData.personalInfo.jobTitle} onChange={(v) => updatePersonalInfo('jobTitle', v)} placeholder="Software Engineer" />
              <InputGroup label={t.email} type="email" value={resumeData.personalInfo.email} onChange={(v) => updatePersonalInfo('email', v)} placeholder="joe@example.com" />
              <InputGroup label={t.phone} value={resumeData.personalInfo.phone} onChange={(v) => updatePersonalInfo('phone', v)} placeholder="+1 555 123 4567" />
              <InputGroup label={t.location} value={resumeData.personalInfo.location} onChange={(v) => updatePersonalInfo('location', v)} placeholder="Grace Leo Home, GG" />
              <InputGroup label={t.linkedin} value={resumeData.personalInfo.linkedin} onChange={(v) => updatePersonalInfo('linkedin', v)} placeholder="linkedin.com/in/joe" />
              <InputGroup label={t.website} value={resumeData.personalInfo.website} onChange={(v) => updatePersonalInfo('website', v)} placeholder="joeportfolio.com" />
            </div>
            
            <div className="relative">
              <div className="flex justify-between items-end mb-1">
                <div className="flex bg-gray-100 p-1 rounded-lg mb-1">
                  <button 
                    onClick={() => updatePersonalInfo('summaryType', 'summary')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${resumeData.personalInfo.summaryType === 'summary' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                  >
                    {t.summary}
                  </button>
                  <button 
                    onClick={() => updatePersonalInfo('summaryType', 'objective')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${resumeData.personalInfo.summaryType === 'objective' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                  >
                    {t.objective}
                  </button>
                </div>
                <div className="flex gap-3">
                   <button 
                    onClick={async () => {
                      setLoadingAI('grammar-summary');
                      const improved = await checkGrammar(resumeData.personalInfo.summary);
                      updatePersonalInfo('summary', improved);
                      setLoadingAI(null);
                    }}
                    disabled={loadingAI === 'grammar-summary' || !resumeData.personalInfo.summary}
                    className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Sparkles size={14} className="mr-1" />
                    {loadingAI === 'grammar-summary' ? t.checking : t.checkGrammar}
                  </button>
                  <button 
                    onClick={handleGenerateSummary}
                    disabled={loadingAI === 'summary' || !resumeData.personalInfo.jobTitle}
                    className="flex items-center text-xs font-medium text-purple-600 hover:text-purple-700 disabled:opacity-50 transition-colors"
                  >
                    <Sparkles size={14} className="mr-1" />
                    {loadingAI === 'summary' ? t.generating : t.autoGenAI}
                  </button>
                </div>
              </div>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow min-h-[150px]"
                value={resumeData.personalInfo.summary}
                onChange={e => updatePersonalInfo('summary', e.target.value)}
                placeholder={resumeData.personalInfo.summaryType === 'summary' 
                  ? (resumeData.language === 'en' ? 'Briefly describe your professional background...' : 'သင်၏ ပရော်ဖက်ရှင်နယ် နောက်ခံကို အကျဉ်းချုံး ဖော်ပြပါ...')
                  : (resumeData.language === 'en' ? 'State your career goals and what you aim to achieve...' : 'သင်၏ အသက်မွေးဝမ်းကျောင်း ရည်မှန်းချက်များကို ဖော်ပြပါ...')}
              />
            </div>
          </div>
        );

      case WizardStep.EXPERIENCE:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{t.experience}</h2>
              <Button onClick={addExperience} variant="outline" icon={<Plus size={16} />}>{t.addPosition}</Button>
            </div>

            {resumeData.experience.length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No experience added yet.</p>
              </div>
            )}

            {resumeData.experience.map((exp) => (
              <div key={exp.id} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
                <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <InputGroup label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, 'company', v)} placeholder="Beacon Academy" />
                  <InputGroup label="Position" value={exp.position} onChange={(v) => updateExperience(exp.id, 'position', v)} placeholder="Senior Developer" />
                  <InputGroup label="Start Date" value={exp.startDate} onChange={(v) => updateExperience(exp.id, 'startDate', v)} placeholder="MM/YYYY" />
                  <div className="flex flex-col">
                     <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                     <div className="flex gap-2">
                       <input 
                          type="text"
                          disabled={exp.current}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500"
                          value={exp.current ? 'Present' : exp.endDate}
                          onChange={e => updateExperience(exp.id, 'endDate', e.target.value)}
                          placeholder="MM/YYYY"
                       />
                       <label className="flex items-center space-x-2 text-sm text-gray-600 whitespace-nowrap cursor-pointer">
                         <input type="checkbox" checked={exp.current} onChange={e => updateExperience(exp.id, 'current', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                         <span>Current</span>
                       </label>
                     </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-semibold text-gray-700">Description</label>
                    <div className="flex gap-3">
                       <button 
                        onClick={async () => {
                          setLoadingAI(`grammar-${exp.id}`);
                          const improved = await checkGrammar(exp.description);
                          updateExperience(exp.id, 'description', improved);
                          setLoadingAI(null);
                        }}
                        disabled={loadingAI === `grammar-${exp.id}` || !exp.description}
                        className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                      >
                        <Sparkles size={14} className="mr-1" />
                        {loadingAI === `grammar-${exp.id}` ? 'Checking...' : (resumeData.language === 'en' ? 'Check Grammar' : 'သဒ္ဒါစစ်ရန်')}
                      </button>
                      <button 
                        onClick={() => handleEnhanceExperience(exp.id)}
                        disabled={loadingAI === `exp-${exp.id}` || !exp.description}
                        className="flex items-center text-xs font-medium text-purple-600 hover:text-purple-700 disabled:opacity-50 transition-colors"
                      >
                        <Sparkles size={14} className="mr-1" />
                        {loadingAI === `exp-${exp.id}` ? 'Enhancing...' : 'Enhance with AI'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[120px]"
                    value={exp.description}
                    onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                    placeholder="• Developed new features..."
                  />
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        );

      case WizardStep.EDUCATION:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Education</h2>
              <Button onClick={addEducation} variant="outline" icon={<Plus size={16} />}>Add Education</Button>
            </div>
            {resumeData.education.map((edu) => (
              <div key={edu.id} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm relative">
                <button onClick={() => removeEducation(edu.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup label="Institution" value={edu.institution} onChange={(v) => updateEducation(edu.id, 'institution', v)} placeholder="University of..." />
                  <InputGroup label="Degree" value={edu.degree} onChange={(v) => updateEducation(edu.id, 'degree', v)} placeholder="Bachelor of Science" />
                  <InputGroup label="Start Date" value={edu.startDate} onChange={(v) => updateEducation(edu.id, 'startDate', v)} placeholder="YYYY" />
                  <InputGroup label="End Date" value={edu.endDate} onChange={(v) => updateEducation(edu.id, 'endDate', v)} placeholder="YYYY" />
                </div>
              </div>
            ))}
             {resumeData.education.length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No education added.</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        );

      case WizardStep.SKILLS:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                  <h2 className="text-2xl font-bold text-gray-800">Skills</h2>
                  <p className="text-gray-500 text-sm">Add your technical and soft skills.</p>
               </div>
               <Button 
                onClick={handleSuggestSkills} 
                variant="ai" 
                icon={<Sparkles size={16} />}
                isLoading={loadingAI === 'skills'}
                disabled={!resumeData.personalInfo.jobTitle}
              >
                Suggest Skills via AI
              </Button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add a skill (e.g. React, Python)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addSkill(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <Button onClick={(e) => {
                 const input = (e.currentTarget.previousSibling as HTMLInputElement);
                 addSkill(input.value);
                 input.value = '';
              }} variant="secondary">Add</Button>
            </div>

            <div className="flex flex-col gap-4 min-h-[100px] p-4 bg-gray-50 rounded-lg border border-gray-200">
              {resumeData.skills.length === 0 && <span className="text-gray-400 italic">{resumeData.language === 'en' ? 'No skills added yet.' : 'ကျွမ်းကျင်မှုများ မထည့်ရသေးပါ။'}</span>}
              {resumeData.skills.map(skill => (
                <div key={skill.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <span className="font-medium text-gray-800">{skill.name}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          onClick={() => {
                            setResumeData(prev => ({
                              ...prev,
                              skills: prev.skills.map(s => s.id === skill.id ? { ...s, level: level as any } : s)
                            }));
                          }}
                          className={`w-6 h-6 rounded-full border transition-all ${
                            skill.level >= level ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-200 hover:border-blue-300'
                          }`}
                        />
                      ))}
                    </div>
                    <button onClick={() => removeSkill(skill.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case WizardStep.CUSTOM:
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Custom Sections</h2>
                <p className="text-gray-500 text-sm">Add sections for Volunteer Work, Awards, Publications, etc.</p>
              </div>
              <Button onClick={addCustomSection} variant="outline" icon={<Plus size={16} />}>Add Section</Button>
            </div>
            
             {resumeData.customSections.length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No custom sections added. Click "Add Section" to begin.</p>
              </div>
            )}

            {resumeData.customSections.map(section => (
              <div key={section.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative">
                 <button onClick={() => removeCustomSection(section.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                 
                 {/* Section Title Editor */}
                 <div className="mb-6 border-b border-gray-100 pb-4 pr-10">
                   <InputGroup 
                    label="Section Title" 
                    value={section.title} 
                    onChange={(v) => updateCustomSectionTitle(section.id, v)} 
                    placeholder="e.g. Volunteer Experience" 
                   />
                 </div>

                 {/* Items in Section */}
                 <div className="space-y-4">
                   {section.items.map(item => (
                     <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                        <button onClick={() => removeCustomItem(section.id, item.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                          <InputGroup label="Item Title" value={item.title} onChange={(v) => updateCustomItem(section.id, item.id, 'title', v)} placeholder="e.g. Award Name" />
                          <InputGroup label="Date / Location" value={item.date || ''} onChange={(v) => updateCustomItem(section.id, item.id, 'date', v)} placeholder="e.g. 2023" />
                        </div>
                        <InputGroup label="Subtitle / Organization" value={item.subtitle} onChange={(v) => updateCustomItem(section.id, item.id, 'subtitle', v)} placeholder="e.g. Organization Name" />
                        <InputGroup label="Description" value={item.description} onChange={(v) => updateCustomItem(section.id, item.id, 'description', v)} multiline placeholder="Details..." />
                     </div>
                   ))}
                   <Button onClick={() => addCustomItem(section.id)} variant="ghost" size="sm" icon={<Plus size={14} />}>Add Item to {section.title}</Button>
                 </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        );

      case WizardStep.THEME:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800">{t.theme}</h2>
            <ThemeEditor 
              theme={resumeData.theme} 
              onChange={updateTheme} 
              language={resumeData.language}
            />
          </div>
        );

      case WizardStep.FINALIZE:
        return (
          <div className="text-center space-y-8 py-10 animate-fadeIn">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Download size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.ready}</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                {resumeData.language === 'en' ? 'Review your document in the preview panel. You can download it as a PDF or export as text for ATS checking.' : 'သင့်၏ CV ကို Preview မှာ စစ်ဆေးကြည့်နိုင်ပါသည်။ PDF အဖြစ် ဒေါင်းလုဒ်လုပ်နိုင်သလို စာသားသီးသန့်လည်း ထုတ်ယူနိုင်ပါသည်။'}
              </p>
            </div>
            
            {/* Section Reordering */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 max-w-xl mx-auto shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4 flex items-center justify-center">
                  <Layers size={16} className="mr-2 text-blue-600" /> {resumeData.language === 'en' ? 'Reorder Sections' : 'အပိုင်းများကို အစီအစဉ် ပြန်စီရန်'}
                </h3>
                <div className="space-y-2">
                  {resumeData.sectionOrder.map((sectionId, index) => (
                    <div key={sectionId} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm transition-all hover:border-blue-300">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                          {index + 1}
                        </div>
                        <span className="text-sm font-semibold capitalize text-gray-700">{sectionId}</span>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => moveSection(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 disabled:opacity-20 transition-colors"
                        >
                          <ChevronLeft className="rotate-90" size={18} />
                        </button>
                        <button 
                          onClick={() => moveSection(index, 'down')}
                          disabled={index === resumeData.sectionOrder.length - 1}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 disabled:opacity-20 transition-colors"
                        >
                          <ChevronLeft className="-rotate-90" size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto">
              <Button 
                onClick={handleDownloadPDF} 
                disabled={isExporting}
                variant="primary" 
                className="px-8 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center justify-center"
              >
                {isExporting ? (resumeData.language === 'en' ? 'Downloading...' : 'ဒေါင်းလုဒ်လုပ်နေသည်...') : (
                  <><Download className="mr-2" size={24} /> {t.downloadPDF}</>
                )}
              </Button>
              
              <Button 
                onClick={handlePrint} 
                variant="outline" 
                className="px-8 py-4 text-lg border-2 hover:bg-gray-50 flex items-center justify-center"
              >
                <Printer className="mr-2" size={24} /> {t.printSave}
              </Button>
            </div>

            <div className="pt-4 space-y-4">
               <button onClick={handleExportTXT} className="text-sm text-gray-500 hover:text-gray-800 underline flex items-center mx-auto">
                 <FileText size={14} className="mr-1" /> {t.exportATS}
               </button>
               
               <div className="border-t border-gray-200 pt-8 mt-8">
                  <h3 className="text-xl font-bold mb-4">{resumeData.language === 'en' ? 'Bonus: AI Cover Letter' : 'အပိုဆောင်း- AI ဖြင့် Cover Letter ရေးရန်'}</h3>
                  {!coverLetter ? (
                    <Button onClick={handleGenerateCoverLetter} variant="ai" isLoading={loadingAI === 'cover-letter'}>
                      {resumeData.language === 'en' ? 'Generate Cover Letter' : 'Cover Letter ထုတ်ယူရန်'}
                    </Button>
                  ) : (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 text-left relative group">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed overflow-hidden max-h-[400px]">
                        {coverLetter}
                      </pre>
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                      <div className="flex justify-center gap-2 mt-4 relative z-10">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([coverLetter], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'CoverLetter.txt';
                            a.click();
                          }}
                        >
                          Download TXT
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setCoverLetter(null)}>Clear</Button>
                      </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ImportModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        isLoading={loadingAI === 'import'}
      />
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                <Briefcase size={20} />
              </div>
              <span className="text-xl font-bold text-gray-900">ResumeAI</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
               {/* Language Toggle */}
               <div className="flex bg-gray-100 p-1 rounded-lg mr-2 no-print">
                 <button 
                  onClick={() => setResumeData(prev => ({ ...prev, language: 'en' }))}
                  className={`px-2 py-1 text-xs font-bold rounded ${resumeData.language === 'en' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                 >
                   EN
                 </button>
                 <button 
                  onClick={() => setResumeData(prev => ({ ...prev, language: 'mm' }))}
                  className={`px-2 py-1 text-xs font-bold rounded ${resumeData.language === 'mm' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                 >
                   MM
                 </button>
               </div>

               {/* Cloud Saving Indicator */}
                {user && lastSaved && (
                   <div className="hidden md:flex items-center text-[10px] text-green-600 font-medium">
                     <Check size={12} className="mr-1" /> Cloud Saved
                   </div>
                )}

                {/* Resumes Library */}
                {user && (
                  <button 
                    onClick={() => setShowResumesModal(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1 text-sm font-medium"
                    title="My Documents"
                  >
                    <Folder size={18} />
                    <span className="hidden sm:inline">My Documents</span>
                  </button>
                )}

                {/* User Auth */}
                {!user ? (
                   <Button 
                    onClick={loginWithGoogle} 
                    variant="outline" 
                    size="sm" 
                    icon={<UserCircle size={18} />}
                   >
                     Login
                   </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <img 
                      src={user.photoURL || ''} 
                      alt="User" 
                      className="w-8 h-8 rounded-full border border-gray-200"
                    />
                    <button 
                      onClick={logout}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      title="Logout"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                )}
                
               <button 
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
               >
                 {isPreviewMode ? <Edit3 size={20} /> : <Eye size={20} />}
               </button>
               
               <Button onClick={handleExportTXT} variant="ghost" className="hidden sm:flex text-xs">
                 TXT
               </Button>
               <Button onClick={handlePrint} variant="outline" icon={<Printer size={16} />} className="hidden sm:flex">
                 Print
               </Button>
               <Button onClick={handleDownloadPDF} variant="primary" icon={<Download size={16} />} disabled={isExporting} className="hidden sm:flex">
                 {isExporting ? '...' : 'Download'}
               </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Editor Column (Wizard) */}
          <div className={`lg:col-span-5 flex flex-col h-full wizard-col ${isPreviewMode ? 'hidden lg:flex' : 'flex'} no-print`}>
            <Steps />
            
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 flex-1 overflow-y-auto">
               {renderStepContent()}

               <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                 <Button 
                    variant="ghost" 
                    onClick={() => setStep(prev => Math.max(0, prev - 1))}
                    disabled={step === 0}
                    icon={<ChevronLeft size={16} />}
                  >
                    Back
                  </Button>
                  
                  {step < WizardStep.FINALIZE && (
                    <Button 
                      onClick={() => setStep(prev => Math.min(WizardStep.FINALIZE, prev + 1))}
                    >
                      Next <ChevronRight size={16} className="ml-2" />
                    </Button>
                  )}
               </div>
            </div>
          </div>

          {/* Preview Column */}
          <div className={`lg:col-span-7 flex flex-col items-center bg-gray-200 rounded-2xl overflow-hidden relative ${isPreviewMode ? 'flex fixed inset-0 z-50 p-4 bg-gray-900 overflow-auto' : 'hidden lg:flex'}`}>
            <div className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-xl no-print">
              <span className="text-[10px] font-bold text-gray-400 px-2 uppercase tracking-widest">Zoom</span>
              <input 
                type="range" 
                min="0.3" 
                max="1.5" 
                step="0.05" 
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600 outline-none"
              />
              <span className="text-xs font-mono font-bold text-blue-600 w-10 text-center">{Math.round(zoom * 100)}%</span>
              
              {isPreviewMode && (
                 <button 
                  onClick={() => setIsPreviewMode(false)}
                  className="bg-gray-100 text-gray-600 p-1.5 rounded-full hover:bg-gray-200 transition-colors ml-2"
                 >
                   <X size={16} />
                 </button>
              )}
            </div>
            
            <div className={`w-full h-full overflow-auto p-4 sm:p-8 flex flex-col items-center justify-start print:p-0 print:overflow-visible`}>
              {/* Theme Editor - Desktop Only - Floating above preview */}
              <div className="w-full max-w-[210mm] mb-6 no-print">
                 <ThemeEditor theme={resumeData.theme} onChange={updateTheme} language={resumeData.language} />
              </div>
              <div className="print:shadow-none transition-all duration-300 transform-gpu origin-top">
                 <Preview data={debouncedResumeData} scale={zoom} />
              </div>
            </div>
          </div>

        </div>
      </main>
      {/* Saved Resumes Modal */}
      {showResumesModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Folder className="text-blue-600" />
                  My Resumes
                </h2>
                <button onClick={() => setShowResumesModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X />
                </button>
             </div>
             
             <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {/* Create New Card */}
                   <button 
                    onClick={createNewResume}
                    className="p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-3 group"
                   >
                     <PlusCircle size={32} className="text-gray-400 group-hover:text-blue-500" />
                     <span className="font-medium text-gray-600">Create New CV</span>
                   </button>

                   {/* Saved Resumes List */}
                   {savedResumes.map(resume => (
                     <div 
                      key={resume.id}
                      onClick={() => handleSelectResume(resume.id)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md relative group ${activeResumeId === resume.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                     >
                       <div className="flex justify-between items-start mb-2">
                         <div className="bg-gray-100 p-2 rounded-lg text-gray-400">
                           <FileText size={20} />
                         </div>
                         <button 
                          onClick={(e) => handleDeleteResume(resume.id, e)}
                          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                       <h3 className="font-bold text-gray-900 truncate pr-4">{resume.name}</h3>
                       <p className="text-[10px] text-gray-500 mt-1">
                         Updated: {resume.updatedAt?.toDate().toLocaleDateString()}
                       </p>
                       {activeResumeId === resume.id && (
                         <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-blue-600 font-bold">
                           <Check size={12} /> Active
                         </div>
                       )}
                     </div>
                   ))}
                </div>

                {savedResumes.length === 0 && (
                   <div className="text-center py-12">
                      <Layout size={48} className="mx-auto text-gray-200 mb-4" />
                      <p className="text-gray-500 italic">No saved resumes found in your cloud account.</p>
                   </div>
                )}
             </div>

             <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end text-xs text-gray-400">
                Logged in as: {user?.email}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
