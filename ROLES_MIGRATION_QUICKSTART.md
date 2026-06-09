# 🚀 Roles Migration - Quick Start

This is your **TL;DR** guide. For details, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md).

## What Changed?

Roles are now stored in the database instead of hardcoded TypeScript files.

**Before:** `sessions.role = "Frontend Engineer"` (just text)  
**After:** `sessions.role_id = "role-frontend"` (foreign key to roles table)

## 3 Steps to Migrate

### 1️⃣ Run the Migration SQL

Open **Supabase SQL Editor** and copy/paste the entire contents of:
```
migrations/001_create_roles_table.sql
```

Click **"Run"** → Done! ✅

### 2️⃣ Seed Questions (Optional)

If you want to add/update questions, copy/paste:
```
migrations/003_seed_questions_with_role_id.sql
```

Click **"Run"** → Done! ✅

### 3️⃣ Test Your App

```bash
npm run dev
```

- Go to `/interview`
- Pick a role
- Start interview
- Complete it
- Check history

**Everything should work!** 🎉

## What You Get

✅ **Roles table** with metadata (name, description, difficulty, active status)  
✅ **Foreign key constraints** - no more invalid role references  
✅ **Backward compatible** - old data still works during migration  
✅ **Better performance** - indexed queries  
✅ **Future-ready** - add role features without code changes  

## Code Changes

The code has been updated to:
- Fetch roles from database instead of hardcoded arrays
- Use `role_id` for creating sessions and filtering questions
- Join `roles` table when displaying role names
- Maintain backward compatibility with old `role` field

**No action needed on your part** - just run the SQL and test!

## When to Drop Old Columns

After testing everything thoroughly (1-2 weeks), you can run:

```sql
ALTER TABLE sessions DROP COLUMN role;
ALTER TABLE questions DROP COLUMN role;
```

But **only after**:
- ✅ All features tested
- ✅ No errors in production
- ✅ Users reporting no issues
- ✅ You've updated code to remove fallback logic

## Need Help?

- **Detailed guide:** [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **SQL reference:** [SUPABASE_QUERIES_TO_RUN.md](./SUPABASE_QUERIES_TO_RUN.md)
- **Schema docs:** [SUPABASE_DB_SCHEMA.md](./SUPABASE_DB_SCHEMA.md)

## Rollback

If something breaks, immediately run:
```
migrations/002_rollback_roles_migration.sql
```

(Only works if you haven't dropped the old columns yet!)

---

**Questions?** Check the troubleshooting section in the full migration guide.
