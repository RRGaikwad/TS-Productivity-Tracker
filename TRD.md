# Technical Requirements Document (TRD)
## Task Management & Productivity Tracker PWA — v1

**Brand:** TechSuccession  
**Version:** 1.0  
**Status:** Production Build  
**Last Updated:** August 2026

---

## 1. Technology Stack

### 1.1 Frontend
- **Framework:** React 18+ with Vite
- **Language:** TypeScript
- **Styling:** TailwindCSS + shadcn/ui components
- **State Management:** React Context + hooks (no Redux)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts (lightweight, minimal)
- **Date Handling:** date-fns (lightweight alternative to moment.js)
- **Natural Language Parsing:** chrono-node (for quick-add date parsing)
- **Icons:** Lucide React

### 1.2 Backend
- **Auth:** Firebase Authentication (Google Sign-In + Email/Password)
- **Database:** Firestore (NoSQL)
- **Cloud Functions:** Firebase Cloud Functions (Node.js 18+)
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **No Firebase Storage** — media deferred to later phases

### 1.3 Offline & Sync
- **Local Storage:** IndexedDB via Dexie.js
- **Sync Strategy:** Bidirectional sync with Firestore
- **Conflict Resolution:** Last-write-wins (v1 acceptable)

### 1.4 Deployment
- **Frontend:** Vercel (not Firebase Hosting)
- **Backend:** Firebase (Auth, Firestore, Cloud Functions, FCM)
- **Environment Variables:** Vercel environment variables for Firebase config

---

## 2. Firestore Schema

### 2.1 Collection: `users/{userId}`

**Document Structure:**
```typescript
{
  email: string;
  displayName: string;
  photoURL?: string;
  plan: 'free' | 'pro';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: {
    theme: 'light' | 'dark' | 'system';
    pomodoro: {
      workDuration: number; // minutes
      shortBreakDuration: number; // minutes
      longBreakDuration: number; // minutes
      autoStartBreaks: boolean;
    };
    reminders: {
      defaultLeadTime: number; // minutes before due
    };
    timezone: string; // IANA timezone (e.g., 'Asia/Kolkata')
  };
}
```

**Indexes:**
- None required (single-document reads by userId)

---

### 2.2 Collection: `projects/{projectId}`

**Document Structure:**
```typescript
{
  ownerId: string; // matches users/{userId}
  name: string;
  color: string; // hex code (e.g., '#3B82F6')
  goalId?: string; // optional link to goals/{goalId}
  createdAt: Timestamp;
  updatedAt: Timestamp;
  archived: boolean;
}
```

