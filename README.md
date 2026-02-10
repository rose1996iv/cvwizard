# CVWizard - Intelligent CV Builder

CVWizard is an AI-assisted resume builder that helps users create polished CVs through a step-by-step form and live preview.

## Features

- Multi-step resume wizard (personal info, experience, education, skills, custom sections)
- Live resume preview with theme customization
- AI-powered content generation using Gemini:
  - Professional summary generation
  - Experience bullet enhancement
  - Skill suggestions
  - Resume import and parsing
- PDF export for final resume download

## Tech Stack

- React 19 + TypeScript
- Vite
- Gemini API via `@google/genai`
- `lucide-react` icons

## Prerequisites

- Node.js 20 or newer
- A Gemini API key

## Local Development

1. Install dependencies:
   `npm install`
2. Create `.env.local` in the project root:
   `GEMINI_API_KEY=your_api_key_here`
3. Start the development server:
   `npm run dev`
4. Open the app in your browser (default):
   `http://localhost:3000`

## Scripts

- `npm run dev` - start development server
- `npm run build` - create production build
- `npm run preview` - preview production build locally

## Notes

- AI features require a valid `GEMINI_API_KEY`.
- The project maps `GEMINI_API_KEY` to `process.env.API_KEY` in `vite.config.ts` for client usage.
