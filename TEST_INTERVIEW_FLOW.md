# Interview Flow Test - Post Migration

This document walks through the complete interview flow to ensure the migration maintains all functionality.

## Test Flow

### 1. User Visits /interview

**What happens:**
```typescript
// app/interview/page.tsx
const { data: roles } = await supabase
  .from("roles")
  .select("id, name, slug, description, difficulty")
  .eq("is_active", true)
  .order("name", { ascending: true });
```

**Expected result:**
- Shows list of active roles from database
- Each role has name and description (if set)
- Frontend Engineer, Backend Engineer, Data Analyst visible

**What to verify:**
- [ ] Page loads without errors
- [ ] All 3 roles are visible
- [ ] Role descriptions show up (if any)

---

### 2. User Clicks a Role

**What happens:**
```typescript
// app/components/RoleSelector.tsx
const handleStartInterview = async (roleId: string) => {
  await startInterview(roleId); // Calls with 'role-frontend' etc.
}
```

**Expected result:**
- Button shows "Starting..."
- Redirects to `/interview/[sessionId]`

**What to verify:**
- [ ] Button changes to loading state
- [ ] No errors in console
- [ ] Redirects to interview session page

---

### 3. startInterview() Creates Session

**What happens:**
```typescript
// app/lib/actions/interviews.ts
export async function startInterview(roleId: string) {
  // 1. Fetch role from database
  const { data: role } = await supabase
    .from("roles")
    .select("id, name")
    .eq("id", roleId)
    .eq("is_active", true)
    .single();
  
  // 2. Create session with both role_id (new) and role (backward compat)
  const { data: session } = await supabase
    .from("sessions")
    .insert({ 
      id: crypto.randomUUID(), 
      role_id: role.id,        // FK to roles table
      role: role.name,         // Deprecated, for backward compatibility
      user_id: user.id, 
      created_at: new Date().toISOString() 
    })
    .select()
    .single();
  
  // 3. Pick 5 random questions for this role
  const { data: allQuestions } = await supabase
    .from("questions")
    .select("id")
    .eq("role_id", role.id)   // Filter by role_id FK
    .limit(100);
  
  const picked = allQuestions.sort(() => Math.random() - 0.5).slice(0, 5);
  
  // 4. Link questions to session
  await supabase.from("session_questions").insert(
    picked.map((q, i) => ({
      id: crypto.randomUUID(),
      session_id: session.id,
      question_id: q.id,
      order_index: i + 1,
    }))
  );
  
  redirect(`/interview/${session.id}`);
}
```

**What to verify in database:**
```sql
-- Check session was created with both fields
SELECT id, role_id, role, user_id FROM sessions WHERE id = '[session-id]';
-- Should show: role_id = 'role-frontend', role = 'Frontend Engineer'

-- Check session_questions were created
SELECT * FROM session_questions WHERE session_id = '[session-id]';
-- Should show: 5 rows with order_index 1-5

-- Verify questions belong to correct role
SELECT q.id, q.text, q.role_id 
FROM questions q
JOIN session_questions sq ON sq.question_id = q.id
WHERE sq.session_id = '[session-id]';
-- All questions should have role_id = 'role-frontend'
```

**What to verify:**
- [ ] Session created in database
- [ ] Session has valid role_id
- [ ] Session has role name (backward compat)
- [ ] 5 questions linked to session
- [ ] All questions belong to selected role
- [ ] Questions in correct order (order_index)

---

### 4. Interview Session Page Loads

**What happens:**
```typescript
// app/interview/[sessionId]/page.tsx
const { data: session } = await supabase
  .from("sessions")
  .select("*, roles(name)")  // Join roles table
  .eq("id", sessionId)
  .eq("user_id", user.id)
  .single();

// Get role name with fallback
const roleName = (session.roles as any)?.name || session.role;
```

**Expected result:**
- Shows role name in header: "Frontend Engineer Interview"
- Shows 5 questions
- Each question has answer textarea

**What to verify:**
- [ ] Page loads without errors
- [ ] Correct role name in header
- [ ] 5 questions displayed
- [ ] Questions are for the selected role
- [ ] Can type in answer boxes

---

### 5. User Submits Answers

**What happens:**
```typescript
// app/lib/actions/interviews.ts
export async function submitAnswer(sessionId, questionId, answerText) {
  await supabase.from("answers").insert({
    id: crypto.randomUUID(),
    session_id: sessionId,
    question_id: questionId,
    text: answerText,
  });
}
```

**What to verify:**
- [ ] Answers save without errors
- [ ] Can submit multiple answers
- [ ] Answers persist in database

---

### 6. User Completes Interview

**What happens:**
```typescript
// app/lib/actions/interviews.ts
export async function completeInterview(sessionId: string) {
  // Fetch session with role join
  const { data: sessionResult } = await supabase
    .from("sessions")
    .select("role, role_id, roles(name)")
    .eq("id", sessionId)
    .single();
  
  // Get role name - prefer from join, fallback to deprecated field
  const roleName = (sessionResult.roles as any)?.name || sessionResult.role;
  
  // Evaluate with Gemini
  const { overallScore, summary, evaluationJson } = await evaluateInterview(
    roleName,  // Uses role name for AI prompt
    pairs,
    completeness
  );
  
  // Save feedback
  await supabase.from("feedback").insert({
    session_id: sessionId,
    overall_score: overallScore,
    summary,
    evaluation_json: evaluationJson,
  });
  
  // Update session status
  await supabase
    .from("sessions")
    .update({ status: "completed" })
    .eq("id", sessionId);
  
  redirect(`/session/${sessionId}`);
}
```

