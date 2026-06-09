# ✅ Roles Migration Checklist

Use this checklist to track your migration progress.

---

## Pre-Migration

- [ ] Read `ROLES_MIGRATION_SUMMARY.md`
- [ ] Backup your Supabase database (Settings → Backups)
- [ ] Commit current code to git
- [ ] Review migration files in `migrations/` folder

---

## Database Migration

### Run SQL Scripts

- [ ] Open Supabase SQL Editor
- [ ] Copy/paste `migrations/001_create_roles_table.sql`
- [ ] Click "Run" - should complete without errors
- [ ] Copy/paste `migrations/003_seed_questions_with_role_id.sql`
- [ ] Click "Run" - should complete without errors

### Verify Database

- [ ] Run: `SELECT COUNT(*) FROM roles WHERE is_active = true;` → Should return **3**
- [ ] Run: `SELECT COUNT(*) FROM sessions WHERE role_id IS NULL;` → Should return **0**
- [ ] Run: `SELECT COUNT(*) FROM questions WHERE role_id IS NULL;` → Should return **0**
- [ ] Run: `SELECT * FROM roles;` → Should show Frontend, Backend, Data Analyst
- [ ] Run query to check questions per role → Each should have 5+ questions

---

## Application Testing

### Local Testing

- [ ] Start dev server: `npm run dev`
- [ ] No TypeScript compilation errors
- [ ] No console errors on startup

### Interview Flow

- [ ] Visit `/interview` page
- [ ] See 3 roles listed (Frontend Engineer, Backend Engineer, Data Analyst)
- [ ] Role descriptions visible (if any)
- [ ] Click "Frontend Engineer"
- [ ] Redirects to `/interview/[sessionId]`
- [ ] See "Frontend Engineer Interview" header
- [ ] 5 questions displayed
- [ ] All questions relevant to Frontend Engineering
- [ ] Answer all 5 questions
- [ ] Click "Complete Interview"
- [ ] Redirects to `/session/[sessionId]`
- [ ] See feedback page with score
- [ ] See "Frontend Engineer — Interview Review" header

### History & Details

- [ ] Visit `/history` page
- [ ] See completed session listed
- [ ] Role name shows as "Frontend Engineer"
- [ ] Score displays correctly
- [ ] Click on the session
- [ ] Redirects to session detail page
- [ ] All information displays correctly
- [ ] Role name correct throughout

### Edge Cases

- [ ] Start interview with "Backend Engineer"
- [ ] Complete successfully
- [ ] Start interview with "Data Analyst"
- [ ] Complete successfully
- [ ] Visit `/history` - see all 3 sessions
- [ ] Each shows correct role name
- [ ] Try deleting a session - works without errors
- [ ] Refresh pages - no errors, data loads correctly

---

## Database Verification (Post-Test)

- [ ] Run: `SELECT * FROM sessions ORDER BY created_at DESC LIMIT 5;`
  - All have valid `role_id`
  - All have `role` field for backward compatibility
  - Status updated to "completed" for finished interviews

- [ ] Run: `SELECT * FROM feedback ORDER BY created_at DESC LIMIT 5;`
  - Feedback saved for each completed interview
  - Scores look reasonable

- [ ] Run foreign key test:
  ```sql
  SELECT s.id, s.role_id, r.name 
  FROM sessions s 
  JOIN roles r ON r.id = s.role_id 
  LIMIT 5;
  ```
  - No errors, joins work correctly

- [ ] Check for orphaned data:
  ```sql
  SELECT COUNT(*) FROM sessions WHERE role_id NOT IN (SELECT id FROM roles);
  SELECT COUNT(*) FROM questions WHERE role_id NOT IN (SELECT id FROM roles);
  ```
  - Both should return **0**

---

## Code Review

- [ ] `app/lib/actions/interviews.ts` - startInterview uses roleId
- [ ] `app/lib/actions/interviews.ts` - completeInterview joins roles table
- [ ] `app/interview/page.tsx` - fetches roles from database
- [ ] `app/components/RoleSelector.tsx` - uses role.id for startInterview
- [ ] `app/history/page.tsx` - joins roles table
- [ ] `app/interview/[sessionId]/page.tsx` - joins roles table
- [ ] `app/session/[sessionId]/page.tsx` - joins roles table
- [ ] All files have fallback logic: `roles?.name || role`

