# Component & Folder Architecture Plan
## Task Management & Productivity Tracker PWA — v1

**Brand:** TechSuccession  
**Version:** 1.0  
**Status:** Production Build  
**Last Updated:** August 2026

---

## 1. Root Directory Structure

```
task-productivity-pwa/
├── public/                      # Static assets
│   ├── icons/                   # PWA icons (192x192, 512x512)
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── assets/                  # Images, fonts, static assets
│   ├── components/              # Reusable UI components
│   ├── features/                # Feature-specific components and logic
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility libraries and configurations
│   ├── services/                # External service integrations (Firebase, IndexedDB)
│   ├── stores/                  # React Context providers
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Pure utility functions
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── vite-env.d.ts            # Vite environment types
├── functions/                   # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts
│   │   ├── scheduled/
│   │   └── triggered/
│   ├── package.json
│   └── tsconfig.json
├── firebase.json                # Firebase configuration
├── .firebaserc                  # Firebase project configuration
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Firestore indexes
├── .env.example                 # Environment variables template
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── vercel.json                  # Vercel deployment configuration
```

---

## 2. src/ Directory Structure

### 2.1 components/ (Reusable UI Components)

```
src/components/
├── ui/                          # shadcn/ui components (or custom)
│   ├── button.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── popover.tsx
│   ├── tooltip.tsx
│   ├── calendar.tsx
│   ├── checkbox.tsx
│   ├── radio-group.tsx
│   ├── switch.tsx
│   ├── slider.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── card.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   └── separator.tsx
├── layout/                      # Layout components
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── MainLayout.tsx
│   └── MobileNav.tsx
├── common/                      # Common reusable components
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   ├── ErrorBoundary.tsx
│   ├── OfflineIndicator.tsx
│   └── KeyboardShortcutHint.tsx
└── icons/                       # Icon wrappers (Lucide)
    └── index.ts                 # Export all icons
```

---

### 2.2 features/ (Feature-Specific Modules)

