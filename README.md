# CVWizard

CVWizard is an AI-powered resume builder that helps users create polished, ATS-friendly CVs through a guided multi-step workflow, real-time preview, and one-click PDF export.

## Live Demo

`https://joseph1997-eng.github.io/cvwizard/`

## Key Features

- Step-by-step resume builder (personal info, experience, education, skills, custom sections)
- Real-time resume preview while editing
- Theme customization (color, background, typography)
- AI assistance with Gemini:
  - Professional summary generation
  - Experience bullet enhancement
  - Skill suggestions
  - Resume parsing/import from content input
- PDF export for download and sharing

## Tech Stack

- React 19
- TypeScript
- Vite
- Gemini API (`@google/genai`)
- Lucide React icons

## Project Structure

`App.tsx` - main wizard and app state orchestration
`components/` - reusable UI components and preview templates
`services/geminiService.ts` - Gemini integration layer
`hooks/` - custom hooks (including debounced state updates)

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Gemini API key

### Installation

```bash
npm install
```

### Environment Setup

Create `.env.local` in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Run Locally

```bash
npm run dev
```

Default local URL:
`http://localhost:3000`

## Available Scripts

- `npm run dev` - start development server
- `npm run build` - build production assets
- `npm run preview` - preview production build locally

## Deployment

This project is configured for GitHub Pages using GitHub Actions.

- Workflow: `.github/workflows/deploy.yml`
- Production base path is set in `vite.config.ts` for repo deployment (`/cvwizard/`)

## Security Note

The current app passes API access from the client side. For production-grade security, move AI calls to a backend service and keep API keys server-side only.

## License

Add a `LICENSE` file to define usage and distribution terms.
