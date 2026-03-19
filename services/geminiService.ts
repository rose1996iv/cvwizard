import { GoogleGenAI, Type } from "@google/genai";
import { Experience, PersonalInfo, ResumeData, Education, Skill } from "../types";

const resolveApiKey = (): string =>
  (process.env.API_KEY || process.env.GEMINI_API_KEY || "").trim();

let cachedAi: GoogleGenAI | null | undefined;
const getAiClient = (): GoogleGenAI | null => {
  if (cachedAi !== undefined) return cachedAi;

  const apiKey = resolveApiKey();
  if (!apiKey) {
    cachedAi = null;
    return cachedAi;
  }

  try {
    cachedAi = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("AI init error:", error);
    cachedAi = null;
  }

  return cachedAi;
};

const hasApiKey = (): boolean => resolveApiKey().length > 0;

const modelId = 'gemini-2.0-flash';

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseJsonFromText = <T>(rawText: string): T => {
  const text = rawText.trim();
  const candidates: string[] = [text];

  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) candidates.push(fencedMatch[1].trim());

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(text.slice(firstBrace, lastBrace + 1).trim());
  }

  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    candidates.push(text.slice(firstBracket, lastBracket + 1).trim());
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // Try next candidate.
    }
  }

  throw new Error("AI returned invalid JSON.");
};

const getSectionLines = (content: string, headings: string[]): string[] => {
  const rawLines = content.replace(/\r/g, "").split("\n").map((line) => line.trim());
  const headingRegex = new RegExp(
    `^(${headings.map(escapeRegExp).join("|")})\\s*:?$`,
    "i"
  );
  const startIndex = rawLines.findIndex((line) => headingRegex.test(line));
  if (startIndex === -1) return [];

  const lines: string[] = [];
  for (let i = startIndex + 1; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (!line) {
      if (lines.length > 0) break;
      continue;
    }

    const looksLikeHeading =
      /^[A-Za-z][A-Za-z /&-]{2,40}:?$/.test(line) && !/^(?:•|-|\d+\.)/.test(line);
    if (looksLikeHeading && lines.length > 0) break;

    lines.push(line);
  }
  return lines;
};

const parseSkillsFromText = (content: string): Skill[] => {
  const sectionLines = getSectionLines(content, ["skills", "technical skills", "core skills"]);
  if (sectionLines.length === 0) return [];

  const raw = sectionLines.join(" ");
  return raw
    .split(/[,|]/)
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((name) => ({ id: crypto.randomUUID(), name, level: 3 as const }));
};

const parseResumeTextLocally = (content: string): Partial<ResumeData> => {
  const text = content.trim();
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const firstLine = lines[0] || "";
  const secondLine = lines[1] || "";

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+?\d[\d\s\-()]{7,}\d)/);
  const linkedInMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/[^\s)]+/i);
  const urlMatches = text.match(/https?:\/\/[^\s)]+/gi) || [];
  const website = urlMatches.find(
    (url) => !/linkedin\.com/i.test(url)
  ) || "";

  const summaryLines = getSectionLines(text, ["summary", "professional summary", "profile"]);
  const summary = summaryLines.join(" ").slice(0, 800);

  const skills = parseSkillsFromText(text);

  return {
    personalInfo: {
      fullName: firstLine,
      email: emailMatch?.[0] || "",
      phone: phoneMatch?.[0] || "",
      location: "",
      linkedin: linkedInMatch?.[0] || "",
      website,
      summary,
      summaryType: 'summary',
      jobTitle: secondLine && !/@/.test(secondLine) ? secondLine : "",
    },
    docType: 'cv',
    experience: [],
    education: [],
    skills,
  };
};

export const generateSummary = async (info: PersonalInfo, experiences: Experience[]): Promise<string> => {
  if (!hasApiKey()) return "API Key missing. Please configure your environment.";
  const ai = getAiClient();
  if (!ai) return "AI service is not available right now.";

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
  if (!hasApiKey()) return "API Key missing.";
  const ai = getAiClient();
  if (!ai) return currentDesc;

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
  if (!hasApiKey()) return ["Communication", "Teamwork", "Problem Solving"];
  const ai = getAiClient();
  if (!ai) return ["Communication", "Teamwork", "Problem Solving"];

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
    return parseJsonFromText<string[]>(text);
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
};

export const parseResumeContent = async (content: string, mimeType: string = 'text/plain'): Promise<Partial<ResumeData>> => {
    if (!content.trim()) {
      throw new Error("Resume content is empty.");
    }

    if (!hasApiKey()) {
      if (mimeType === "text/plain") {
        return parseResumeTextLocally(content);
      }
      throw new Error("Importing PDF/image requires a GEMINI_API_KEY. Use 'Paste Text' or configure API key.");
    }
    const ai = getAiClient();
    if (!ai) throw new Error("AI client failed to initialize");

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
            model: modelId,
            contents: contentsPayload,
            config: {
                responseMimeType: "application/json",
            }
        });

        const text = response.text;
        if (!text) throw new Error("AI returned an empty response.");
        
        const parsed = parseJsonFromText<any>(text);
        
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
        if (mimeType === "text/plain") {
          return parseResumeTextLocally(content);
        }
        throw error;
    }
};

export const generateCoverLetter = async (resumeData: ResumeData): Promise<string> => {
  if (!hasApiKey()) return "API Key missing.";
  const ai = getAiClient();
  if (!ai) return "AI service unavailable.";

  const { personalInfo, experience, skills } = resumeData;
  const prompt = `
    Write a professional and persuasive cover letter based on the following resume data.
    
    Candidate: ${personalInfo.fullName}
    Target Position: ${personalInfo.jobTitle}
    Key Skills: ${skills.map(s => s.name).join(', ')}
    Experience Summary: ${experience.map(e => `${e.position} at ${e.company}`).join('; ')}
    
    Instructions:
    1. Tone: Professional, enthusiastic, and confident.
    2. Focus on how the candidate's skills and experience match the target job title.
    3. Keep it to 3-4 paragraphs.
    4. Use placeholders like "[Hiring Manager Name]" or "[Company Name]" where appropriate.
    5. Return ONLY the letter text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "Could not generate cover letter.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Error generating cover letter.";
  }
};

export const checkGrammar = async (text: string): Promise<string> => {
    if (!hasApiKey()) return text;
    const ai = getAiClient();
    if (!ai) return text;

    const prompt = `
      Check the following text for grammar, spelling, and professional tone improvements. 
      Return the improved version only. If it's already perfect, return it as is.
      
      Text: "${text}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
        });
        return response.text || text;
    } catch (error) {
        return text;
    }
};
