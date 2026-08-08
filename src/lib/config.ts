export const config = {
  useFirebaseEmulator: import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true',
  app: {
    name: 'Task & Productivity Tracker',
    shortName: 'TaskTracker',
  },
  priorities: ['low', 'medium', 'high'] as const,
  statuses: ['todo', 'in_progress', 'done'] as const,
  taskColors: [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
  ],
  projectColors: [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#6366F1', // indigo
    '#14B8A6', // teal
    '#F97316', // orange
    '#84CC16', // lime
    '#06B6D4', // cyan
    '#A855F7', // violet
  ],
};
