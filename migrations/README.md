# Database Migrations

This folder contains SQL migration scripts for the AceMyInterview database.

## Migration Files

### 001_create_roles_table.sql
**Purpose:** Create the roles table and migrate from string-based role references to role_id foreign keys.

**What it does:**
- Creates `roles` table with id, name, slug, description, difficulty, is_active
- Adds `role_id` columns to `sessions` and `questions` tables
- Seeds initial role data (Frontend Engineer, Backend Engineer, Data Analyst)
- Migrates existing data from `role` (text) to `role_id` (FK)
- Adds foreign key constraints
- Creates performance indexes

**When to run:** First time, or when setting up a new database.

---

### 002_rollback_roles_migration.sql
**Purpose:** Rollback script to revert the roles table migration.

**What it does:**
- Removes foreign key constraints
- Drops indexes
- Removes role_id columns
- Drops roles table

**When to run:** Only if you need to revert the migration (before dropping old columns).

---

### 003_seed_questions_with_role_id.sql
**Purpose:** Insert or update questions with proper role_id references.

**What it does:**
- Upserts 20+ interview questions
- Assigns correct role_id to each question
- Safe to run multiple times (uses ON CONFLICT)

**When to run:** After running 001, or when you need to update question data.

---

## How to Use

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy the contents of the migration file you want to run
4. Paste into the SQL Editor
5. Click "Run"

## Migration Order

Always run migrations in this order:

1. ✅ `001_create_roles_table.sql` - Creates tables and migrates data
2. ✅ `003_seed_questions_with_role_id.sql` - Seeds questions (optional)
3. ⚠️ Drop old columns (see step 8 in 001 script) - Only after thorough testing!

If you need to rollback:
- ❌ `002_rollback_roles_migration.sql` - Only before dropping old columns

## Safety Notes

- Always backup your database before running migrations
- Test in a development environment first
- Verify data after each migration
- Keep the old `role` columns until you've thoroughly tested
- The migration maintains backward compatibility during transition

## Quick Links

- [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) - Detailed migration guide
- [SUPABASE_QUERIES_TO_RUN.md](../SUPABASE_QUERIES_TO_RUN.md) - Quick reference
- [SUPABASE_DB_SCHEMA.md](../SUPABASE_DB_SCHEMA.md) - Updated schema documentation
