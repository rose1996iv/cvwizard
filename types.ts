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
  level: 'Beginner' | 'Intermediate' | 'Expert';
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  jobTitle: string;
  profileImage?: string | null; // Base64 string
}

export interface Theme {
  color: string; // Hex code for text/accents
  backgroundColor: string; // Hex code for background
  font: 'Inter' | 'Merriweather' | 'Roboto' | 'Lato' | 'Open Sans';
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

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  customSections: CustomSection[];
  theme: Theme;
}

export enum WizardStep {
  PERSONAL = 0,
  EXPERIENCE = 1,
  EDUCATION = 2,
  SKILLS = 3,
  CUSTOM = 4,
  FINALIZE = 5
}

export interface AIResponse {
  text: string;
  error?: string;
}