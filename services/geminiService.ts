import { GoogleGenAI, Type } from "@google/genai";
import { Experience, PersonalInfo, ResumeData, Education, Skill } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = 'gemini-3-flash-preview';

export const generateSummary = async (info: PersonalInfo, experiences: Experience[]): Promise<string> => {
  if (!process.env.API_KEY) return "API Key missing. Please configure your environment.";

  const jobHistory = experiences.map(e => `${e.position} at ${e.company}`).join(', ');
  
  const prompt = `
    Write a professional, compelling professional summary (max 3-4 sentences) for a resume.
    
    Candidate Name: ${info.fullName}
    Target Job Title: ${info.jobTitle}
    Current Location: ${info.location}
    Work History: ${jobHistory}
    
    The tone should be confident, professional, and results-oriented. Focus on value proposition.
    Do not include placeholders like "[Your Name]".
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Error generating summary. Please try again.";
  }
};

export const enhanceExperienceDescription = async (position: string, company: string, currentDesc: string): Promise<string> => {
  if (!process.env.API_KEY) return "API Key missing.";

  const prompt = `
    Rewrite and improve the following job description bullet points for a resume.
    
    Role: ${position} at ${company}
    Current Draft: "${currentDesc}"
    
    Instructions:
    1. Use strong action verbs.
    2. Quantify results where possible (even if estimating, use placeholders like [X]%).
    3. Make it concise and professional.
    4. Return ONLY the bullet points, separated by newlines.
    5. Do not include introductory text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || currentDesc;
  } catch (error) {
    console.error("AI Error:", error);
    return currentDesc;
  }
};

export const suggestSkills = async (jobTitle: string, description: string): Promise<string[]> => {
  if (!process.env.API_KEY) return ["Communication", "Teamwork", "Problem Solving"];

  const prompt = `
    Suggest 10 relevant hard and soft skills for a ${jobTitle}.
    Context from resume: ${description.substring(0, 200)}...
    
    Return the result as a JSON array of strings only. Example: ["Skill 1", "Skill 2"]
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
};

export const parseResumeContent = async (content: string, mimeType: string = 'text/plain'): Promise<Partial<ResumeData>> => {
    if (!process.env.API_KEY) throw new Error("API Key missing");

    const prompt = `
      Extract resume data from the provided document and return it in the following JSON structure.
      
      Structure requirements:
      - personalInfo: fullName, email, phone, location, linkedin (url), website (url), summary, jobTitle
      - experience: array of objects { company, position, startDate, endDate, current (boolean), description }
      - education: array of objects { institution, degree, fieldOfStudy, startDate, endDate }
      - skills: array of objects { name, level (Beginner/Intermediate/Expert) }

      If a field is missing, leave it as an empty string or empty array.
      For 'current' in experience, set to true if the end date is 'Present' or missing.
      Format dates as "MM/YYYY" or "YYYY" if possible.
    `;

    // Construct the payload based on whether it's text or a file (image/pdf)
    let contentsPayload: any;
    
    if (mimeType === 'text/plain') {
        contentsPayload = `${prompt}\n\nRESUME TEXT:\n${content}`;
    } else {
        // For files (PDF/Images), content is base64 string
        contentsPayload = {
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: content
                    }
                }
            ]
        };
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: contentsPayload,
            config: {
                responseMimeType: "application/json",
            }
        });

        const text = response.text;
        if (!text) return {};
        
        const parsed = JSON.parse(text);
        
        // Post-process to ensure IDs exist
        if (parsed.experience) {
            parsed.experience = parsed.experience.map((e: any) => ({ ...e, id: crypto.randomUUID() }));
        }
        if (parsed.education) {
            parsed.education = parsed.education.map((e: any) => ({ ...e, id: crypto.randomUUID() }));
        }
        if (parsed.skills) {
            parsed.skills = parsed.skills.map((s: any) => ({ ...s, id: crypto.randomUUID(), level: s.level || 'Intermediate' }));
        }

        return parsed;

    } catch (error) {
        console.error("Parsing Error:", error);
        throw error;
    }
};