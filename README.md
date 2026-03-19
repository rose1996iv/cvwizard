# CVWizard

CVWizard is a production-minded resume and CV studio built with React, TypeScript, Vite, Firebase, and Gemini. It combines guided document authoring, AI-assisted content generation, cloud draft management, live preview, and export tooling in a single workflow.

## Highlights

- Professional multi-step editor for personal profile, experience, education, skills, custom sections, theming, and export.
- Live document preview with multiple templates, configurable typography, profile image controls, section ordering, and print-safe rendering.
- AI tools for summary generation, experience enhancement, grammar cleanup, skill suggestions, cover letter drafting, and resume parsing.
- Firebase authentication and Firestore-backed resume storage for multi-document cloud drafts.
- GitHub Pages deployment workflow included in `.github/workflows/deploy.yml`.

## Product Direction

This version is tuned to feel closer to an internal document studio than a simple form app:

- Three-panel product layout with a library rail, editor canvas, and inspector panel.
- Workspace-style shell with readiness tracking and document metrics.
- Stronger visual hierarchy for editor, preview, and theme controls.
- Better section-order fidelity across templates.
- Safer cloud draft lifecycle when deleting the active resume.
- Cleaner theme system with premium typography options.

## Tech Stack

- Frontend: React 19, TypeScript, Vite 6
- AI: Google Gemini via `@google/genai`
- Auth and data: Firebase Auth, Firestore
- UI: Tailwind utility classes, Lucide icons
- Deployment: GitHub Pages via GitHub Actions

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` into a local `.env` or `.env.local` file and provide your own keys:

```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run locally

```bash
npm run dev
```

The app starts on `http://localhost:3000`.

### 4. Build for production

```bash
npm run build
```

## Core Features

### Authoring

- Guided document builder with autosave behavior.
- Cloud draft switching for authenticated users.
- Custom sections for awards, volunteering, certifications, publications, or project work.

### AI Assistance

- Generate a role-specific summary.
- Improve experience bullets.
- Suggest missing skills.
- Check grammar and professional tone.
- Parse existing resume text, images, or PDF documents.
- Draft a cover letter from the current resume state.

### Output

- Print-safe preview.
- PDF export via `html2pdf`.
- Plain text export for ATS review.
- Section ordering across templates.

## Project Structure

```text
.
|-- components/         # UI building blocks, theme controls, preview, import flow
|-- hooks/              # Shared hooks such as debounce
|-- services/           # Firebase, auth, AI, and storage logic
|-- .github/workflows/  # Deployment automation
|-- App.tsx             # Product shell and editor orchestration
|-- translations.ts     # English and Burmese UI copy
|-- types.ts            # Shared data contracts
`-- vite.config.ts      # Build, aliasing, and chunk strategy
```

## Deployment

Pushes to `main` trigger the GitHub Pages pipeline defined in `.github/workflows/deploy.yml`. Before deploying, configure these repository secrets:

- `GEMINI_API_KEY`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Notes

- Gemini requests are currently made client-side. For stricter production security, move AI calls behind a server-side proxy.
- `.env` is gitignored. Do not commit live secrets.
- Firebase rules should be locked down per-user before broad public rollout.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```