**Indexes:**
- `ownerId` (single-field index for user's projects query)
- Composite: `ownerId, archived` (for active projects query)

---

### 2.3 Collection: `tasks/{taskId}`

**Document Structure:**
```typescript
{
  ownerId: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate?: Timestamp;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  parentTaskId?: string; // for subtasks (1 level deep)
  recurrenceRule?: 'daily' | 'weekly' | 'monthly';
  reminderEnabled: boolean;
  reminderLeadTime?: number; // minutes before due
  completedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  order: number; // for drag-and-drop ordering
}
```

**Indexes:**
- `ownerId` (single-field index)
- Composite: `ownerId, projectId` (for project tasks query)
- Composite: `ownerId, status` (for kanban board query)
- Composite: `ownerId, dueDate` (for calendar view query)
- Composite: `ownerId, parentTaskId` (for subtasks query)
- Composite: `ownerId, status, dueDate` (for upcoming tasks query)

---

### 2.4 Collection: `timeEntries/{entryId}`

**Document Structure:**
```typescript
{
  ownerId: string;
  taskId: string;
  projectId: string; // denormalized for analytics
  startTime: Timestamp;
  endTime?: Timestamp;
  durationSeconds: number;
  source: 'timer' | 'manual';
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
- `ownerId` (single-field index)
- Composite: `ownerId, taskId` (for task time entries query)
- Composite: `ownerId, startTime` (for date range queries in analytics)
- Composite: `ownerId, projectId, startTime` (for project analytics)

---

### 2.5 Collection: `pomodoroSessions/{sessionId}`

**Document Structure:**
```typescript
{
  ownerId: string;
  taskId?: string;
  type: 'work' | 'short_break' | 'long_break';
  startTime: Timestamp;
  durationSeconds: number;
  completed: boolean;
  createdAt: Timestamp;
}
```

**Indexes:**
- `ownerId` (single-field index)
- Composite: `ownerId, startTime` (for date range queries in analytics)

---

### 2.6 Collection: `goals/{goalId}`

**Document Structure:**
```typescript
{
  ownerId: string;
  title: string;
  targetDate?: Timestamp;
  linkedProjectIds: string[];
  progress: number; // 0-100 (computed or manual)
  createdAt: Timestamp;
  updatedAt: Timestamp;
  archived: boolean;
}
```

**Indexes:**
- `ownerId` (single-field index)
- Composite: `ownerId, archived` (for active goals query)

---

### 2.7 Collection: `dailyReviews/{reviewId}`

**Document Structure:**
```typescript
{
  ownerId: string;
  date: Timestamp; // start of day (UTC)
  top3Tasks: string[]; // task IDs
  reflectionNote?: string;
  tasksCompleted: number;
  timeSpentSeconds: number;
  pomodoroSessionsCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
- `ownerId` (single-field index)
- Composite: `ownerId, date` (for daily review lookup)

---

### 2.8 Collection: `streaks/{userId}`

**Document Structure:**
```typescript
{
  currentStreak: number; // days
  longestStreak: number; // days
  lastActiveDate: Timestamp;
  freezesRemaining: number; // per week
  freezeResetDate: Timestamp; // when freezes reset (weekly)
  perProjectStreaks: {
    [projectId: string]: {
      currentStreak: number;
      lastActiveDate: Timestamp;
    };
  };
  updatedAt: Timestamp;
}
```

**Indexes:**
- None required (single-document reads by userId)

---

### 2.9 Collection: `notifications/{notificationId}`

**Document Structure:**
```typescript
{
  ownerId: string;
  type: 'reminder' | 'streak' | 'weekly_summary';
  title: string;
  body: string;
  data?: {
    taskId?: string;
    goalId?: string;
  };
  scheduledFor: Timestamp;
  sent: boolean;
  sentAt?: Timestamp;
  createdAt: Timestamp;
}
```

**Indexes:**
- `ownerId` (single-field index)
- Composite: `ownerId, scheduledFor, sent` (for Cloud Functions to process pending notifications)

---

## 3. Firestore Security Rules

### 3.1 Base Rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(ownerId) {
      return isSignedIn() && ownerId == request.auth.uid;
    }
    
    // Helper function to check if document is owned by authenticated user
    function documentIsOwner() {
      return isOwner(resource.data.ownerId);
    }
  }
}
```

---

### 3.2 Users Collection

```firestore
match /users/{userId} {
  allow read: if isSignedIn() && userId == request.auth.uid;
  allow create: if isSignedIn() && userId == request.auth.uid;
  allow update: if isSignedIn() && userId == request.auth.uid;
  allow delete: if false; // Soft delete only
}
```

---

### 3.3 Projects Collection

```firestore
match /projects/{projectId} {
  allow read: if documentIsOwner();
  allow create: if isSignedIn() && request.resource.data.ownerId == request.auth.uid;
  allow update: if documentIsOwner();
  allow delete: if documentIsOwner();
}
```

---

### 3.4 Tasks Collection

```firestore
match /tasks/{taskId} {
  allow read: if documentIsOwner();
  allow create: if isSignedIn() && request.resource.data.ownerId == request.auth.uid;
  allow update: if documentIsOwner();
  allow delete: if documentIsOwner();
}
```

---

### 3.5 Time Entries Collection

```firestore
match /timeEntries/{entryId} {
  allow read: if documentIsOwner();
  allow create: if isSignedIn() && request.resource.data.ownerId == request.auth.uid;
  allow update: if documentIsOwner();
  allow delete: if documentIsOwner();
}
```

---

### 3.6 Pomodoro Sessions Collection

```firestore
match /pomodoroSessions/{sessionId} {
  allow read: if documentIsOwner();
  allow create: if isSignedIn() && request.resource.data.ownerId == request.auth.uid;
  allow update: if documentIsOwner();
  allow delete: if documentIsOwner();
}
```

---

### 3.7 Goals Collection

```firestore
match /goals/{goalId} {
  allow read: if documentIsOwner();
  allow create: if isSignedIn() && request.resource.data.ownerId == request.auth.uid;
  allow update: if documentIsOwner();
  allow delete: if documentIsOwner();
}
```

---

### 3.8 Daily Reviews Collection

```firestore
match /dailyReviews/{reviewId} {
  allow read: if documentIsOwner();
  allow create: if isSignedIn() && request.resource.data.ownerId == request.auth.uid;
  allow update: if documentIsOwner();
  allow delete: if documentIsOwner();
}
```

---

### 3.9 Streaks Collection

```firestore
match /streaks/{userId} {
  allow read: if isSignedIn() && userId == request.auth.uid;
  allow create: if isSignedIn() && userId == request.auth.uid;
  allow update: if isSignedIn() && userId == request.auth.uid;
  allow delete: if false; // Managed by Cloud Functions
}
```

---

### 3.10 Notifications Collection

```firestore
match /notifications/{notificationId} {
  allow read: if documentIsOwner();
  allow create: if isSignedIn() && request.resource.data.ownerId == request.auth.uid;
  allow update: if documentIsOwner() || request.auth.token.admin == true; // Cloud Functions
  allow delete: if documentIsOwner();
}
```

---

## 4. IndexedDB Schema (Dexie.js)

### 4.1 Database: `TaskProductivityDB`

**Version:** 1

**Stores:**

```typescript
{
  tasks: {
    keyPath: 'id',
    indexes: {
      'ownerId': 'ownerId',
      'projectId': 'projectId',
      'status': 'status',
      'dueDate': 'dueDate',
      'parentTaskId': 'parentTaskId',
      '[ownerId+projectId]': '[ownerId, projectId]',
      '[ownerId+status]': '[ownerId, status]',
      '[ownerId+dueDate]': '[ownerId, dueDate]'
    }
  },
  projects: {
    keyPath: 'id',
    indexes: {
      'ownerId': 'ownerId',
      '[ownerId+archived]': '[ownerId, archived]'
    }
  },
  timeEntries: {
    keyPath: 'id',
    indexes: {
      'ownerId': 'ownerId',
      'taskId': 'taskId',
      'projectId': 'projectId',
      'startTime': 'startTime',
      '[ownerId+taskId]': '[ownerId, taskId]',
      '[ownerId+startTime]': '[ownerId, startTime]'
    }
  },
  pomodoroSessions: {
    keyPath: 'id',
    indexes: {
      'ownerId': 'ownerId',
      'startTime': 'startTime',
      '[ownerId+startTime]': '[ownerId, startTime]'
    }
  },
  goals: {
    keyPath: 'id',
    indexes: {
      'ownerId': 'ownerId',
      '[ownerId+archived]': '[ownerId, archived]'
    }
  },
  dailyReviews: {
    keyPath: 'id',
    indexes: {
      'ownerId': 'ownerId',
      'date': 'date',
      '[ownerId+date]': '[ownerId, date]'
    }
  },
  streaks: {
    keyPath: 'ownerId'
  },
  syncQueue: {
    keyPath: 'id',
    indexes: {
      'collection': 'collection',
      'action': 'action', // 'create', 'update', 'delete'
      'timestamp': 'timestamp'
    }
  }
}
```

### 4.2 Sync Strategy

**Write Path (Offline → Online):**
1. User performs action (create/update/delete)
2. Write to IndexedDB immediately (optimistic UI)
3. Add operation to `syncQueue` with collection, action, document data
4. When online, process `syncQueue` in FIFO order
5. On successful Firestore write, remove from `syncQueue`
6. On failure, keep in `syncQueue` and retry on next sync

**Read Path (Online → Offline):**
1. On app load, fetch all user data from Firestore
2. Upsert to IndexedDB
3. Listen to Firestore real-time updates
4. On Firestore update, upsert to IndexedDB

**Conflict Resolution:**
- Last-write-wins based on `updatedAt` timestamp
- Firestore `updatedAt` always takes precedence over local

---

## 5. Cloud Functions

### 5.1 Scheduled Functions

**Function: `sendReminderNotifications`**
- Trigger: Every 5 minutes (pub/sub)
- Query: `notifications` where `scheduledFor <= now` and `sent == false`
- Action: Send FCM message, mark `sent = true`, set `sentAt`

**Function: `calculateStreaks`**
- Trigger: Daily at midnight (pub/sub)
- Query: All `streaks` documents
- Action: Check if user completed task or Pomodoro session yesterday
- Update streak count, handle freezes, reset weekly freeze count

**Function: `generateWeeklySummary`**
- Trigger: Every Sunday at 9 AM (pub/sub)
- Query: All users
- Action: Generate weekly summary from `dailyReviews`, create notification

---

### 5.2 Triggered Functions

**Function: `onTaskComplete`**
- Trigger: Firestore `tasks` document `onUpdate` (status → 'done')
- Action: Update streak, update goal progress, create time entry if timer running

**Function: `onUserCreate`**
- Trigger: Firestore `users` document `onCreate`
- Action: Create default projects, create streaks document

---

## 6. Firebase Configuration

### 6.1 Environment Variables

**Vercel Environment Variables:**
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

**Local Development (.env.example):**
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 6.2 Firebase Project Structure

**firebase.json:**
```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "emulators": {
    "auth": { "port": 9099 },
    "functions": { "port": 5001 },
    "firestore": { "port": 8080 },
    "pubsub": { "port": 8085 },
    "ui": { "enabled": true }
  }
}
```

**.firebaserc:**
```json
{
  "projects": {
    "default": "task-productivity-pwa",
    "production": "task-productivity-pwa-prod"
  }
}
```

---

## 7. PWA Configuration

### 7.1 manifest.json

```json
{
  "name": "Task & Productivity Tracker",
  "short_name": "TaskTracker",
  "description": "Offline-first task management and productivity tracker",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["productivity", "task-management"],
  "shortcuts": [
    {
      "name": "Quick Add Task",
      "short_name": "Add Task",
      "description": "Quickly add a new task",
      "url": "/quick-add",
      "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
    }
  ]
}
```

### 7.2 Service Worker Strategy

- **Cache-first:** Static assets (JS, CSS, images)
- **Network-first:** API calls (Firestore)
- **Offline fallback:** Cached HTML shell for offline page

---

## 8. Authentication Flow

### 8.1 Google Sign-In
1. User clicks "Sign in with Google"
2. Firebase Auth triggers Google OAuth popup
3. On success, check if user document exists in Firestore
4. If not, create user document with default settings
5. Redirect to app

### 8.2 Email/Password
1. User enters email and password
2. Firebase Auth creates/signs in user
3. Check if user document exists in Firestore
4. If not, create user document with default settings
5. Redirect to app

### 8.3 Session Persistence
- Firebase Auth uses `localStorage` by default
- Session persists across browser restarts
- On app load, check `onAuthStateChanged` to restore session

---

## 9. API Design (Internal)

### 9.1 Firebase Service Layer

**File:** `src/services/firebase.ts`

```typescript
// Auth
export const signInWithGoogle = () => Promise<UserCredential>;
export const signInWithEmail = (email: string, password: string) => Promise<UserCredential>;
export const signUpWithEmail = (email: string, password: string) => Promise<UserCredential>;
export const signOut = () => Promise<void>;

