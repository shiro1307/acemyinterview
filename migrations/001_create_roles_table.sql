-- Migration: Create roles table and migrate to role_id foreign keys
-- Run this in Supabase SQL Editor

-- Step 1: Create the roles table
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('entry', 'mid', 'senior', 'staff')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Add role_id columns to sessions and questions (nullable for now)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS role_id TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS role_id TEXT;

-- Step 3: Insert seed data for roles
INSERT INTO roles (id, name, slug, description, difficulty, is_active) VALUES
    ('role-frontend', 'Frontend Engineer', 'frontend-engineer', 'Focus on UI/UX, React, TypeScript, CSS, and modern frontend frameworks', 'mid', true),
    ('role-backend', 'Backend Engineer', 'backend-engineer', 'Focus on API design, databases, scalability, and server-side architecture', 'mid', true),
    ('role-data', 'Data Analyst', 'data-analyst', 'Focus on data analysis, statistical methods, visualization, and insights', 'mid', true)
ON CONFLICT (id) DO NOTHING;

-- Step 4: Migrate existing data from role (text) to role_id (FK)
-- Map string role names to role IDs for sessions
UPDATE sessions 
SET role_id = CASE 
    WHEN role = 'Frontend Engineer' THEN 'role-frontend'
    WHEN role = 'Backend Engineer' THEN 'role-backend'
    WHEN role = 'Data Analyst' THEN 'role-data'
    ELSE NULL
END
WHERE role_id IS NULL;

-- Map string role names to role IDs for questions
UPDATE questions 
SET role_id = CASE 
    WHEN role = 'Frontend Engineer' THEN 'role-frontend'
    WHEN role = 'Backend Engineer' THEN 'role-backend'
    WHEN role = 'Data Analyst' THEN 'role-data'
    ELSE NULL
END
WHERE role_id IS NULL;

-- Step 5: Add foreign key constraints
ALTER TABLE sessions 
    ADD CONSTRAINT fk_sessions_role 
    FOREIGN KEY (role_id) 
    REFERENCES roles(id) 
    ON DELETE RESTRICT;

ALTER TABLE questions 
    ADD CONSTRAINT fk_questions_role 
    FOREIGN KEY (role_id) 
    REFERENCES roles(id) 
    ON DELETE RESTRICT;

-- Step 6: Make role_id NOT NULL (after data migration)
ALTER TABLE sessions ALTER COLUMN role_id SET NOT NULL;
ALTER TABLE questions ALTER COLUMN role_id SET NOT NULL;

-- Step 7: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_role_id ON sessions(role_id);
CREATE INDEX IF NOT EXISTS idx_questions_role_id ON questions(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_slug ON roles(slug);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON roles(is_active);

-- Step 8: (OPTIONAL) Drop old role columns after verifying the migration works
-- IMPORTANT: Only run these after testing your app thoroughly!
-- Uncomment these lines when you're ready:
-- ALTER TABLE sessions DROP COLUMN role;
-- ALTER TABLE questions DROP COLUMN role;