---

## Performance Check

- [ ] Page load times acceptable (< 2 seconds)
- [ ] No N+1 query issues
- [ ] Check Supabase logs for slow queries
- [ ] Verify indexes are being used:
  ```sql
  EXPLAIN ANALYZE 
  SELECT * FROM sessions WHERE role_id = 'role-frontend';
  ```

---

## Production Deployment

### Code Deployment

- [ ] Commit all code changes
- [ ] Push to git repository
- [ ] Deploy to production (Vercel/other host)
- [ ] Verify deployment successful

### Production Database Migration

- [ ] Backup production database
- [ ] Open production Supabase SQL Editor
- [ ] Run `migrations/001_create_roles_table.sql`
- [ ] Run `migrations/003_seed_questions_with_role_id.sql`
- [ ] Verify with same queries as local
- [ ] Test production app (all flows)

---

## Post-Deployment Monitoring

### Week 1

- [ ] Day 1: Check error logs
- [ ] Day 1: Test all features
- [ ] Day 1: Monitor user reports
- [ ] Day 3: Check database integrity
- [ ] Day 7: Review analytics (if any)

### Week 2-4

- [ ] Week 2: Verify no issues reported
- [ ] Week 3: Check performance metrics
- [ ] Week 4: Review user feedback

---

## Cleanup (After 1-2 Weeks)

**Only proceed if:**
- [ ] No errors in production for 1-2 weeks
- [ ] All features working correctly
- [ ] No user complaints
- [ ] Confident migration is successful

### Optional: Remove Backward Compatibility

- [ ] Remove fallback logic in code:
  - [ ] Remove `|| session.role` fallbacks
  - [ ] Remove `role: role.name` from startInterview
  - [ ] Update types to remove deprecated `role` field

- [ ] Drop old database columns:
  ```sql
  ALTER TABLE sessions DROP COLUMN role;
  ALTER TABLE questions DROP COLUMN role;
  ```

- [ ] Test everything again
- [ ] Deploy changes
- [ ] Monitor for issues

---

## Success Criteria

Migration is successful when:

- ✅ All 3 roles visible on interview page
- ✅ Can start interviews with any role
- ✅ Questions load correctly for each role
- ✅ Interviews complete successfully
- ✅ Feedback displays with correct role names
- ✅ History shows correct role names
- ✅ No database errors
- ✅ No orphaned records
- ✅ Foreign keys enforced
- ✅ No performance degradation

---

## Rollback Plan

If critical issues arise:

1. [ ] Immediately stop using the new code
2. [ ] Open Supabase SQL Editor
3. [ ] Run `migrations/002_rollback_roles_migration.sql`
4. [ ] Revert code changes in git
5. [ ] Redeploy previous version
6. [ ] Investigate issue
7. [ ] Fix and test locally
8. [ ] Try migration again

---

## Documentation

- [ ] Update team documentation (if applicable)
- [ ] Note any custom changes made
- [ ] Document any issues encountered
- [ ] Share migration experience with team

---

## Notes

Use this section to track any custom changes or issues:

```
Date: ___________
Issue: 
Solution:

Date: ___________
Issue:
Solution:
```

---

## Final Sign-Off

- [ ] All items above completed
- [ ] Migration successful
- [ ] Production stable
- [ ] Ready for cleanup (if desired)

**Completed by:** ___________  
**Date:** ___________  
**Notes:** ___________

---

## Quick Reference

- **Main migration SQL:** `migrations/001_create_roles_table.sql`
- **Seed questions SQL:** `migrations/003_seed_questions_with_role_id.sql`
- **Rollback SQL:** `migrations/002_rollback_roles_migration.sql`
- **Quick start guide:** `ROLES_MIGRATION_QUICKSTART.md`
- **Full documentation:** `MIGRATION_GUIDE.md`
- **SQL reference:** `RUN_THESE_SQL_QUERIES.md`
- **Test guide:** `TEST_INTERVIEW_FLOW.md`
