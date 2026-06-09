# AceMyInterview Database Schema

## Overview

The database uses a **global question bank** decoupled from sessions. **Roles are now first-class entities** stored in a dedicated table. Sessions select a subset of questions via the `session_questions` join table. Feedback is stored **once per session** (not per answer).

---

## Data Flow

```
User selects role (from roles table)
     ↓
Create session with role_id (sessions)
     ↓
Pick random questions from global bank filtered by role_id → session_questions
     ↓
User answers → answers
     ↓
completeInterview() → Gemini evaluation → feedback (one row per session)
     ↓
Review page reads feedback.evaluation_json (v2)
```

---

## Tables

### roles (NEW)

First-class role entities with metadata.

| Column | Type | Notes |
|--------|------|-------|
| id | text (PK) | e.g., 'role-frontend' |
| name | text (UNIQUE) | Display name, e.g., "Frontend Engineer" |
| slug | text (UNIQUE) | URL-friendly identifier |
| description | text | Optional role description |
| difficulty | text | CHECK: 'entry', 'mid', 'senior', 'staff' |
| is_active | boolean | Whether role is available for interviews |
| created_at | timestamptz | |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE on `name`
- UNIQUE on `slug`
- INDEX on `is_active`

### sessions

| Column | Type | Notes |
|--------|------|-------|
| id | text (PK) | UUID |
| user_id | uuid (FK) | Owner |
| role_id | text (FK → roles.id) | **NEW**: Role reference |
| role | text | **DEPRECATED**: Keep temporarily for migration |
| status | text | `active`, `completed`, or `abandoned` |
| created_at | timestamptz | |

**Foreign Keys:**
- `role_id` REFERENCES `roles(id)` ON DELETE RESTRICT

**Indexes:**
- INDEX on `role_id`

### questions (global bank)

| Column | Type | Notes |
|--------|------|-------|
| id | text (PK) | UUID |
| text | text | Question prompt |
| role_id | text (FK → roles.id) | **NEW**: Role reference |
| role | text | **DEPRECATED**: Keep temporarily for migration |
| created_at | timestamptz | Optional |

**Foreign Keys:**
- `role_id` REFERENCES `roles(id)` ON DELETE RESTRICT

**Indexes:**
- INDEX on `role_id`

### session_questions (join table)

| Column | Type | Notes |
|--------|------|-------|
| id | text (PK) | UUID |
| session_id | text (FK → sessions.id) | |
| question_id | text (FK → questions.id) | |
| order_index | int | Question order within session |

### answers

| Column | Type | Notes |
|--------|------|-------|
| id | text (PK) | UUID |
| session_id | text (FK → sessions.id) | |
| question_id | text (FK → questions.id) | |
| text | text | User's answer |
| created_at | timestamptz | |

### feedback

One row per completed session. No schema migration is required when the app feedback format changes — rich data lives in `evaluation_json` (jsonb).

| Column | Type | Notes |
|--------|------|-------|
| id | text (PK) | UUID |
| session_id | text (FK → sessions.id) | Unique per session |
| overall_score | int4 | 0–10 |
| summary | text | Short overall assessment |
| evaluation_json | jsonb | Structured v2 payload (see below) |
| created_at | timestamptz | |

---

## evaluation_json v2

The app defines this shape. It is not enforced at the database level.

```json
{
  "version": 2,
  "dimensions": {
    "communication": 7,
    "technicalDepth": 6,
    "problemSolving": 8
  },
  "strengths": ["..."],
  "weaknesses": ["..."],
  "improvements": ["..."],
  "verdict": "pass",
  "verdictRationale": "...",
  "studyTopics": ["..."],
  "completeness": {
    "questionsTotal": 5,
    "questionsAnswered": 4,
    "shortAnswerCount": 1,
    "signal": "partial"
  },
  "questionEvaluations": [
    {
      "questionId": "...",
      "questionText": "...",
      "score": 7,
      "whatWorked": "...",
      "whatMissed": "...",
      "howToImprove": "...",
      "idealAnswer": "...",
      "tags": ["correct_core", "too_shallow"],
      "conceptsMentioned": ["..."],
      "conceptsMissed": ["..."]
    }
  ]
}
```

**Verdict values:** `strong_pass`, `pass`, `borderline`, `needs_work`, `not_ready`

**Tag values:** `good_structure`, `strong_examples`, `correct_core`, `too_shallow`, `missed_edge_case`, `factually_incorrect`, `unclear_explanation`, `incomplete`

**Completeness signals:** `complete`, `partial`, `minimal_effort` (computed in app code, stored for display)

---

## Fresh slate SQL

When upgrading from an older feedback format, wipe stale data in the Supabase SQL Editor:

```sql
-- Feedback only
DELETE FROM feedback;

-- Full interview reset (keeps questions bank)
TRUNCATE TABLE feedback, answers, session_questions, sessions CASCADE;
```

---

## Query Patterns

### Fetch active roles for interview selection

```sql
SELECT id, name, slug, description, difficulty
FROM roles
WHERE is_active = true
ORDER BY name ASC;
```

### Create a session with role_id

```sql
INSERT INTO sessions (id, user_id, role_id, role, status, created_at)
VALUES ('uuid', 'user-uuid', 'role-frontend', 'Frontend Engineer', 'active', NOW())
RETURNING *;
```

### Fetch questions for a role

```sql
SELECT id, text, role_id
FROM questions
WHERE role_id = 'role-frontend'
ORDER BY RANDOM()
LIMIT 5;
```

### Fetch questions for a session

```sql
SELECT session_questions.*, questions.*
FROM session_questions
JOIN questions ON questions.id = session_questions.question_id
WHERE session_questions.session_id = ?
ORDER BY session_questions.order_index ASC;
```

### Fetch session with feedback (history) - using role join

```sql
SELECT 
    sessions.id,
    sessions.role_id,
    sessions.created_at,
    sessions.status,
    roles.name as role_name,
    feedback.overall_score
FROM sessions
LEFT JOIN feedback ON feedback.session_id = sessions.id
JOIN roles ON roles.id = sessions.role_id
WHERE sessions.user_id = ?
ORDER BY sessions.created_at DESC;
```

### Fetch session detail with role

```sql
SELECT 
    sessions.*,
    roles.name as role_name,
    roles.description as role_description
FROM sessions
JOIN roles ON roles.id = sessions.role_id
WHERE sessions.id = ? AND sessions.user_id = ?;
```
