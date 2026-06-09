-- Seed script: Update or insert questions with proper role_id references
-- Run this in Supabase SQL Editor AFTER running 001_create_roles_table.sql

-- This script uses UPSERT (ON CONFLICT DO UPDATE) to handle both new and existing questions
-- If a question with the same id exists, it updates the role_id
-- Otherwise, it inserts a new question

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
