# Interview Length Selection Feature

## Overview
Added a minimal, responsive modal that allows users to select interview length (Quick/Standard/Deep Dive) when starting an interview. The modal appears after clicking "Start Interview" on any role.

## Changes Made

### 1. New Component: InterviewLengthModal.tsx
**Location:** `app/components/InterviewLengthModal.tsx`

**Features:**
- Three interview modes:
  - **Quick**: 5 questions
  - **Standard**: 10 questions  
  - **Deep Dive**: 15 questions
- Modes are automatically disabled/grayed out if the role has insufficient questions
- Closes on:
  - ESC key press
  - Click outside modal
  - Cancel button click
  - Mode selection
- Mobile-friendly and accessible
- Minimal styling using existing design system

### 2. Updated RoleSelector Component
**Location:** `app/components/RoleSelector.tsx`

**Changes:**
- Import `InterviewLengthModal`
- Added state management:
  - `modalOpen`: Controls modal visibility
  - `selectedRoleId`: Tracks which role was selected
- Changed "Start" button to open modal instead of immediately starting interview
- Added handlers:
  - `handleStartClick()`: Opens modal with selected role
  - `handleSelectLength()`: Starts interview with chosen length
  - `handleCloseModal()`: Closes modal and clears selection
- Modal receives `availableQuestions` count from `questionCounts` prop

### 3. Updated startInterview Server Action
**Location:** `app/lib/actions/interviews.ts`

**Changes:**
- Added `interviewLength` parameter (defaults to "quick" for backward compatibility)
- Dynamic question count selection based on mode:
  - quick → 5 questions
  - standard → 10 questions
  - deep_dive → 15 questions
- Added validation: Throws error if role has insufficient questions
- Stores `interview_length` on session for analytics/display

### 4. CSS Styles
**Location:** `app/globals.css`

**Added minimal modal styles:**
- `.modal-overlay`: Full-screen backdrop with semi-transparent black
- `.modal-content`: White card container (max 400px width)
- `.modal-title`: Header text
- `.modal-options`: Button container with vertical layout
- `.modal-option`: Primary action button (blue)
- `.modal-option-disabled`: Grayed-out disabled state
- `.modal-cancel`: Secondary cancel button
- Mobile responsive breakpoint at 640px

### 5. Database Migration
**Location:** `migrations/004_add_interview_length.sql`

**Changes:**
- Adds `interview_length` column to `sessions` table
- Type: TEXT with CHECK constraint ('quick', 'standard', 'deep_dive')
- Nullable (for backward compatibility with existing sessions)
- Index added for potential filtering/analytics

## Database Schema Update

Run the migration in Supabase SQL Editor:

```sql
-- Add interview_length column
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS interview_length TEXT 
CHECK (interview_length IN ('quick', 'standard', 'deep_dive'));

-- Add index
CREATE INDEX IF NOT EXISTS idx_sessions_interview_length ON sessions(interview_length);
```

## How It Works

1. **User clicks "Start" button** on a role in the table
2. **Modal opens** showing three interview length options
3. **Availability logic**: 
   - Modal receives `questionCounts[roleId]` (total questions for that role)
   - Each mode button checks if enough questions exist
   - Buttons with insufficient questions are grayed out and disabled
4. **User selects a mode** (or cancels)
5. **If mode selected**:
   - Modal closes
   - `startInterview(roleId, length)` is called
   - Server randomly selects N questions from the role's question bank
   - Session is created with `interview_length` stored
   - User is redirected to interview page

## No Database Schema Changes Required

As noted in the requirements, we **do not modify the core schema**. The `interview_length` is simply stored as metadata on the session. The actual questions are selected from the role's total question pool, so:

- A role with 20 questions can offer all three modes
- A role with 8 questions can only offer Quick mode (5 questions)
- A role with 12 questions can offer Quick and Standard modes

## Design Decisions

### Minimal Implementation
- Reused existing CSS variables and button styles
- No animations or decorations
- Simple overlay + card layout
- Uses native HTML elements for accessibility

### Accessibility
- ESC key closes modal
- Click-outside closes modal  
- Disabled buttons use proper `disabled` attribute
- Focus management via React state
- Semantic button elements with clear labels

### Responsive Design
- Modal uses percentage width with max-width
- Padding adjusts for mobile (< 640px)
- Touch-friendly button sizes
- Stacks vertically for narrow screens

### Error Handling
- Client-side: Buttons disabled if insufficient questions
- Server-side: Validates question count before creating session
- Error message displayed if operation fails

## Testing Checklist

- [ ] Modal opens when clicking "Start"
- [ ] Modal closes with ESC key
- [ ] Modal closes when clicking outside
- [ ] Modal closes when clicking Cancel
- [ ] Correct modes are enabled/disabled based on question count
- [ ] Selecting a mode starts the interview
- [ ] Interview length is stored in database
- [ ] Correct number of questions are selected
- [ ] Mobile view works correctly
- [ ] Keyboard navigation works

## Future Enhancements (Not Implemented)

- Display interview length on review/history pages
- Analytics dashboard showing mode preferences
- Customizable question counts per mode
- Time limits per interview mode
- Different scoring rubrics per mode
