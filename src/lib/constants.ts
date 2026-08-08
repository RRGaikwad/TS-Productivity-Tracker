export const PRIORITIES = {
  low: { value: 'low', label: 'Low', color: 'bg-gray-500' },
  medium: { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  high: { value: 'high', label: 'High', color: 'bg-red-500' },
} as const;

export const STATUSES = {
  todo: { value: 'todo', label: 'Todo', color: 'bg-gray-200' },
  in_progress: { value: 'in_progress', label: 'In Progress', color: 'bg-blue-200' },
  done: { value: 'done', label: 'Done', color: 'bg-green-200' },
} as const;

export const RECURRENCE_RULES = {
  daily: { value: 'daily', label: 'Daily' },
  weekly: { value: 'weekly', label: 'Weekly' },
  monthly: { value: 'monthly', label: 'Monthly' },
} as const;