// Firestore
export const getUserDoc = (userId: string) => Promise<DocumentData>;
export const updateUserDoc = (userId: string, data: Partial<User>) => Promise<void>;
export const getProjects = (userId: string) => Promise<Project[]>;
export const createProject = (data: Project) => Promise<void>;
export const getTasks = (userId: string, filters?: TaskFilters) => Promise<Task[]>;
export const createTask = (data: Task) => Promise<void>;
export const updateTask = (taskId: string, data: Partial<Task>) => Promise<void>;
export const deleteTask = (taskId: string) => Promise<void>;

// Real-time listeners
export const subscribeToTasks = (userId: string, callback: (tasks: Task[]) => void) => Unsubscribe;
export const subscribeToProjects = (userId: string, callback: (projects: Project[]) => void) => Unsubscribe;
```

### 9.2 IndexedDB Service Layer

**File:** `src/services/db.ts`

```typescript
export const db = new Dexie('TaskProductivityDB');

export const syncWithFirestore = async () => Promise<void>;
export const addToSyncQueue = (operation: SyncOperation) => Promise<void>;
export const processSyncQueue = async () => Promise<void>;
```

---

## 10. Performance Optimization

### 10.1 Code Splitting
- Lazy-load analytics route (`React.lazy`)
- Lazy-load chart components
- Lazy-load Pomodoro timer
- Split vendor chunks (Firebase, Recharts)

### 10.2 Data Fetching
- Firestore pagination for large task lists (limit 50, infinite scroll)
- IndexedDB queries for offline filtering
- Debounce search inputs (300ms)

### 10.3 Rendering
- Virtual scrolling for long task lists (react-window)
- Memoized list items (React.memo)
- Optimistic UI updates for all mutations

---

## 11. Security Considerations

### 11.1 Client-Side
- Validate all inputs with Zod before sending to Firestore
- Sanitize user-generated content (description, notes)
- Never expose Firebase config secrets (use environment variables)

### 11.2 Server-Side
- Firestore security rules enforce ownership checks
- Cloud Functions validate request auth tokens
- Rate limiting on Cloud Functions (if needed)

### 11.3 PWA Security
- Service worker scope: root directory only
- HTTPS only (enforced by Vercel)
- CSP headers (configured in Vercel)

---

## 12. Deployment Architecture

### 12.1 Frontend (Vercel)
- Build command: `vite build`
- Output directory: `dist`
- Environment variables: Firebase config
- Custom domains: Configured in Vercel dashboard

### 12.2 Backend (Firebase)
- Cloud Functions deployed via `firebase deploy --only functions`
- Firestore rules deployed via `firebase deploy --only firestore:rules`
- Firestore indexes deployed via `firebase deploy --only firestore:indexes`

### 12.3 Domain Configuration
- Add Vercel production domain to Firebase Auth "Authorized domains"
- Add Vercel preview domains to Firebase Auth "Authorized domains" (wildcard or dynamic)

---

## 13. Monitoring & Logging

### 13.1 Firebase Analytics
- Track user events: task_created, task_completed, timer_started, pomodoro_completed
- Track screen views: list_view, kanban_view, calendar_view, analytics_view

### 13.2 Cloud Functions Logging
- Log all Cloud Function invocations
- Log errors with stack traces
- Monitor function execution times

### 13.3 Error Tracking
- Integrate Sentry (optional, deferred to v2)
- Log client-side errors to console (v1)

---

## 14. Testing Strategy

### 14.1 Unit Tests
- React components (Vitest + React Testing Library)
- Utility functions (date parsing, streak calculation)
- IndexedDB service layer

### 14.2 Integration Tests
- Firebase service layer (with Firebase emulator)
- Sync queue processing
- Auth flow

### 14.3 E2E Tests
- Critical user flows (Playwright)
- Task creation, completion, deletion
- Timer start/stop
- Pomodoro session
- Offline mode (simulate network conditions)

---

## 15. Development Workflow

### 15.1 Local Development
1. Start Firebase emulators: `firebase emulators:start`
2. Start Vite dev server: `npm run dev`
3. App connects to Firebase emulators (via firebase config)
4. Hot reload enabled

### 15.2 Staging
1. Deploy to Vercel preview branch
2. Deploy Cloud Functions to Firebase staging project
3. Test with staging Firebase config

### 15.3 Production
1. Deploy to Vercel production
2. Deploy Cloud Functions to Firebase production project
3. Monitor Firebase Console and Vercel analytics

---

## 16. Deferred Features (v2+)

- Firebase Storage for file uploads
- Advanced recurring patterns (RRULE)
- Team collaboration features
- Third-party integrations (Google Calendar, Slack)
- AI-powered features
- Payment integration (Razorpay)
- Custom themes
- Advanced analytics (machine learning insights)
