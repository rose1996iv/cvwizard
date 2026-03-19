import React from 'react';
import { ResumeData, SectionId } from '../types';
import { Mail, Phone, MapPin, Linkedin, Globe, Star, User, Briefcase, GraduationCap, Wrench, Layers } from 'lucide-react';
import { translations } from '../translations';

interface PreviewProps {
  data: ResumeData;
  scale?: number;
}

export const Preview: React.FC<PreviewProps> = ({ data, scale = 1 }) => {
  const { personalInfo, experience, education, skills, customSections, theme, language = 'en' } = data;
  const t = translations[language];

  // Dynamic Styles based on Theme
  const primaryColor = theme.color;
  const backgroundColor = theme.backgroundColor || '#ffffff';
  const fontFamily = theme.font;
  const templateId = theme.templateId || 'modern';

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  };

  const ensureUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const SkillDots = ({ level }: { level: number }) => (
    <div className="flex gap-1 mt-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div 
          key={i} 
          className={`w-1.5 h-1.5 rounded-full ${i <= level ? 'theme-bg' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );


  const getProfileShapeClass = () => {
    switch(theme.profileShape) {
      case 'square': return 'rounded-none';
      case 'rounded': return 'rounded-2xl';
      case 'circle': 
      default: return 'rounded-full';
    }
  };

  const getProfileSizeClass = () => {
    switch(theme.profileSize) {
      case 'sm': return 'w-20 h-20';
      case 'lg': return 'w-36 h-36';
      case 'md': 
      default: return 'w-28 h-28';
    }
  };

  const SectionHeading = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
    <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 border-b-2 theme-border pb-1 ${templateId === 'creative' ? 'theme-text border-l-4 pl-2' : 'text-gray-900'} flex items-center gap-2`}>
      {theme.showIcons && Icon && <Icon size={14} className={templateId === 'creative' ? 'theme-text' : 'text-gray-400'} />}
      {children}
    </h2>
  );

  const renderSummary = () => personalInfo.summary && (
    <section className="mb-6 break-inside-avoid">
      <SectionHeading icon={User}>
        {personalInfo.summaryType === 'objective' ? t.careerObjective : t.profileSummary}
      </SectionHeading>
      <p className="text-sm text-gray-700 leading-relaxed text-justify whitespace-pre-line">
        {personalInfo.summary}
      </p>
    </section>
  );

  const renderExperience = () => experience.length > 0 && (
    <section className={theme.compactMode ? 'mb-4' : 'mb-6'}>
      <SectionHeading icon={Briefcase}>{t.experience}</SectionHeading>
      <div className="space-y-5">
        {experience.map((exp) => (
          <div key={exp.id} className="break-inside-avoid">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="font-bold text-gray-800 text-sm">{exp.position}</h3>
              <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap ml-2">
                {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
              </span>
            </div>
            <div className="text-sm theme-text font-bold mb-2">{exp.company}</div>
            <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line text-justify">
              {exp.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderEducation = () => education.length > 0 && (
    <section className={theme.compactMode ? 'mb-4' : 'mb-6'}>
      <SectionHeading icon={GraduationCap}>{t.education}</SectionHeading>
      <div className="space-y-4">
        {education.map((edu) => (
          <div key={edu.id} className="break-inside-avoid">
            <h3 className="font-bold text-gray-800 text-sm">{edu.institution}</h3>
            <div className="text-xs theme-text font-medium">{edu.degree}</div>
            <div className="text-[10px] text-gray-500 italic">{edu.startDate} - {edu.endDate}</div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderSkills = () => skills.length > 0 && (
    <section className={theme.compactMode ? 'mb-4' : 'mb-6'}>
      <SectionHeading icon={Wrench}>{t.skills}</SectionHeading>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {skills.map((skill) => (
          <div key={skill.id} className="break-inside-avoid">
            <div className="text-xs font-medium text-gray-800">{skill.name}</div>
            <SkillDots level={skill.level} />
          </div>
        ))}
      </div>
    </section>
  );

  const renderCustomSections = () => customSections.map((section) => (
    <section key={section.id} className={`${theme.compactMode ? 'mb-4' : 'mb-6'} break-inside-avoid`}>
      <SectionHeading icon={Layers}>{section.title}</SectionHeading>
      <div className="space-y-4">
        {section.items.map((item) => (
          <div key={item.id} className="break-inside-avoid">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="font-bold text-gray-800 text-sm">{item.title}</h3>
              {(item.date || item.subtitle) && (
                <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap ml-2">
                  {item.date || item.subtitle}
                </span>
              )}
            </div>
            {item.description && (
              <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                {item.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  ));

  const sections: Record<SectionId, () => React.ReactNode> = {
    summary: renderSummary,
    experience: renderExperience,
    education: renderEducation,
    skills: renderSkills,
    custom: renderCustomSections,
  };

  const headerContent = (
    <header className={`${templateId === 'creative' ? 'theme-bg text-white p-8 -mx-10 -mt-10 mb-8 rounded-b-[40px]' : 'border-b-2 theme-border pb-6 mb-6'} flex items-start justify-between gap-6`}>
      <div className="flex-1 min-w-0 relative">
        <div className="absolute -top-2 right-0 no-print">
          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${templateId === 'creative' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
            {data.docType === 'cv' ? t.cv : t.resume}
          </span>
        </div>
        <h1 className={`text-4xl font-extrabold tracking-tight uppercase mb-2 break-words ${templateId === 'creative' ? 'text-white' : 'text-gray-900'}`}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <p className={`text-xl font-bold mb-4 break-words ${templateId === 'creative' ? 'text-white/90' : 'theme-text'}`}>
          {personalInfo.jobTitle || 'Target Job Title'}
        </p>

        <div className={`flex flex-wrap gap-4 text-[11px] ${templateId === 'creative' ? 'text-white/80' : 'text-gray-600'}`}>
          {personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail size={12} />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone size={12} />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span>{personalInfo.location}</span>
            </div>
          )}
        </div>
      </div>

      {personalInfo.profileImage && theme.showProfile && (
        <div className="flex-shrink-0">
           <div className={`${getProfileSizeClass()} ${getProfileShapeClass()} overflow-hidden border-4 border-white shadow-lg relative`} style={{ borderColor: primaryColor }}>
             <img 
               src={personalInfo.profileImage} 
               alt="Profile" 
               className="w-full h-full object-cover transition-transform duration-200"
               style={{ transform: `scale(${theme.profileZoom || 1})` }}
             />
           </div>
        </div>
      )}
    </header>
  );

  const renderContent = () => {
    switch (templateId) {
      case 'classic':
        return (
          <div className="space-y-4">
            {headerContent}
            {data.sectionOrder.map(id => sections[id]())}
          </div>
        );
      case 'sidebar':
      case 'modern':
      default:
        const isSidebarLeft = templateId === 'sidebar';
        return (
          <>
            {headerContent}
            <div className="grid grid-cols-12 gap-8">
              <div className={`col-span-8 flex flex-col gap-2 ${isSidebarLeft ? 'order-2' : 'order-1'}`}>
                {renderSummary()}
                {renderExperience()}
                {renderCustomSections()}
              </div>
              <div className={`col-span-4 flex flex-col gap-6 ${isSidebarLeft ? 'order-1' : 'order-2'}`}>
                {renderEducation()}
                {renderSkills()}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div 
      className="shadow-2xl mx-auto overflow-hidden print:shadow-none print:w-full print:h-auto print:overflow-visible print:m-0 transition-transform duration-300"
      style={{
        width: '210mm',
        minHeight: '297mm',
        backgroundColor: backgroundColor,
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        padding: theme.compactMode ? '8mm 12mm' : '10mm 15mm',
        fontFamily: `"${fontFamily}", sans-serif`,
        lineHeight: theme.compactMode ? '1.4' : '1.6',
      }}
      id="resume-preview"
    >
      <style>
        {`
          @media print {
            #resume-preview {
              transform: none !important;
              width: 100% !important;
              min-height: 100vh !important;
              box-shadow: none !important;
              margin: 0 !important;
              padding: 10mm 15mm !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background-color: ${backgroundColor} !important;
            }
          }
          .theme-text { color: ${primaryColor}; }
          .theme-bg { background-color: ${primaryColor}; }
          .theme-border { border-color: ${primaryColor}; }
          .theme-bg-light { background-color: rgba(${hexToRgb(primaryColor)}, 0.1); }
        `}
      </style>
      
      {renderContent()}
    </div>
  );
};