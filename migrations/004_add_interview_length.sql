-- Migration: Add interview_length column to sessions table
-- This allows storing which interview mode was selected (quick/standard/deep_dive)

-- Add interview_length column (nullable initially for existing sessions)
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS interview_length TEXT 
CHECK (interview_length IN ('quick', 'standard', 'deep_dive'));

-- Add index for potential filtering/analytics
CREATE INDEX IF NOT EXISTS idx_sessions_interview_length ON sessions(interview_length);

-- Optional: Set a default for existing NULL values (uncomment if needed)
-- UPDATE sessions SET interview_length = 'quick' WHERE interview_length IS NULL;
