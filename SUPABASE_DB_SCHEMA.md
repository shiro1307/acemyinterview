# AceMyInterview Database Schema

## Overview

The database follows a refactored architecture where **questions are decoupled from sessions**. This enables a reusable global question bank where sessions can select a flexible subset of questions via the `session_questions` join table.

---

## Design Change

### Before

- Questions were session-bound (`questions.session_id` foreign key)
- Questions couldn't be reused across sessions
- Duplication if same question was used in multiple sessions

### After

- Questions are **global** (no session dependency)
- Sessions select a subset via **join table**
- Each session has independent question selection
- Questions are reusable and shareable

### Why?

- **Flexibility**: Select different question subsets per session (random, by role, etc.)
- **Reusability**: One question can be used in many sessions
- **Scalability**: Global question bank grows independently from sessions
- **No duplication**: Question text stored once

---

## Data Flow

```
User selects role
     ↓
Create session
     ↓
Fetch questions from global bank (filtered by role)
     ↓
Select random subset (e.g., 5 questions)
     ↓
Insert into session_questions (with order_index)
     ↓
User answers questions
     ↓
Insert answers + feedback
```

---

## Tables

### sessions

- id (text, PK)
- role (text) — role selected by user
- created_at (timestamp)

### questions (GLOBAL BANK)

- id (text, PK)
- text (text) — question prompt
- role (text, optional) — category/filter by role

### session_questions (JOIN TABLE)

- id (text, PK)
- session_id (text, FK → sessions.id)
- question_id (text, FK → questions.id)
- order_index (int) — question order within session

### answers

- id (text, PK)
- session_id (text, FK → sessions.id)
- question_id (text, FK → questions.id)
- text (text) — user's answer
- created_at (timestamp)

### feedback

- id (text, PK)
- answer_id (text, FK → answers.id)
- score (int4) — 0-10 rating
- strengths (text[]) — what was good
- missing_points (text[]) — what was missing
- model_answer (text) — reference answer
- created_at (timestamp)

---

## Query Patterns

### Fetch questions for a session

```sql
SELECT session_questions.*, questions.*
FROM session_questions
JOIN questions ON questions.id = session_questions.question_id
WHERE session_questions.session_id = ?
ORDER BY session_questions.order_index ASC
```

### Insert selected questions into session

```sql
INSERT INTO session_questions (id, session_id, question_id, order_index)
VALUES
  (uuid1, ?, questionId1, 1),
  (uuid2, ?, questionId2, 2),
  ...
```
