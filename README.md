# AceMyInterview

AceMyInterview is a full stack interview practice application built with Next.js, TypeScript, Supabase, and Gemini AI.

Users can start a mock interview for a selected role, answer a set of questions, and receive structured AI feedback on a review page.

## Features

- Role-based mock interviews
- Reusable global question bank
- Session-specific question selection (5 random questions per session)
- Interview history with score tracking
- Answer persistence
- AI-generated structured feedback (Gemini)
- Multi-dimensional scoring (communication, technical depth, problem solving)
- Strengths, weaknesses, improvements, and study topics
- Per-question tags, concept coverage, and reference answers
- Completeness signals for partial or brief submissions

## Tech Stack

- Next.js (App Router)
- TypeScript
- React
- Supabase (PostgreSQL + Auth)
- Google Gemini API

## Database Design

See [SUPABASE_DB_SCHEMA.md](./SUPABASE_DB_SCHEMA.md) for full details.

- **sessions** — one interview attempt per user
- **questions** — global question bank
- **session_questions** — links sessions to selected questions
- **answers** — user responses per question
- **feedback** — one row per session with `overall_score`, `summary`, and `evaluation_json` (v2)

## Running Locally

Install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

If upgrading from an older feedback format, run the fresh-slate SQL in [SUPABASE_DB_SCHEMA.md](./SUPABASE_DB_SCHEMA.md) before testing.

Start the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Current Status

**Implemented:**

- Session creation and interview flow
- Question bank with join-table architecture
- Supabase auth and data persistence
- Gemini-powered feedback (v2 structured evaluation)
- Review page with scoring dimensions, SWI cards, and per-question breakdown
- History page with scores and same-role progress delta

**Planned:**

- PDF export of feedback
- Additional interview roles
- UI polish and role selector from database

## Learning Goals

This project is used to learn:

- Next.js App Router
- TypeScript
- PostgreSQL data modeling
- Supabase
- Full stack application architecture
- AI integration workflows