```
src/features/
├── auth/                        # Authentication
│   ├── components/
│   │   ├── SignInForm.tsx
│   │   ├── SignUpForm.tsx
│   │   ├── GoogleSignInButton.tsx
│   │   └── AuthGuard.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   └── types.ts
├── tasks/                       # Task management
│   ├── components/
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── QuickAddBar.tsx
│   │   ├── TaskDetailModal.tsx
│   │   ├── SubtaskList.tsx
│   │   ├── SubtaskItem.tsx
│   │   ├── TaskFilters.tsx
│   │   └── TaskPriorityBadge.tsx
│   ├── views/
│   │   ├── TaskListView.tsx
│   │   ├── KanbanView.tsx
│   │   └── CalendarView.tsx
│   ├── hooks/
│   │   ├── useTasks.ts
│   │   ├── useTaskMutation.ts
│   │   └── useQuickAdd.ts
│   ├── utils/
│   │   └── parseNaturalLanguage.ts
│   └── types.ts
├── projects/                    # Project management
│   ├── components/
│   │   ├── ProjectList.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── ProjectColorPicker.tsx
│   │   └── ProjectDropdown.tsx
│   ├── hooks/
│   │   ├── useProjects.ts
│   │   └── useProjectMutation.ts
│   └── types.ts
├── timeTracking/                # Time tracking
│   ├── components/
│   │   ├── TimerButton.tsx
│   │   ├── TimerDisplay.tsx
│   │   ├── TimeEntryList.tsx
│   │   ├── TimeEntryForm.tsx
│   │   └── ManualTimeEntry.tsx
│   ├── hooks/
│   │   ├── useTimer.ts
│   │   ├── useTimeEntries.ts
│   │   └── useTimeEntryMutation.ts
│   └── types.ts
├── pomodoro/                    # Pomodoro timer
│   ├── components/
│   │   ├── PomodoroTimer.tsx
│   │   ├── PomodoroSettings.tsx
│   │   ├── PomodoroSessionList.tsx
│   │   └── PomodoroControls.tsx
│   ├── hooks/
│   │   ├── usePomodoro.ts
│   │   └── usePomodoroSettings.ts
│   └── types.ts
├── analytics/                   # Analytics dashboard
│   ├── components/
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── TasksCompletedChart.tsx
│   │   ├── TimeByProjectChart.tsx
│   │   ├── TimeByDayHeatmap.tsx
│   │   ├── ProductiveHoursChart.tsx
│   │   ├── CompletionRateChart.tsx
│   │   └── DateRangeSelector.tsx
│   ├── hooks/
│   │   ├── useAnalytics.ts
│   │   └── useAnalyticsData.ts
│   └── types.ts
├── streaks/                     # Streak tracking
│   ├── components/
│   │   ├── StreakDisplay.tsx
│   │   ├── StreakFreezeIndicator.tsx
│   │   └── StreakCalendar.tsx
│   ├── hooks/
│   │   ├── useStreaks.ts
│   │   └── useStreakMutation.ts
│   └── types.ts
├── goals/                       # Goals hierarchy
│   ├── components/
│   │   ├── GoalList.tsx
│   │   ├── GoalCard.tsx
│   │   ├── GoalForm.tsx
│   │   ├── GoalProgress.tsx
│   │   └── GoalProjectLinker.tsx
│   ├── hooks/
│   │   ├── useGoals.ts
│   │   └── useGoalMutation.ts
│   └── types.ts
├── dailyReview/                 # Daily planning & review
│   ├── components/
│   │   ├── DailyPlanningPrompt.tsx
│   │   ├── EndOfDayReview.tsx
│   │   └── WeeklySummary.tsx
│   ├── hooks/
│   │   ├── useDailyReview.ts
│   │   └── useWeeklySummary.ts
│   └── types.ts
├── reminders/                   # Push notifications
│   ├── components/
│   │   ├── ReminderSettings.tsx
│   │   └── ReminderToggle.tsx
│   ├── hooks/
│   │   └── useReminders.ts
│   └── types.ts
└── settings/                    # App settings
    ├── components/
    │   ├── SettingsPanel.tsx
    │   ├── ThemeToggle.tsx
    │   ├── PomodoroSettings.tsx
    │   └── AccountSettings.tsx
    ├── hooks/
    │   └── useSettings.ts
    └── types.ts
```

---

### 2.3 hooks/ (Custom React Hooks)

```
src/hooks/
├── useAuth.ts                   # Auth state and methods
├── useOnlineStatus.ts           # Online/offline detection
├── useKeyboardShortcuts.ts      # Global keyboard shortcuts
├── useDebounce.ts               # Debounce utility
├── useLocalStorage.ts           # Local storage persistence
├── useToast.ts                  # Toast notifications
├── useModal.ts                  # Modal state management
├── useMediaQuery.ts             # Responsive breakpoints
└── useOnClickOutside.ts         # Click outside detection
```

---

### 2.4 lib/ (Configuration & Libraries)

```
src/lib/
├── firebase.ts                  # Firebase initialization
├── db.ts                        # Dexie.js IndexedDB setup
├── utils.ts                     # Shared utilities
├── constants.ts                 # App constants (priorities, statuses, colors)
├── validators.ts                # Zod validation schemas
└── config.ts                    # App configuration
```

---

### 2.5 services/ (External Service Integrations)

```
src/services/
├── firebase/
│   ├── auth.ts                  # Firebase Auth methods
│   ├── firestore.ts             # Firestore CRUD operations
│   ├── storage.ts               # (deferred to v2)
│   └── messaging.ts             # FCM push notifications
├── indexeddb/
│   ├── sync.ts                  # Sync queue management
│   ├── queries.ts               # IndexedDB queries
│   └── migrations.ts            # DB schema migrations
└── analytics/
    └── firebase-analytics.ts    # Firebase Analytics events
```

---

### 2.6 stores/ (React Context Providers)

```
src/stores/
├── AuthContext.tsx              # Auth state provider
├── TaskContext.tsx              # Task state provider
├── ProjectContext.tsx           # Project state provider
├── TimerContext.tsx             # Timer state provider
├── PomodoroContext.tsx          # Pomodoro state provider
├── SettingsContext.tsx          # Settings state provider
├── UIContext.tsx                # UI state (modals, toasts, sidebar)
└── index.ts                     # Export all providers
```

