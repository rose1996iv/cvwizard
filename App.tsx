import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Briefcase, GraduationCap, Wrench, Download, 
  Sparkles, Trash2, Plus, ChevronLeft, ChevronRight, Eye, Printer, Edit3, Layers, Upload, X, Import, FileText
} from 'lucide-react';
import { ResumeData, WizardStep, Experience, Education, Skill, CustomSection, CustomItem, Theme } from './types';
import { Preview } from './components/Preview';
import { Button } from './components/Button';
import { InputGroup } from './components/InputGroup';
import { ThemeEditor } from './components/ThemeEditor';
import { ImportModal } from './components/ImportModal';
import { generateSummary, enhanceExperienceDescription, suggestSkills, parseResumeContent } from './services/geminiService';
import { useDebounce } from './hooks/useDebounce';

declare const html2pdf: any;

const App = () => {
  const [step, setStep] = useState<WizardStep>(WizardStep.PERSONAL);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Ref for auto-scrolling to new items
  const bottomRef = useRef<HTMLDivElement>(null);

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
      summary: '',
      jobTitle: '',
      profileImage: null,
    },
    experience: [],
    education: [],
    skills: [],
    customSections: [],
    theme: {
      color: '#2563eb',
      backgroundColor: '#ffffff',
      font: 'Inter'
    }
  });

  const debouncedResumeData = useDebounce(resumeData, 300);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

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

  const updateTheme = (field: keyof Theme, value: string) => {
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
    const newSkill: Skill = { id: crypto.randomUUID(), name, level: 'Intermediate' };
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
      .map(s => ({ id: crypto.randomUUID(), name: s, level: 'Intermediate' } as Skill));
    
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
        alert("Failed to parse resume. Please try again or enter details manually.");
        console.error(error);
    } finally {
        setLoadingAI(null);
    }
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('resume-preview');
    if (!element) return;

    // Use html2pdf.js for client-side generation
    if (typeof html2pdf !== 'undefined') {
        const opt = {
            margin: 0,
            filename: `${resumeData.personalInfo.fullName || 'Resume'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        try {
            await html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf: any) => {
                const totalPages = pdf.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);
                    pdf.setFontSize(9);
                    pdf.setTextColor(150);
                    // Add page number at bottom right: Page X of Y
                    pdf.text(`Page ${i} of ${totalPages}`, pdf.internal.pageSize.getWidth() - 25, pdf.internal.pageSize.getHeight() - 10);
                }
            }).save();
        } catch (e) {
            console.error("PDF Export failed", e);
            alert("Download failed. Falling back to print mode.");
            handlePrint();
        }
    } else {
        // Fallback if library missing
        handlePrint();
    }
    setIsExporting(false);
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
        { id: WizardStep.PERSONAL, icon: User, label: 'Personal' },
        { id: WizardStep.EXPERIENCE, icon: Briefcase, label: 'Experience' },
        { id: WizardStep.EDUCATION, icon: GraduationCap, label: 'Education' },
        { id: WizardStep.SKILLS, icon: Wrench, label: 'Skills' },
        { id: WizardStep.CUSTOM, icon: Layers, label: 'Custom' },
        { id: WizardStep.FINALIZE, icon: Download, label: 'Finalize' },
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
                   <h2 className="text-2xl font-bold text-gray-800">Let's start with the basics</h2>
                   <p className="text-gray-500 text-sm mt-1">Fill in your details or import from an existing resume.</p>
                </div>
                <Button 
                   onClick={() => setShowImportModal(true)} 
                   variant="ai" 
                   icon={<Import size={16} />}
                >
                    Import Resume / LinkedIn
                </Button>
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
              <InputGroup label="Full Name" value={resumeData.personalInfo.fullName} onChange={(v) => updatePersonalInfo('fullName', v)} placeholder="John Doe" />
              <InputGroup label="Target Job Title" value={resumeData.personalInfo.jobTitle} onChange={(v) => updatePersonalInfo('jobTitle', v)} placeholder="Software Engineer" />
              <InputGroup label="Email" type="email" value={resumeData.personalInfo.email} onChange={(v) => updatePersonalInfo('email', v)} placeholder="john@example.com" />
              <InputGroup label="Phone" value={resumeData.personalInfo.phone} onChange={(v) => updatePersonalInfo('phone', v)} placeholder="+1 555 123 4567" />
              <InputGroup label="Location" value={resumeData.personalInfo.location} onChange={(v) => updatePersonalInfo('location', v)} placeholder="San Francisco, CA" />
              <InputGroup label="LinkedIn URL" value={resumeData.personalInfo.linkedin} onChange={(v) => updatePersonalInfo('linkedin', v)} placeholder="linkedin.com/in/johndoe" />
              <InputGroup label="Portfolio Website" value={resumeData.personalInfo.website} onChange={(v) => updatePersonalInfo('website', v)} placeholder="johndoe.com" />
            </div>
            
            <div className="relative">
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-semibold text-gray-700">Professional Summary</label>
                <button 
                  onClick={handleGenerateSummary}
                  disabled={loadingAI === 'summary' || !resumeData.personalInfo.jobTitle}
                  className="flex items-center text-xs font-medium text-purple-600 hover:text-purple-700 disabled:opacity-50 transition-colors"
                >
                  <Sparkles size={14} className="mr-1" />
                  {loadingAI === 'summary' ? 'Generating...' : 'Auto-Generate with AI'}
                </button>
              </div>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow min-h-[150px]"
                value={resumeData.personalInfo.summary}
                onChange={e => updatePersonalInfo('summary', e.target.value)}
                placeholder="Briefly describe your professional background and goals..."
              />
            </div>
          </div>
        );

      case WizardStep.EXPERIENCE:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Work Experience</h2>
              <Button onClick={addExperience} variant="outline" icon={<Plus size={16} />}>Add Position</Button>
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
                  <InputGroup label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, 'company', v)} placeholder="Acme Inc" />
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
                    <button 
                      onClick={() => handleEnhanceExperience(exp.id)}
                      disabled={loadingAI === `exp-${exp.id}` || !exp.description}
                      className="flex items-center text-xs font-medium text-purple-600 hover:text-purple-700 disabled:opacity-50 transition-colors"
                    >
                      <Sparkles size={14} className="mr-1" />
                      {loadingAI === `exp-${exp.id}` ? 'Enhancing...' : 'Enhance with AI'}
                    </button>
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

      // ... (Education, Skills, Custom Sections same as before) ...
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

            <div className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-gray-50 rounded-lg border border-gray-200">
              {resumeData.skills.length === 0 && <span className="text-gray-400 italic">No skills added yet.</span>}
              {resumeData.skills.map(skill => (
                <span key={skill.id} className="inline-flex items-center px-3 py-1 bg-white text-gray-800 rounded-full border border-gray-300 shadow-sm">
                  {skill.name}
                  <button onClick={() => removeSkill(skill.id)} className="ml-2 text-gray-400 hover:text-red-500 transition-colors">
                    <times className="font-bold">×</times>
                  </button>
                </span>
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

      case WizardStep.FINALIZE:
        return (
          <div className="text-center space-y-8 py-10 animate-fadeIn">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Download size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Resume is Ready!</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Review your document in the preview panel. You can download it as a PDF or export as text for ATS checking.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto">
              <Button 
                onClick={handleDownloadPDF} 
                disabled={isExporting}
                variant="primary" 
                className="px-8 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center justify-center"
              >
                {isExporting ? (
                  <>Downloading...</>
                ) : (
                  <><Download className="mr-2" size={24} /> Download PDF</>
                )}
              </Button>
              
              <Button 
                onClick={handlePrint} 
                variant="outline" 
                className="px-8 py-4 text-lg border-2 hover:bg-gray-50 flex items-center justify-center"
              >
                <Printer className="mr-2" size={24} /> Print / Save as PDF
              </Button>
            </div>

            <div className="pt-4">
               <button onClick={handleExportTXT} className="text-sm text-gray-500 hover:text-gray-800 underline flex items-center mx-auto">
                 <FileText size={14} className="mr-1" /> Export as Plain Text (for ATS)
               </button>
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
          <div className={`lg:col-span-7 flex flex-col items-center print-layout ${isPreviewMode ? 'flex fixed inset-0 z-50 bg-gray-900 p-4 overflow-auto' : 'hidden lg:flex'}`}>
             {isPreviewMode && (
               <button 
                onClick={() => setIsPreviewMode(false)}
                className="absolute top-4 right-4 bg-white/10 text-white p-2 rounded-full hover:bg-white/20 no-print"
               >
                 <X className="text-xl" />
               </button>
             )}
             
             <div className="w-full h-full flex flex-col items-center justify-start overflow-y-auto py-4 print:p-0 print:overflow-visible print:block">
                
                {/* Theme Editor (Desktop Only - Floating above preview) */}
                <div className="w-full max-w-[210mm] mb-4 no-print">
                   <ThemeEditor theme={resumeData.theme} onChange={updateTheme} />
                </div>

                <div className={`transition-transform duration-300 ${isPreviewMode ? 'scale-100 md:scale-90' : 'scale-[0.65] xl:scale-[0.80] origin-top'} print:transform-none print:w-full`}>
                   <Preview data={debouncedResumeData} />
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;