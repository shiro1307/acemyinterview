# AceMyInterview

AceMyInterview is a full stack interview practice application built with Next.js, TypeScript, and Supabase.

Users can start a mock interview for a selected role, answer a set of questions, and review their session afterwards. The project is being developed as a learning exercise in full stack development, database design, and AI-powered interview feedback.

## Features

- Role-based mock interviews
- Reusable global question bank
- Session-specific question selection
- Interview history tracking
- Answer persistence
- Feedback pipeline structure ready for AI integration
- Supabase PostgreSQL backend

## Tech Stack

- Next.js (App Router)
- TypeScript
- React
- Supabase
- PostgreSQL

## Database Design

### Sessions

Represents a single interview attempt.

### Questions

Global question bank shared across all interview sessions.

### Session Questions

Join table that links a session to a selected subset of questions.

### Answers

Stores a user's answer for a question within a session.

### Feedback

Stores evaluation data for an answer.

## Current Status

Implemented:

- Session creation
- Question bank architecture
- Session question selection
- Interview flow
- History page
- Supabase integration
- Database refactor using a join table model

In Progress:

- Answer persistence improvements
- Feedback generation
- Session review enhancements

Planned:

- AI-generated feedback
- Improved scoring system
- Additional interview roles
- Better UI and user experience

## Running Locally

Install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Start the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Learning Goals

This project is being used to learn:

- Next.js App Router
- TypeScript
- PostgreSQL data modeling
- Supabase
- Full stack application architecture
- AI integration workflows