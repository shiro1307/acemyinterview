# 🎯 Run These SQL Queries in Supabase

Copy and paste these queries into your **Supabase SQL Editor** in order.

---

## Query 1: Create Roles Table & Migrate Data ✅

**Copy the entire contents of:** `migrations/001_create_roles_table.sql`

Or copy this directly:

```sql
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
```

**Click "Run"** ✅

---

## Query 2: Verify Migration Worked ✅

```sql
-- Should show 3 roles
SELECT * FROM roles;

-- Should show role_id populated for sessions
SELECT id, role, role_id, created_at FROM sessions LIMIT 10;

-- Should show role_id populated for questions
SELECT id, text, role, role_id FROM questions LIMIT 10;

-- Verify foreign key relationships work
SELECT 
    s.id, 
    s.role_id, 
    r.name as role_name,
    r.is_active
FROM sessions s
JOIN roles r ON r.id = s.role_id
LIMIT 10;

-- Count questions per role
SELECT 
    r.name,
    COUNT(q.id) as question_count
FROM roles r
LEFT JOIN questions q ON q.role_id = r.id
GROUP BY r.id, r.name
ORDER BY question_count DESC;
```

**Expected results:**
- 3 roles returned
- All sessions have valid role_id
- All questions have valid role_id
- Join query works without errors
- Each role has questions assigned

---

## Query 3: Seed Questions (Optional) ✅

**Copy the entire contents of:** `migrations/003_seed_questions_with_role_id.sql`

Or copy this directly:

```sql
-- Seed script: Update or insert questions with proper role_id references

-- Frontend Engineer questions
INSERT INTO questions (id, text, role, role_id, created_at) VALUES
    ('q1', 'Explain React reconciliation', 'Frontend Engineer', 'role-frontend', NOW()),
    ('q2', 'What is event bubbling?', 'Frontend Engineer', 'role-frontend', NOW()),
    ('q3', 'How does virtual DOM work in React?', 'Frontend Engineer', 'role-frontend', NOW()),
    ('q4', 'Explain CSS flexbox and its key properties', 'Frontend Engineer', 'role-frontend', NOW()),
    ('q5', 'What are React hooks and why are they useful?', 'Frontend Engineer', 'role-frontend', NOW()),
    ('q6', 'How do you optimize React component rendering?', 'Frontend Engineer', 'role-frontend', NOW()),
    ('q7', 'Explain the difference between state and props in React', 'Frontend Engineer', 'role-frontend', NOW()),
    ('q8', 'What is the purpose of useEffect hook?', 'Frontend Engineer', 'role-frontend', NOW())
ON CONFLICT (id) DO UPDATE SET 
    role_id = EXCLUDED.role_id,
    role = EXCLUDED.role,
    text = EXCLUDED.text;

-- Backend Engineer questions
INSERT INTO questions (id, text, role, role_id, created_at) VALUES
    ('q9', 'Explain REST API principles', 'Backend Engineer', 'role-backend', NOW()),
    ('q10', 'What is database normalization and why is it important?', 'Backend Engineer', 'role-backend', NOW()),
    ('q11', 'How would you design a scalable API?', 'Backend Engineer', 'role-backend', NOW()),
    ('q12', 'Explain the difference between SQL and NoSQL databases', 'Backend Engineer', 'role-backend', NOW()),
    ('q13', 'What are microservices and their advantages?', 'Backend Engineer', 'role-backend', NOW()),
    ('q14', 'How do you handle authentication and authorization?', 'Backend Engineer', 'role-backend', NOW()),
    ('q15', 'Explain caching strategies in a web application', 'Backend Engineer', 'role-backend', NOW())
ON CONFLICT (id) DO UPDATE SET 
    role_id = EXCLUDED.role_id,
    role = EXCLUDED.role,
    text = EXCLUDED.text;

-- Data Analyst questions
INSERT INTO questions (id, text, role, role_id, created_at) VALUES
    ('q16', 'What is the difference between correlation and causation?', 'Data Analyst', 'role-data', NOW()),
    ('q17', 'How would you approach data cleaning for a large dataset?', 'Data Analyst', 'role-data', NOW()),
    ('q18', 'Explain the concept of statistical significance', 'Data Analyst', 'role-data', NOW()),
    ('q19', 'What visualization would you use for time-series data?', 'Data Analyst', 'role-data', NOW()),
    ('q20', 'How do you handle missing values in a dataset?', 'Data Analyst', 'role-data', NOW())
ON CONFLICT (id) DO UPDATE SET 
    role_id = EXCLUDED.role_id,
    role = EXCLUDED.role,
    text = EXCLUDED.text;
```

**Click "Run"** ✅

---

## Query 4: Final Verification ✅

```sql
-- Check we have enough questions per role (need at least 5)
SELECT 
    r.id,
    r.name,
    COUNT(q.id) as question_count
FROM roles r
LEFT JOIN questions q ON q.role_id = r.id
GROUP BY r.id, r.name
HAVING COUNT(q.id) < 5;

-- This should return 0 rows (all roles have 5+ questions)
```

---

## Query 5: Check for Orphaned Data ✅

```sql
-- Find sessions with invalid role_id (should be 0)
SELECT COUNT(*) as orphaned_sessions
FROM sessions 
WHERE role_id NOT IN (SELECT id FROM roles);

-- Find questions with invalid role_id (should be 0)
SELECT COUNT(*) as orphaned_questions
FROM questions 
WHERE role_id NOT IN (SELECT id FROM roles);

-- Both queries should return 0
```

---

## Query 6: Test Role Join ✅

```sql
-- Test that the join works for session display
SELECT 
    s.id,
    s.created_at,
    s.status,
    s.role as old_role_field,
    s.role_id,
    r.name as new_role_name,
    r.description
FROM sessions s
JOIN roles r ON r.id = s.role_id
ORDER BY s.created_at DESC
LIMIT 5;

-- Should show both old and new role fields matching
```

---

## ✅ Done!

After running these queries:

1. ✅ Roles table created with 3 roles
2. ✅ Sessions migrated to use role_id
3. ✅ Questions migrated to use role_id
4. ✅ Foreign keys enforcing data integrity
5. ✅ Indexes created for performance
6. ✅ Questions seeded with proper role references

---

## 🧪 Now Test Your App

```bash
npm run dev
```

Visit:
- http://localhost:3000/interview (should show 3 roles)
- Pick a role and start an interview
- Complete it and check the review page
- Check your history

**Everything should work!** 🎉

---

## 📋 Optional: Drop Old Columns (Later)

**Only run this after 1-2 weeks of successful testing!**

```sql
-- Remove backward compatibility fields
ALTER TABLE sessions DROP COLUMN role;
ALTER TABLE questions DROP COLUMN role;
```

---

## 🚨 Emergency Rollback

If something breaks, run:

```sql
-- Copy the entire contents of: migrations/002_rollback_roles_migration.sql
```

This will revert everything (only works if you haven't dropped old columns!)

---

## 🎯 Summary

You need to run:
1. **Query 1** - Main migration (REQUIRED)
2. **Query 2** - Verify it worked (REQUIRED)
3. **Query 3** - Seed questions (OPTIONAL, but recommended)
4. **Query 4** - Check you have enough questions (REQUIRED)
5. **Query 5** - Check for data issues (REQUIRED)
6. **Query 6** - Test joins work (OPTIONAL)

Then test your app!
