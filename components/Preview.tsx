import React from 'react';
import { ResumeData } from '../types';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';

interface PreviewProps {
  data: ResumeData;
  scale?: number;
}

export const Preview: React.FC<PreviewProps> = ({ data, scale = 1 }) => {
  const { personalInfo, experience, education, skills, customSections, theme } = data;

  // Dynamic Styles based on Theme
  const primaryColor = theme.color;
  const backgroundColor = theme.backgroundColor || '#ffffff';
  const fontFamily = theme.font;

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  };

  const ensureUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
    <div 
      className="shadow-2xl mx-auto overflow-hidden print:shadow-none print:w-full print:h-auto print:overflow-visible print:m-0"
      style={{
        width: '210mm',
        minHeight: '297mm',
        backgroundColor: backgroundColor,
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        padding: '5mm 15mm', // Reduced top padding to 5mm
        fontFamily: `"${fontFamily}", sans-serif`,
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
              padding: 5mm 15mm !important; /* Matches inline style */
              /* Force background colors to print */
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background-color: ${backgroundColor} !important;
            }
            a {
              text-decoration: none !important;
              color: inherit !important;
            }
          }
          .theme-text { color: ${primaryColor}; }
          .theme-bg { background-color: ${primaryColor}; }
          .theme-border { border-color: ${primaryColor}; }
          .theme-bg-light { background-color: rgba(${hexToRgb(primaryColor)}, 0.1); }
          .theme-hover:hover { color: ${primaryColor}; text-decoration: underline; }
        `}
      </style>
      
      {/* Header */}
      <header className="border-b-2 theme-border pb-6 mb-6 flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight uppercase mb-2 break-words">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <p className="text-xl theme-text font-medium mb-4 break-words">
            {personalInfo.jobTitle || 'Target Job Title'}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {personalInfo.email && (
              <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                <Mail size={14} className="flex-shrink-0" />
                <span className="break-all">{personalInfo.email}</span>
              </a>
            )}
            {personalInfo.phone && (
              <a href={`tel:${personalInfo.phone}`} className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                <Phone size={14} className="flex-shrink-0" />
                <span className="break-all">{personalInfo.phone}</span>
              </a>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-1">
                <MapPin size={14} className="flex-shrink-0" />
                <span className="break-all">{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <a href={ensureUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                <Linkedin size={14} className="flex-shrink-0" />
                <span className="truncate max-w-[150px]">{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </a>
            )}
             {personalInfo.website && (
              <a href={ensureUrl(personalInfo.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                <Globe size={14} className="flex-shrink-0" />
                <span className="truncate max-w-[150px]">{personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </a>
            )}
          </div>
        </div>

        {/* Profile Image */}
        {personalInfo.profileImage && (
          <div className="flex-shrink-0">
             <img 
               src={personalInfo.profileImage} 
               alt="Profile" 
               className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md print:shadow-none"
               style={{ borderColor: primaryColor }}
             />
          </div>
        )}
      </header>

      {/* Two Column Layout */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Main Content Column */}
        <div className="col-span-8 space-y-6">
          
          {/* Summary */}
          {personalInfo.summary && (
            <section>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b theme-border pb-1">
                Professional Summary
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed text-justify whitespace-pre-line">
                {personalInfo.summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b theme-border pb-1">
                Work Experience
              </h2>
              <div className="space-y-5">
                {experience.map((exp) => (
                  <div key={exp.id} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-800">{exp.position}</h3>
                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap ml-2">
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-sm theme-text font-medium mb-2">{exp.company}</div>
                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line text-justify">
                      {exp.description}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

           {/* Custom Sections (Rendered in Main Column) */}
           {customSections.map((section) => (
            <section key={section.id} className="break-inside-avoid">
               <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b theme-border pb-1">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.id} className="break-inside-avoid">
                     <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-800">{item.title}</h3>
                      {(item.date || item.subtitle) && (
                         <span className="text-xs text-gray-500 font-medium whitespace-nowrap ml-2">
                           {item.date || item.subtitle}
                         </span>
                      )}
                    </div>
                    {item.subtitle && !item.date && (
                       <div className="text-sm theme-text font-medium mb-1">{item.subtitle}</div>
                    )}
                    {item.description && (
                      <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {item.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Sidebar Column */}
        <div className="col-span-4 space-y-8">
          
          {/* Education */}
          {education.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b theme-border pb-1">
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="break-inside-avoid">
                    <h3 className="font-bold text-gray-800 text-sm break-words">{edu.institution}</h3>
                    <div className="text-xs theme-text mb-1 break-words">{edu.degree}</div>
                    <div className="text-xs text-gray-500 italic">{edu.startDate} - {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b theme-border pb-1">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span 
                    key={skill.id} 
                    className="inline-block px-2 py-1 theme-bg-light text-gray-800 text-xs font-medium rounded border border-gray-200 print:border-gray-300 break-inside-avoid"
                    style={{ borderColor: 'transparent' }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};