**What to verify:**
- [ ] Interview completes without errors
- [ ] Feedback saved to database
- [ ] Session status updated to "completed"
- [ ] Redirects to session review page

---

### 7. Session Review Page

**What happens:**
```typescript
// app/session/[sessionId]/page.tsx
const { data: session } = await supabase
  .from("sessions")
  .select("*, roles(name)")  // Join roles table
  .eq("id", sessionId)
  .single();

const roleName = (session.roles as any)?.name || session.role;
```

**Expected result:**
- Shows "Frontend Engineer — Interview Review"
- Shows overall score
- Shows feedback breakdown
- Shows question-by-question analysis

**What to verify:**
- [ ] Page loads without errors
- [ ] Correct role name in header
- [ ] Score displayed
- [ ] Feedback sections visible
- [ ] All questions and answers shown

---

### 8. History Page

**What happens:**
```typescript
// app/history/page.tsx
const { data: sessions } = await supabase
  .from("sessions")
  .select("id, role, role_id, created_at, status, feedback(overall_score), roles(name)")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });

const sessionData = sessions.map((s) => ({
  role: s.roles?.name || s.role,  // Prefer new join, fallback to old field
  // ... other fields
}));
```

**Expected result:**
- Lists all completed sessions
- Shows role names correctly
- Shows scores
- Shows progress deltas

**What to verify:**
- [ ] Page loads without errors
- [ ] All sessions listed
- [ ] Correct role names displayed
- [ ] Scores visible
- [ ] Can click sessions to view details
- [ ] Can delete sessions

---

## Critical Success Criteria

All of these MUST work for migration to be successful:

### ✅ Data Integrity
- [ ] No foreign key constraint violations
- [ ] All sessions have valid role_id
- [ ] All questions have valid role_id
- [ ] No orphaned records

### ✅ Functionality
- [ ] Can view available roles
- [ ] Can start interview
- [ ] Questions load correctly
- [ ] Can submit answers
- [ ] Can complete interview
- [ ] Can view feedback
- [ ] Can view history
- [ ] Can delete sessions

### ✅ Display
- [ ] Role names show correctly everywhere
- [ ] No "undefined" or "null" displayed
- [ ] Role descriptions visible (if set)

### ✅ Performance
- [ ] Pages load quickly
- [ ] No N+1 query issues
- [ ] Indexes working correctly

---

## Database State After Complete Flow

After one successful interview, your database should look like:

```sql
-- 1 role used
SELECT * FROM roles WHERE id = 'role-frontend';

-- 1 active session created
SELECT * FROM sessions WHERE status = 'completed' AND role_id = 'role-frontend';

-- 5 questions linked
SELECT COUNT(*) FROM session_questions WHERE session_id = '[session-id]';
-- Returns: 5

-- 5 answers saved
SELECT COUNT(*) FROM answers WHERE session_id = '[session-id]';
-- Returns: 5

-- 1 feedback saved
SELECT * FROM feedback WHERE session_id = '[session-id]';
```

---

## Troubleshooting Common Issues

### Issue: "Role not found or inactive"
**Cause:** Migration didn't seed roles  
**Fix:** Run `migrations/001_create_roles_table.sql` again

### Issue: "Failed to fetch questions"
**Cause:** Questions don't have role_id set  
**Fix:** Run `migrations/003_seed_questions_with_role_id.sql`

### Issue: Role name shows as "null" or "undefined"
**Cause:** Join or fallback logic issue  
**Check:** 
```sql
SELECT s.*, r.name FROM sessions s 
LEFT JOIN roles r ON r.id = s.role_id 
WHERE s.id = '[session-id]';
```
If r.name is null, role_id is invalid

### Issue: No questions load for a role
**Cause:** Questions don't have correct role_id  
**Check:**
```sql
SELECT COUNT(*) FROM questions WHERE role_id = 'role-frontend';
```
Should return > 5 questions

---

## Manual Test Checklist

Complete this checklist before considering migration successful:

- [ ] **Setup**
  - [ ] Ran migrations/001_create_roles_table.sql
  - [ ] Ran migrations/003_seed_questions_with_role_id.sql
  - [ ] Verified 3 roles exist
  - [ ] Verified questions have role_id

- [ ] **Interview Flow**
  - [ ] Visited /interview page
  - [ ] Saw all 3 roles listed
  - [ ] Clicked Frontend Engineer
  - [ ] Started interview successfully
  - [ ] Saw 5 questions
  - [ ] All questions relevant to role
  - [ ] Answered all 5 questions
  - [ ] Completed interview
  - [ ] Saw feedback page
  - [ ] Score displayed correctly

- [ ] **Navigation**
  - [ ] Visited /history
  - [ ] Saw completed session
  - [ ] Role name correct
  - [ ] Score displayed
  - [ ] Clicked session
  - [ ] Review page loaded
  - [ ] All details correct

- [ ] **Edge Cases**
  - [ ] Started second interview (different role)
  - [ ] Started third interview (same role)
  - [ ] Deleted a session
  - [ ] Refreshed pages (no errors)

- [ ] **Database Verification**
  - [ ] Checked sessions have role_id
  - [ ] Checked questions have role_id
  - [ ] No orphaned records
  - [ ] Foreign keys working

---

**If all items are checked, migration is successful!** ✅