---

### 2.7 types/ (TypeScript Type Definitions)

```
src/types/
├── index.ts                     # Export all types
├── user.ts                      # User types
├── task.ts                      # Task types
├── project.ts                   # Project types
├── timeEntry.ts                 # Time entry types
├── pomodoro.ts                  # Pomodoro session types
├── goal.ts                      # Goal types
├── streak.ts                    # Streak types
├── dailyReview.ts               # Daily review types
├── notification.ts              # Notification types
└── settings.ts                  # Settings types
```

---

### 2.8 utils/ (Pure Utility Functions)

```
src/utils/
├── date.ts                      # Date formatting and manipulation
├── time.ts                      # Time formatting (seconds to HH:MM:SS)
├── string.ts                    # String manipulation
├── array.ts                     # Array manipulation
├── object.ts                    # Object manipulation
├── validation.ts                # Validation helpers
├── naturalLanguage.ts           # Natural language parsing helpers
├── streak.ts                    # Streak calculation logic
└── analytics.ts                 # Analytics data aggregation
```

---

## 3. Routing Structure

```
src/
├── App.tsx                      # Root component with router
└── pages/                       # Route components
    ├── HomePage.tsx             # Dashboard / task list
    ├── TasksPage.tsx            # Tasks (list/kanban/calendar views)
    ├── ProjectsPage.tsx         # Projects management
    ├── AnalyticsPage.tsx        # Analytics dashboard
    ├── GoalsPage.tsx            # Goals management
    ├── SettingsPage.tsx         # Settings
    ├── QuickAddPage.tsx         # Quick-add (PWA shortcut)
    └── AuthPage.tsx             # Sign in / sign up
```

**Route Configuration (React Router v6):**
```typescript
const routes = [
  { path: '/', element: <HomePage /> },
  { path: '/tasks', element: <TasksPage /> },
  { path: '/tasks/:view', element: <TasksPage /> }, // list, kanban, calendar
  { path: '/projects', element: <ProjectsPage /> },
  { path: '/analytics', element: <AnalyticsPage /> },
  { path: '/goals', element: <GoalsPage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/quick-add', element: <QuickAddPage /> },
  { path: '/auth', element: <AuthPage /> },
];
```

---

## 4. Component Hierarchy (Key Views)

### 4.1 Main Layout

```
App.tsx
└── MainLayout.tsx
    ├── Sidebar.tsx
    │   ├── Logo
    │   ├── Navigation Links
    │   └── User Profile
    ├── Header.tsx
    │   ├── Breadcrumbs
    │   ├── Search
    │   └── Quick Actions
    └── Main Content Area
        └── (Page Content)
```

### 4.2 Tasks Page

```
TasksPage.tsx
├── TaskFilters.tsx
├── View Toggle (List/Kanban/Calendar)
├── QuickAddBar.tsx
└── View Container
    ├── TaskListView.tsx
    │   └── TaskList.tsx
    │       └── TaskCard.tsx
    │           ├── Task Title
    │           ├── Task Priority Badge
    │           ├── Due Date
    │           ├── Timer Button
    │           └── SubtaskList.tsx
    ├── KanbanView.tsx
    │   ├── Column (Todo)
    │   ├── Column (In Progress)
    │   └── Column (Done)
    └── CalendarView.tsx
        └── Calendar Component
            └── Task Indicators
```

### 4.3 Analytics Dashboard

```
AnalyticsPage.tsx
├── DateRangeSelector.tsx
├── Metrics Summary Cards
│   ├── Tasks Completed
│   ├── Time Tracked
│   ├── Streak
│   └── Completion Rate
└── Charts Grid
    ├── TasksCompletedChart.tsx
    ├── TimeByProjectChart.tsx
    ├── TimeByDayHeatmap.tsx
    ├── ProductiveHoursChart.tsx
    └── CompletionRateChart.tsx
```

---

## 5. State Management Strategy

