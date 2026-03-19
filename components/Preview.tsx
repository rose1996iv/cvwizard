import React from 'react';
import { ResumeData, SectionId } from '../types';
import { Mail, Phone, MapPin, Linkedin, Globe, User, Briefcase, GraduationCap, Wrench, Layers } from 'lucide-react';
import { translations } from '../translations';

interface PreviewProps {
  data: ResumeData;
  scale?: number;
}

type ContactItem = {
  key: string;
  value: string;
  href?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

export const Preview: React.FC<PreviewProps> = ({ data, scale = 1 }) => {
  const { personalInfo, experience, education, skills, customSections, theme, language = 'en' } = data;
  const t = translations[language];

  const primaryColor = theme.color;
  const backgroundColor = theme.backgroundColor || '#ffffff';
  const fontFamily = theme.font || 'Manrope';
  const templateId = theme.templateId || 'modern';
  const compactSpacing = theme.compactMode ? 'mb-4' : 'mb-6';
  const orderedSectionIds = data.sectionOrder || ['summary', 'experience', 'education', 'skills', 'custom'];

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  };

  const ensureUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const getProfileShapeClass = () => {
    switch (theme.profileShape) {
      case 'square':
        return 'rounded-none';
      case 'rounded':
        return 'rounded-[28px]';
      case 'circle':
      default:
        return 'rounded-full';
    }
  };

  const getProfileSizeClass = () => {
    switch (theme.profileSize) {
      case 'sm':
        return 'w-20 h-20';
      case 'lg':
        return 'w-36 h-36';
      case 'md':
      default:
        return 'w-28 h-28';
    }
  };

  const SkillDots = ({ level }: { level: number }) => {
    const normalizedLevel = Math.max(1, Math.min(5, Math.round(Number(level) || 0)));

    return (
      <div className="mt-2 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all ${index <= normalizedLevel ? 'theme-bg w-5' : 'bg-slate-200 w-3'}`}
          />
        ))}
      </div>
    );
  };

  const SectionHeading = ({
    children,
    icon: Icon,
  }: {
    children: React.ReactNode;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
  }) => (
    <div className="mb-3 flex items-center gap-3">
      <div className="flex items-center gap-2">
        {theme.showIcons && Icon && (
          <span className="theme-bg-light theme-text inline-flex h-7 w-7 items-center justify-center rounded-full">
            <Icon size={14} />
          </span>
        )}
        <h2 className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-900">{children}</h2>
      </div>
      <div className="theme-divider h-px flex-1" />
    </div>
  );

  const contactItems: ContactItem[] = [
    { key: 'email', value: personalInfo.email, href: personalInfo.email ? `mailto:${personalInfo.email}` : undefined, icon: Mail },
    { key: 'phone', value: personalInfo.phone, href: personalInfo.phone ? `tel:${personalInfo.phone}` : undefined, icon: Phone },
    { key: 'location', value: personalInfo.location, icon: MapPin },
    { key: 'linkedin', value: personalInfo.linkedin, href: ensureUrl(personalInfo.linkedin), icon: Linkedin },
    { key: 'website', value: personalInfo.website, href: ensureUrl(personalInfo.website), icon: Globe },
  ].filter((item) => item.value);

  const renderSummary = () =>
    personalInfo.summary && (
      <section className={`${compactSpacing} break-inside-avoid`}>
        <SectionHeading icon={User}>
          {personalInfo.summaryType === 'objective' ? t.careerObjective : t.profileSummary}
        </SectionHeading>
        <p className="whitespace-pre-line text-[13px] leading-7 text-slate-600">{personalInfo.summary}</p>
      </section>
    );

  const renderExperience = () =>
    experience.length > 0 && (
      <section className={`${compactSpacing} break-inside-avoid`}>
        <SectionHeading icon={Briefcase}>{t.experience}</SectionHeading>
        <div className="space-y-5">
          {experience.map((exp) => (
            <article
              key={exp.id}
              className="break-inside-avoid rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
            >
              <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{exp.position}</h3>
                  <p className="theme-text mt-1 text-xs font-semibold uppercase tracking-[0.2em]">{exp.company}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' - ')}
                </span>
              </div>
              {exp.description && <div className="whitespace-pre-line text-[12px] leading-6 text-slate-600">{exp.description}</div>}
            </article>
          ))}
        </div>
      </section>
    );

  const renderEducation = () =>
    education.length > 0 && (
      <section className={`${compactSpacing} break-inside-avoid`}>
        <SectionHeading icon={GraduationCap}>{t.education}</SectionHeading>
        <div className="space-y-4">
          {education.map((edu) => (
            <article key={edu.id} className="break-inside-avoid rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4">
              <h3 className="text-sm font-bold text-slate-900">{edu.institution}</h3>
              <p className="theme-text mt-1 text-xs font-semibold">{[edu.degree, edu.fieldOfStudy].filter(Boolean).join(' • ')}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                {[edu.startDate, edu.current ? 'Present' : edu.endDate].filter(Boolean).join(' - ')}
              </p>
            </article>
          ))}
        </div>
      </section>
    );

  const renderSkills = () =>
    skills.length > 0 && (
      <section className={`${compactSpacing} break-inside-avoid`}>
        <SectionHeading icon={Wrench}>{t.skills}</SectionHeading>
        <div className="grid grid-cols-2 gap-3">
          {skills.map((skill) => (
            <article key={skill.id} className="break-inside-avoid rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3">
              <div className="text-xs font-semibold text-slate-900">{skill.name}</div>
              <SkillDots level={skill.level} />
            </article>
          ))}
        </div>
      </section>
    );

  const renderCustomSections = () =>
    customSections.map((section) => (
      <section key={section.id} className={`${compactSpacing} break-inside-avoid`}>
        <SectionHeading icon={Layers}>{section.title}</SectionHeading>
        <div className="space-y-4">
          {section.items.map((item) => (
            <article key={item.id} className="break-inside-avoid rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  {item.subtitle && <p className="mt-1 text-xs font-medium text-slate-500">{item.subtitle}</p>}
                </div>
                {item.date && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    {item.date}
                  </span>
                )}
              </div>
              {item.description && <div className="whitespace-pre-line text-[12px] leading-6 text-slate-600">{item.description}</div>}
            </article>
          ))}
        </div>
      </section>
    ));

  const sectionRenderers: Record<SectionId, () => React.ReactNode> = {
    summary: renderSummary,
    experience: renderExperience,
    education: renderEducation,
    skills: renderSkills,
    custom: renderCustomSections,
  };

  const renderOrderedSections = (ids: SectionId[]) =>
    ids.map((id) => <React.Fragment key={id}>{sectionRenderers[id]()}</React.Fragment>);

  const mainColumnIds = orderedSectionIds.filter((id) => ['summary', 'experience', 'custom'].includes(id));
  const sideColumnIds = orderedSectionIds.filter((id) => ['education', 'skills'].includes(id));

  const headerContent = (
    <header
      className={`relative mb-7 overflow-hidden rounded-[32px] border ${
        templateId === 'creative'
          ? 'border-transparent text-white'
          : 'border-slate-200/80 bg-white/80 backdrop-blur-sm'
      } p-8`}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            templateId === 'creative'
              ? `radial-gradient(circle at top right, rgba(${hexToRgb(primaryColor)}, 0.55), transparent 44%), linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`
              : `radial-gradient(circle at top right, rgba(${hexToRgb(primaryColor)}, 0.12), transparent 36%), linear-gradient(180deg, rgba(255,255,255,0.88), rgba(248,250,252,0.96))`,
        }}
      />
      <div className="relative flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] ${templateId === 'creative' ? 'bg-white/15 text-white' : 'bg-slate-900 text-white'}`}>
              {data.docType === 'cv' ? t.cv : t.resume}
            </span>
            <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${templateId === 'creative' ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-500'}`}>
              {templateId}
            </span>
          </div>
          <h1 className={`break-words text-4xl font-black tracking-tight ${templateId === 'creative' ? 'text-white' : 'text-slate-950'}`}>
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <p className={`mt-3 break-words text-lg font-semibold ${templateId === 'creative' ? 'text-white/85' : 'theme-text'}`}>
            {personalInfo.jobTitle || 'Target Job Title'}
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {contactItems.length > 0 ? (
              contactItems.map((item) => {
                const content = (
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-medium ${templateId === 'creative' ? 'border-white/15 bg-white/10 text-white/90' : 'border-slate-200 bg-white/85 text-slate-600 shadow-sm'}`}>
                    <item.icon size={13} className={templateId === 'creative' ? 'text-white/80' : 'theme-text'} />
                    <span className="truncate">{item.value}</span>
                  </span>
                );

                return item.href ? (
                  <a key={item.key} href={item.href} target="_blank" rel="noreferrer" className="max-w-full">
                    {content}
                  </a>
                ) : (
                  <div key={item.key} className="max-w-full">
                    {content}
                  </div>
                );
              })
            ) : (
              <div className={`rounded-2xl border border-dashed px-4 py-3 text-xs ${templateId === 'creative' ? 'border-white/20 text-white/80' : 'border-slate-200 text-slate-400'}`}>
                Add contact details to complete your document header.
              </div>
            )}
          </div>
        </div>

        {personalInfo.profileImage && theme.showProfile && (
          <div className="flex-shrink-0">
            <div
              className={`${getProfileSizeClass()} ${getProfileShapeClass()} overflow-hidden border-[6px] shadow-2xl`}
              style={{ borderColor: templateId === 'creative' ? 'rgba(255,255,255,0.22)' : primaryColor }}
            >
              <img
                src={personalInfo.profileImage}
                alt="Profile"
                className="h-full w-full object-cover transition-transform duration-200"
                style={{ transform: `scale(${theme.profileZoom || 1})` }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );

  const renderContent = () => {
    switch (templateId) {
      case 'classic':
        return (
          <div className="space-y-1">
            {headerContent}
            {renderOrderedSections(orderedSectionIds)}
          </div>
        );
      case 'creative':
        return (
          <>
            {headerContent}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-7 flex flex-col gap-1">{renderOrderedSections(mainColumnIds)}</div>
              <div className="col-span-5 flex flex-col gap-1">{renderOrderedSections(sideColumnIds)}</div>
            </div>
          </>
        );
      case 'sidebar':
      case 'modern':
      default: {
        const isSidebarLeft = templateId === 'sidebar';
        return (
          <>
            {headerContent}
            <div className="grid grid-cols-12 gap-6">
              <div className={`col-span-8 flex flex-col gap-1 ${isSidebarLeft ? 'order-2' : 'order-1'}`}>
                {renderOrderedSections(mainColumnIds)}
              </div>
              <div className={`col-span-4 flex flex-col gap-1 ${isSidebarLeft ? 'order-1' : 'order-2'}`}>
                {renderOrderedSections(sideColumnIds)}
              </div>
            </div>
          </>
        );
      }
    }
  };

  return (
    <div
      className="mx-auto overflow-hidden rounded-[36px] border border-slate-200/70 shadow-[0_40px_120px_rgba(15,23,42,0.12)] transition-transform duration-300 print:m-0 print:h-auto print:w-full print:overflow-visible print:shadow-none"
      style={{
        width: '210mm',
        minHeight: '297mm',
        backgroundColor,
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        padding: theme.compactMode ? '8mm 12mm' : '10mm 15mm',
        fontFamily: `"${fontFamily}", sans-serif`,
        lineHeight: theme.compactMode ? '1.45' : '1.65',
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
          .theme-bg-light { background-color: rgba(${hexToRgb(primaryColor)}, 0.12); }
          .theme-divider { background: linear-gradient(90deg, rgba(${hexToRgb(primaryColor)}, 0.45), rgba(${hexToRgb(primaryColor)}, 0.05)); }
        `}
      </style>

      {renderContent()}
    </div>
  );
};
