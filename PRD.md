# Product Requirements Document (PRD)
## Task Management & Productivity Tracker PWA — v1

**Brand:** TechSuccession  
**Version:** 1.0  
**Status:** Production Build  
**Last Updated:** August 2026

---

## 1. Product Vision

A production-grade, offline-first Progressive Web App for task management and productivity tracking. Built as a freemium SaaS product under the TechSuccession brand, focusing on minimal UI, keyboard-first navigation, and non-guilt-inducing motivation systems.

---

## 2. Target Users

- **Primary:** Individual knowledge workers, freelancers, and professionals managing personal productivity
- **Secondary:** Students and creators tracking goals and habits
- **Not in scope:** Teams, collaboration features, enterprise users (deferred to later phases)

---

## 3. Core Features

### 3.1 Task Management

**Task Entity:**
- Title (required)
- Description (optional, rich text)
- Due date/time (optional)
- Priority: Low / Medium / High
- Status: Todo / In Progress / Done
- Subtasks (nested, 1 level deep)
- Project/list assignment
- Recurrence pattern (daily/weekly/monthly)

**Views:**
- **List view:** Grouped by project or status
- **Kanban board:** Drag-and-drop between Todo/In Progress/Done columns
- **Calendar view:** Day/Week/Month showing tasks by due date

**Quick Add:**
- Natural language parsing for date/time (e.g., "Call client tomorrow 5pm")
- Keyboard shortcut (Cmd/Ctrl + K)
- Minimal inline form, no modal

**Recurring Tasks:**
- Simplified patterns: daily, weekly, monthly
- Auto-generates next instance upon completion
- Pattern stored as `recurrenceRule` field

**Reminders:**
- FCM push notification before due time
- Configurable lead time (15min, 1hr, 1day before due)
- Per-task reminder toggle

---

### 3.2 Projects & Organization

**Project Entity:**
- Name (required)
- Color picker (12 preset colors)
- Optional goal linkage
- Task count aggregation

**Default Projects:**
- Work
- Personal
- (User can create custom projects)

---

### 3.3 Time Tracking

**Timer:**
- Start/stop timer attached to any task
- Persistent across sessions (survives page reload)
- Visual indicator in task card when active

**Manual Entry:**
- Add time logged outside the app
- Fields: task, date, duration, notes (optional)
- Source flag: `timer` or `manual`

**Aggregation:**
- Time entries stored per task
- Rollup by project/day/week (computed in analytics)

---

### 3.4 Pomodoro / Focus Sessions

**Timer Configuration:**
- Work duration: default 25min (configurable 15-60min)
- Short break: default 5min (configurable 3-15min)
- Long break: default 15min (configurable 10-30min)
- Auto-start breaks toggle

**Session Types:**
- Work session (can be tied to a specific task)
- Short break
- Long break (after 4 work sessions)

**Session History:**
- Stored per session with: taskId (optional), type, duration, timestamp
- Used for analytics (most productive hours, streak calculation)

---

### 3.5 Analytics Dashboard

**Metrics:**
- Tasks completed (daily/weekly/monthly trend)
- Time spent by project (bar chart)
- Time spent by day (heatmap)
- Most productive hours (derived from time entries)
- Completion rate trend over time

**Visualization:**
- Simple, minimal charts using Recharts
- Interactive tooltips
- Time range selector (7d/30d/90d)

---

### 3.6 Streaks & Consistency

