# AI Resume & Interview Coach – Chennai IT Jobs

A free, India-first web app that acts like an AI assistant for resume optimization and interview preparation for Chennai IT roles.

## Features
- Platform-specific optimization modes: **Naukri**, **LinkedIn**, **Company ATS**
- Resume rewriting guidance for Indian IT hiring behavior
- JD keyword extraction (technical + soft skills + repeated terms)
- Resume scoring model:
  - ATS compatibility
  - Keyword relevance
  - Recruiter readability
- Interview prep assistant:
  - Technical mock questions by role
  - HR round coaching for Indian corporate context
- Chennai-specific trend feed and recruiter behavior notes
- Mobile-first, minimal-friction UI

## User Flow
1. Select target platform.
2. Paste resume text and JD/keywords.
3. Select role, experience level, and location (default Chennai).
4. Generate optimized resume output, scorecard, keyword insights, and interview coaching.

## Tech Stack
- Node.js (native HTTP server, no paid dependencies)
- Vanilla HTML/CSS/JS frontend
- Modular AI prompt/heuristic engine in `src/engine.js`

## Run Locally
```bash
npm start
```
Open `http://localhost:3000`.

## Test
```bash
npm test
```

## Notes
- This tool does **not** guarantee jobs.
- It is designed to improve shortlist probability using practical Chennai/India hiring patterns.
- Resume upload parsing from raw PDF/DOCX can be integrated later using open-source parsers to keep the platform free.