### 5.1 Context-Based State

**AuthContext:**
- `user: User | null`
- `loading: boolean`
- `signIn: () => Promise<void>`
- `signOut: () => Promise<void>`

**TaskContext:**
- `tasks: Task[]`
- `loading: boolean`
- `addTask: (task: Task) => Promise<void>`
- `updateTask: (id: string, updates: Partial<Task>) => Promise<void>`
- `deleteTask: (id: string) => Promise<void>`

**ProjectContext:**
- `projects: Project[]`
- `loading: boolean`
- `addProject: (project: Project) => Promise<void>`
- `updateProject: (id: string, updates: Partial<Project>) => Promise<void>`
- `deleteProject: (id: string) => Promise<void>`

**TimerContext:**
- `activeTimer: TimerState | null`
- `startTimer: (taskId: string) => void`
- `stopTimer: () => void`

**PomodoroContext:**
- `session: PomodoroSession | null`
- `settings: PomodoroSettings`
- `startSession: (type: SessionType, taskId?: string) => void`
- `stopSession: () => void`
- `updateSettings: (settings: Partial<PomodoroSettings>) => void`

**SettingsContext:**
- `settings: UserSettings`
- `updateSettings: (settings: Partial<UserSettings>) => Promise<void>`

**UIContext:**
- `sidebarOpen: boolean`
- `setSidebarOpen: (open: boolean) => void`
- `modal: ModalState | null`
- `openModal: (modal: ModalState) => void`
- `closeModal: () => void`
- `toast: ToastState | null`
- `showToast: (toast: ToastState) => void`

### 5.2 Local Component State

- Form inputs (controlled components)
- UI toggles (dropdowns, popovers)
- View-specific filters
- Modal open/close states

---

## 6. Data Flow Architecture

### 6.1 Read Flow (Online)

```
Component → useTasks hook → Firestore Service → Firestore → Component
```

### 6.2 Read Flow (Offline)

```
Component → useTasks hook → IndexedDB Service → IndexedDB → Component
```

### 6.3 Write Flow (Online)

```
Component → useTaskMutation hook → Firestore Service → Firestore → IndexedDB (sync)
```

### 6.4 Write Flow (Offline)

```
Component → useTaskMutation hook → IndexedDB Service → IndexedDB → Sync Queue
→ (when online) → Firestore Service → Firestore
```

### 6.5 Real-time Sync Flow

```
Firestore → Firestore Listener → IndexedDB Service → IndexedDB → Component (via Context)
```

---

## 7. Firebase Cloud Functions Structure

```
functions/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── scheduled/
│   │   ├── sendReminderNotifications.ts
│   │   ├── calculateStreaks.ts
│   │   └── generateWeeklySummary.ts
│   ├── triggered/
│   │   ├── onTaskComplete.ts
│   │   └── onUserCreate.ts
│   └── utils/
│       ├── fcm.ts               # FCM helpers
│       └── streak.ts            # Streak calculation logic
├── package.json
└── tsconfig.json
```

---

## 8. PWA Service Worker Structure

```
public/
├── sw.js                        # Service worker (generated by Vite PWA plugin)
├── manifest.json                # PWA manifest
└── icons/
    ├── icon-192x192.png
    └── icon-512x512.png
```

**Service Worker Strategy (Vite PWA Plugin):**
- Cache-first for static assets
- Network-first for API calls
- Offline fallback for HTML
- Precache critical assets
- Runtime caching for dynamic content

---

## 9. Styling Strategy

### 9.1 TailwindCSS Configuration

**Tailwind Config:**
```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### 9.2 Component Styling

- Utility-first with TailwindCSS
- Component-specific styles in `className` props
- No CSS modules or styled-components (keep it simple)
- shadcn/ui components for complex UI patterns

---

## 10. TypeScript Type Definitions

### 10.1 Core Types (examples)

```typescript
// src/types/task.ts
export interface Task {
  id: string;
  ownerId: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  parentTaskId?: string;
  recurrenceRule?: 'daily' | 'weekly' | 'monthly';
  reminderEnabled: boolean;
  reminderLeadTime?: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  order: number;
}

