# Supabase Queries to Run - Quick Reference

Run these SQL scripts in your Supabase SQL Editor in order.

## 🚀 Step 1: Create Roles Table & Migrate Data

**File:** `migrations/001_create_roles_table.sql`

This script does everything you need:
- ✅ Creates the `roles` table
- ✅ Adds `role_id` columns to `sessions` and `questions`
- ✅ Inserts seed data (Frontend Engineer, Backend Engineer, Data Analyst)
- ✅ Migrates existing data from `role` (text) to `role_id` (FK)
- ✅ Adds foreign key constraints
- ✅ Creates performance indexes

**Copy the entire file contents and paste into Supabase SQL Editor, then click "Run".**

---

## 🔍 Step 2: Verify Migration

Run these queries to check everything worked:

```sql
-- Should show 3 roles
SELECT * FROM roles;

-- Should show role_id populated
SELECT id, role, role_id, created_at FROM sessions LIMIT 10;

-- Should show role_id populated
SELECT id, text, role, role_id FROM questions LIMIT 10;

-- Verify foreign key joins work
SELECT 
    s.id, 
    s.role_id, 
    r.name as role_name
FROM sessions s
JOIN roles r ON r.id = s.role_id
LIMIT 10;
```

---

## 📝 Step 3: Seed Questions (Optional)

**File:** `migrations/003_seed_questions_with_role_id.sql`

If you need to populate or update your questions with the correct role_id:

**Copy the entire file contents and paste into Supabase SQL Editor, then click "Run".**

This script:
- Inserts or updates 20+ questions
- Assigns them to the correct roles
- Uses UPSERT so it's safe to run multiple times

---

## ✅ Step 4: Test Your Application

1. Start your Next.js app: `npm run dev`
2. Navigate to `/interview`
3. You should see roles loaded from the database
4. Select a role and start an interview
5. Complete the interview and check the feedback

---

## 🔄 Step 5: Drop Old Columns (DO THIS LAST!)

**⚠️ IMPORTANT: Only run this after thoroughly testing everything works!**

Once you're confident the migration is successful and all features work:

```sql
-- Drop the deprecated role columns
ALTER TABLE sessions DROP COLUMN role;
ALTER TABLE questions DROP COLUMN role;
```

**Before dropping:**
- Test interview creation
- Test interview completion
- Test viewing history
- Test viewing session details
- Verify all role names display correctly

---

## 🚨 Rollback (If Something Goes Wrong)

**File:** `migrations/002_rollback_roles_migration.sql`

If you need to revert the migration:

**Copy the entire file contents and paste into Supabase SQL Editor, then click "Run".**

**Note:** This only works if you haven't dropped the old `role` columns yet!

---

## 🎯 Quick Verification Checklist

After running the migration, verify:

- [ ] `roles` table exists with 3 rows
- [ ] `sessions.role_id` column exists and is populated
- [ ] `questions.role_id` column exists and is populated
- [ ] Foreign key constraints are in place
- [ ] Indexes are created
- [ ] Interview creation works
- [ ] Questions load correctly
- [ ] Session history shows correct role names
- [ ] Session detail pages display correctly

---

## 📊 Useful Queries for Monitoring

### Check role usage
```sql
SELECT 
    r.name,
    COUNT(s.id) as session_count
FROM roles r
LEFT JOIN sessions s ON s.role_id = r.id
GROUP BY r.id, r.name
ORDER BY session_count DESC;
```

### Find orphaned records (should return 0)
```sql
-- Orphaned sessions
SELECT * FROM sessions WHERE role_id NOT IN (SELECT id FROM roles);

-- Orphaned questions
SELECT * FROM questions WHERE role_id NOT IN (SELECT id FROM roles);
```

### Check active vs inactive roles
```sql
SELECT 
    is_active,
    COUNT(*) as count
FROM roles
GROUP BY is_active;
```

---

## 🆘 Troubleshooting

### Error: "Role not found or inactive"
- Make sure you ran the migration script completely
- Check: `SELECT * FROM roles WHERE is_active = true;`

### Error: "Failed to fetch questions"
- Questions might not have `role_id` set
- Run the seed questions script

### Error: Foreign key constraint violation
- Check for orphaned records using queries above
- Either delete orphaned records or insert missing roles

---

## 📞 Support

If you encounter issues:
1. Check the `MIGRATION_GUIDE.md` for detailed troubleshooting
2. Verify all migration scripts ran successfully
3. Check browser console and server logs for specific error messages