**Streak Definition:**
- Daily completion streak: at least 1 task completed OR at least 1 focus session
- Per-project streak: optional, tracks consistency per project
- Grace period: 1 "freeze" per week (missing a day doesn't break streak)

**UX Principles:**
- Encouraging, neutral-to-positive language on misses
- No red "streak lost" banners
- No shame-based copy or aggressive urgency nudges
- Streak freezes visible as "saved streak" indicator
- Principle: streaks motivate consistency, never punish a lapse

**Streak Display:**
- Current streak count (days)
- Longest streak (days)
- Freeze count remaining (e.g., "2 freezes left this week")
- Gentle nudge on miss: "You missed yesterday, but your streak is safe with a freeze"

---

### 3.7 Goals Hierarchy

**Goal Entity:**
- Title (required)
- Target date (optional)
- Linked projects (optional, many-to-many)
- Progress rolls up from linked project/task completion

**Progress Calculation:**
- Goal progress = % of linked tasks completed
- If no linked projects/tasks, manual progress entry (0-100%)

**Goal Display:**
- Progress bar per goal
- Due date countdown
- Linked projects list

---

### 3.8 Daily & Weekly Rituals

**Daily Planning Prompt:**
- Triggered on first app open each day
- Question: "What are your top 3 priorities today?"
- Optional, can be dismissed
- Stores as `dailyReviews` document

**End-of-Day Review:**
- Quick reflection modal (optional, never blocking)
- Fields: what got done, what didn't, why (optional)
- Stored as `dailyReviews` document

**Weekly Summary:**
- Auto-generated every Sunday
- Content: completed tasks count, time spent, streak status
- Delivered via in-app notification (not FCM)

---

## 4. Freemium Feature Gating

### Free Tier
- Core task management (create, edit, delete tasks)
- Projects (unlimited)
- Calendar view
- Basic Pomodoro timer
- 1 active goal
- Basic streak tracking (daily streak only)
- Daily planning prompt
- End-of-day review

### Pro Tier (gated, upgrade flow stubbed)
- Time tracking analytics dashboard
- Unlimited goals
- Per-project streaks
- Advanced analytics (completion rate trends, productive hours heatmap)
- Recurring task templates
- Priority support (contact form)
- Streak freeze customization (more than 1 per week)

**Upgrade Flow:**
- "Upgrade to Pro" CTA on gated features
- Modal showing Pro features
- "Coming soon" or "Contact us" button (no payment integration in v1)
- Plan field in user document: `free` or `pro` (manual override via Firebase Console for testing)

---

## 5. User Flows

### 5.1 Onboarding
1. User opens app → Sign in with Google or Email/Password
2. Auth redirect → Create user document in Firestore
3. Welcome screen → "Let's set up your workspace"
4. Create first project (optional, defaults provided)
5. Quick-add first task (guided)
6. Show keyboard shortcut hint (Cmd/Ctrl + K)

### 5.2 Daily Workflow
1. Open app → Daily planning prompt (if not completed today)
2. View tasks in list/kanban/calendar view
3. Start timer on task or begin Pomodoro session
4. Mark tasks complete → streak updates
5. End-of-day review (optional)

### 5.3 Task Creation
1. Press Cmd/Ctrl + K → Quick-add bar appears
2. Type "Call client tomorrow 5pm high priority"
3. Parse: title="Call client", due=tomorrow 5pm, priority=high
4. Press Enter → task created, bar closes
5. Alternative: Click "+" button → full task form

### 5.4 Time Tracking
1. Click timer icon on task → timer starts
2. Timer persists in sidebar/header
3. Click stop → time entry saved to task
4. View time entries in task detail modal

### 5.5 Pomodoro Session
1. Click Pomodoro icon in sidebar
2. Select task (optional) or start unattached session
3. Timer counts down → notification on complete
4. Auto-start break (if enabled) or manual start

---

## 6. Non-Functional Requirements

### 6.1 Offline-First
- IndexedDB via Dexie.js for local storage
- Full CRUD available offline (tasks, projects, time entries, Pomodoro sessions)
- Bidirectional sync with Firestore when back online
- Conflict resolution: last-write-wins (acceptable for v1)
- Offline indicator in UI

### 6.2 Performance
- Initial load < 2s on 3G
- Code-split routes (lazy-load analytics, charts)
- Lazy-load heavy libraries (Recharts)
- Optimistic UI updates for all mutations

### 6.3 PWA Requirements
- Installable manifest.json
- Service worker for offline caching
- Splash screen
- App icons (192x192, 512x512)
- `display-mode: standalone` (no browser chrome)
- Full keyboard shortcut support

### 6.4 Cross-Device Sync
- Firestore as source of truth
- Real-time sync via Firestore listeners
- Conflict-free sync (last-write-wins)

### 6.5 Accessibility
- Keyboard-first navigation
- ARIA labels on all interactive elements
- Focus management in modals
- High contrast mode support

---

## 7. Explicitly Out of Scope (v1)

- Team collaboration / shared projects / task assignment
- Third-party integrations (Google Calendar sync, Slack, email-to-task)
- AI-based auto-prioritization/auto-scheduling
- Custom themes/widgets
- Payment integration (Razorpay or otherwise)
- Firebase Storage (no file uploads)
- Advanced recurring patterns (RRULE)
- Subtask nesting beyond 1 level

---

## 8. Success Metrics (Post-Launch)

- DAU/MAU ratio
- Task completion rate
- Streak retention (users with >7 day streaks)
- Time tracking adoption (% of users with time entries)
- PWA install rate
- Offline usage (% of actions performed offline)

---

## 9. Future Phases (v2+)

- Team collaboration features
- Google Calendar two-way sync
- AI-powered task prioritization
- Custom themes and widgets
- Payment integration (Razorpay)
- Advanced recurring patterns (RRULE)
- Email-to-task via Cloud Functions
