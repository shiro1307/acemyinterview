# Quick Setup: Interview Length Feature

## Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Add interview_length column to sessions table
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS interview_length TEXT 
CHECK (interview_length IN ('quick', 'standard', 'deep_dive'));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_sessions_interview_length ON sessions(interview_length);
```

## That's It!

The feature is now ready to use. No build step or restart needed (Next.js will hot reload).

## How to Use

1. Go to the dashboard/home page
2. Click "Start" on any role
3. Select your interview length:
   - **Quick** (5 questions)
   - **Standard** (10 questions)
   - **Deep Dive** (15 questions)
4. Begin the interview!

## Availability

Interview modes are only available if the role has enough questions:
- Quick: Needs 5+ questions
- Standard: Needs 10+ questions
- Deep Dive: Needs 15+ questions

Unavailable modes will be grayed out and not clickable.

## Files Changed

- ✅ `app/components/InterviewLengthModal.tsx` (new)
- ✅ `app/components/RoleSelector.tsx` (updated)
- ✅ `app/lib/actions/interviews.ts` (updated)
- ✅ `app/globals.css` (modal styles added)
- ✅ `migrations/004_add_interview_length.sql` (new)
