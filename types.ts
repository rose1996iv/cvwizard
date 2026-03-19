export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface Skill {
  id: string;
  name: string;
  level: 1 | 2 | 3 | 4 | 5; // Numeric level for better UI visualization
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  summaryType: 'summary' | 'objective';
  jobTitle: string;
  profileImage?: string | null; // Base64 string
}

export interface CustomItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  date?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomItem[];
}

export type TemplateId = 'modern' | 'classic' | 'sidebar' | 'creative';

export interface Theme {
  color: string; 
  backgroundColor: string;
  font: 'Inter' | 'Merriweather' | 'Roboto' | 'Lato' | 'Open Sans';
  templateId: TemplateId;
  showProfile: boolean;
  profileShape: 'circle' | 'square' | 'rounded';
  profileSize: 'sm' | 'md' | 'lg';
  showIcons: boolean;
  compactMode: boolean;
}

export type SectionId = 'summary' | 'experience' | 'education' | 'skills' | 'custom';

export interface ResumeData {
  personalInfo: PersonalInfo;
  docType: 'cv' | 'resume';
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  customSections: CustomSection[];
  theme: Theme;
  sectionOrder: SectionId[];
  language: 'en' | 'mm';
}

export enum WizardStep {
  PERSONAL = 0,
  EXPERIENCE = 1,
  EDUCATION = 2,
  SKILLS = 3,
  CUSTOM = 4,
  THEME = 5, // Split Finalize and Theme
  FINALIZE = 6
}

export interface AIResponse {
  text: string;
  error?: string;
}