// src/types/project.ts
export interface Project {
  id: string;
  ownerId: string;
  name: string;
  color: string;
  goalId?: string;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}

// src/types/timeEntry.ts
export interface TimeEntry {
  id: string;
  ownerId: string;
  taskId: string;
  projectId: string;
  startTime: Date;
  endTime?: Date;
  durationSeconds: number;
  source: 'timer' | 'manual';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 11. Performance Optimization Strategy

### 11.1 Code Splitting

```typescript
// Lazy-loaded routes
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));

// Lazy-loaded components
const PomodoroTimer = lazy(() => import('./features/pomodoro/components/PomodoroTimer'));
const TasksCompletedChart = lazy(() => import('./features/analytics/components/TasksCompletedChart'));
```

### 11.2 Virtual Scrolling

```typescript
// Use react-window for long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={tasks.length}
  itemSize={80}
>
  {({ index, style }) => <TaskCard task={tasks[index]} style={style} />}
</FixedSizeList>
```

### 11.3 Memoization

```typescript
// Memoize expensive computations
const filteredTasks = useMemo(() => {
  return tasks.filter(task => task.status === filter);
}, [tasks, filter]);

// Memoize list items
const TaskCard = memo(({ task }: { task: Task }) => {
  // ...
});
```

---

## 12. Testing Structure

```
src/
├── __tests__/
│   ├── components/
│   │   ├── TaskCard.test.tsx
│   │   └── QuickAddBar.test.tsx
│   ├── hooks/
│   │   ├── useAuth.test.ts
│   │   └── useTasks.test.ts
│   ├── utils/
│   │   ├── date.test.ts
│   │   └── streak.test.ts
│   └── services/
│       ├── firebase.test.ts
│       └── indexeddb.test.ts
└── e2e/
    ├── task-creation.spec.ts
    ├── timer.spec.ts
    └── offline-mode.spec.ts
```

---

## 13. Build & Deployment Configuration

### 13.1 Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Task & Productivity Tracker',
        short_name: 'TaskTracker',
        // ... manifest config
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'charts-vendor': ['recharts'],
        },
      },
    },
  },
});
```

### 13.2 Vercel Config

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_FIREBASE_API_KEY": "@firebase-api-key",
    "VITE_FIREBASE_AUTH_DOMAIN": "@firebase-auth-domain",
    "VITE_FIREBASE_PROJECT_ID": "@firebase-project-id",
    "VITE_FIREBASE_STORAGE_BUCKET": "@firebase-storage-bucket",
    "VITE_FIREBASE_MESSAGING_SENDER_ID": "@firebase-messaging-sender-id",
    "VITE_FIREBASE_APP_ID": "@firebase-app-id",
    "VITE_FIREBASE_MEASUREMENT_ID": "@firebase-measurement-id"
  }
}
```

---

## 14. Development Workflow

### 14.1 Local Development

1. Install dependencies: `npm install`
2. Start Firebase emulators: `firebase emulators:start`
3. Start Vite dev server: `npm run dev`
4. Open http://localhost:5173

### 14.2 Building for Production

1. Build: `npm run build`
2. Preview: `npm run preview`
3. Deploy to Vercel: `vercel --prod`
4. Deploy Cloud Functions: `firebase deploy --only functions`

---

## 15. Key Dependencies

### 15.1 Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "firebase": "^10.7.0",
    "dexie": "^3.2.4",
    "date-fns": "^2.30.0",
    "chrono-node": "^2.6.1",
    "recharts": "^2.10.0",
    "lucide-react": "^0.294.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.16.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.0",
    "@playwright/test": "^1.40.0"
  }
}
```

---

## 16. Summary

This architecture provides:
- **Clear separation of concerns** (features, UI, services, types)
- **Scalable folder structure** for future growth
- **Type safety** with TypeScript
- **Offline-first** with IndexedDB + Firestore sync
- **Performance optimization** with code splitting and virtual scrolling
- **PWA-ready** with service worker and manifest
- **Deployment-ready** for Vercel + Firebase
