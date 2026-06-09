# Migration Guide: String-based Roles → First-class Roles Table

This guide walks you through migrating from string-based role references to a first-class `roles` table with proper foreign key relationships.

## Overview

### Before
- `sessions.role` = `TEXT` (e.g., "Frontend Engineer")
- `questions.role` = `TEXT` (e.g., "Frontend Engineer")
- Role metadata stored in hardcoded TypeScript files

### After
- `roles` table with `id`, `name`, `slug`, `description`, `difficulty`, `is_active`
- `sessions.role_id` = `TEXT` → foreign key to `roles.id`
- `questions.role_id` = `TEXT` → foreign key to `roles.id`
- Role metadata stored in database and managed through admin interface

## Migration Steps

### Step 1: Run Database Migration

Open your Supabase SQL Editor and run the migration script:

```bash
# Copy the contents of migrations/001_create_roles_table.sql
# and paste into Supabase SQL Editor
```

**What this does:**
1. Creates the `roles` table
2. Adds `role_id` columns to `sessions` and `questions`
3. Inserts seed data for existing roles
4. Migrates existing data from `role` (text) to `role_id` (FK)
5. Adds foreign key constraints
6. Makes `role_id` NOT NULL
7. Adds performance indexes

### Step 2: Seed Questions (if needed)

If you need to populate or update questions with the new role_id references:

```bash
# Copy the contents of migrations/003_seed_questions_with_role_id.sql
# and paste into Supabase SQL Editor
```

### Step 3: Verify Migration

Run these queries to verify the migration worked:

```sql
-- Check roles table
SELECT * FROM roles;

-- Check that sessions have role_id
SELECT id, role, role_id, created_at FROM sessions LIMIT 10;

-- Check that questions have role_id
SELECT id, text, role, role_id FROM questions LIMIT 10;

-- Verify foreign key relationships
SELECT 
    s.id, 
    s.role_id, 
    r.name as role_name
FROM sessions s
JOIN roles r ON r.id = s.role_id
LIMIT 10;
```

### Step 4: Test Interview Creation

1. Go to `/interview` page
2. Select a role
3. Start an interview
4. Verify questions load correctly
5. Complete an interview
6. Check the session details page

### Step 5: (Optional) Drop Old Columns

**IMPORTANT:** Only do this after thoroughly testing the migration!

Once you're confident the migration works and all queries use `role_id`:

```sql
-- Drop the old role columns
ALTER TABLE sessions DROP COLUMN role;
ALTER TABLE questions DROP COLUMN role;
```

**Before dropping, update the code to remove backward compatibility:**
- Remove `role: role.name` from `startInterview()`
- Remove fallback logic like `s.roles?.name || s.role`
- Update TypeScript types to remove `role` field from `Session` type

## Rollback

If something goes wrong, run the rollback script:

```bash
# Copy the contents of migrations/002_rollback_roles_migration.sql
# and paste into Supabase SQL Editor
```

**Note:** This only works if you haven't dropped the old `role` columns yet!

## Code Changes Summary

### Updated Files

1. **`app/types/index.ts`**
   - Added `RoleDifficulty` type
   - Expanded `Role` type with full metadata
   - Added `role_id` to `Session` type (deprecated `role` field)

2. **`app/lib/actions/interviews.ts`**
   - `startInterview()` now takes `roleId` instead of `role` string
   - Fetches role from database
   - Uses `role_id` for filtering questions
   - Joins `roles` table in `completeInterview()`

3. **`app/interview/page.tsx`**
   - Fetches roles from database instead of hardcoded data
   - Filters only active roles
   - Shows role descriptions

4. **`app/components/RoleSelector.tsx`**
   - Updated to use `role.id` instead of `role.name`
   - Shows role descriptions
   - Calls `startInterview(roleId)`

5. **`app/history/page.tsx`**
   - Joins `roles` table to get role names
   - Fallback to deprecated `role` field during migration

6. **`app/interview/[sessionId]/page.tsx`**
   - Joins `roles` table
   - Fallback to deprecated `role` field

7. **`app/session/[sessionId]/page.tsx`**
   - Joins `roles` table
   - Fallback to deprecated `role` field

## New Database Schema

### roles table

```sql
CREATE TABLE roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('entry', 'mid', 'senior', 'staff')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Updated tables

```sql
-- sessions table
ALTER TABLE sessions ADD COLUMN role_id TEXT NOT NULL REFERENCES roles(id);
CREATE INDEX idx_sessions_role_id ON sessions(role_id);

-- questions table
ALTER TABLE questions ADD COLUMN role_id TEXT NOT NULL REFERENCES roles(id);
CREATE INDEX idx_questions_role_id ON questions(role_id);
```

## Benefits of This Migration

1. **Data Integrity**: Foreign key constraints prevent invalid role references
2. **Rich Metadata**: Store descriptions, difficulty levels, and other role attributes
3. **Flexible Management**: Enable/disable roles without changing code
4. **Better Performance**: Indexed role_id lookups are faster than text matching
5. **Easier Extensions**: Add new fields to roles without code changes
6. **Admin Interface Ready**: Roles can be managed through a future admin panel

## Backward Compatibility

The migration maintains backward compatibility during the transition:

- Old `role` (TEXT) columns are kept temporarily
- Code uses fallback: `s.roles?.name || s.role`
- New sessions store both `role_id` and `role` fields

This allows you to:
- Roll back if needed
- Gradually update related features
- Test thoroughly before removing old columns

## Troubleshooting

### Interview creation fails with "Role not found"

**Cause:** The roles table doesn't have the seed data.

**Solution:** Run the migration script again, specifically step 3 (insert roles).

### Questions not showing for a role

**Cause:** Questions in the database still have NULL `role_id`.

**Solution:** Run the migration script step 4 (update questions with role_id) or the seed script.

### Foreign key constraint violation

**Cause:** Existing sessions or questions reference a role_id that doesn't exist in the roles table.

**Solution:** 
```sql
-- Find orphaned sessions
SELECT * FROM sessions WHERE role_id NOT IN (SELECT id FROM roles);

-- Find orphaned questions
SELECT * FROM questions WHERE role_id NOT IN (SELECT id FROM roles);

-- Either delete them or insert the missing role
```

### Can't drop old role column

**Cause:** There might be views, triggers, or other database objects depending on it.

**Solution:** 
```sql
-- Find dependencies
SELECT * FROM information_schema.view_column_usage WHERE column_name = 'role';

-- Drop dependencies first, then drop the column
```

## Next Steps

After completing this migration, consider:

1. **Admin Interface**: Build UI to manage roles (add, edit, disable)
2. **Role Permissions**: Add user role assignments for access control
3. **Analytics**: Track which roles are most popular
4. **Advanced Filtering**: Allow filtering questions by difficulty, topic, etc.
5. **Role Categories**: Group roles into categories (Engineering, Data, Product, etc.)
