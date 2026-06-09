-- Rollback script for roles migration (use only if needed)
-- Run this in Supabase SQL Editor if you need to revert the migration

-- Step 1: If you dropped the old role columns, this won't work
-- You'll need to restore from backup

-- Step 2: Remove constraints
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS fk_sessions_role;
ALTER TABLE questions DROP CONSTRAINT IF EXISTS fk_questions_role;

-- Step 3: Drop indexes
DROP INDEX IF EXISTS idx_sessions_role_id;
DROP INDEX IF EXISTS idx_questions_role_id;
DROP INDEX IF EXISTS idx_roles_slug;
DROP INDEX IF EXISTS idx_roles_is_active;

-- Step 4: Drop role_id columns
ALTER TABLE sessions DROP COLUMN IF EXISTS role_id;
ALTER TABLE questions DROP COLUMN IF EXISTS role_id;

-- Step 5: Drop roles table
DROP TABLE IF EXISTS roles;
