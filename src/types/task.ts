import { Timestamp, FieldValue } from 'firebase/firestore';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type RecurrenceRule = 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  ownerId: string;
  goalId?: string;
  title: string;
  description?: string;
  dueDate?: Timestamp;
  priority: TaskPriority;
  status: TaskStatus;
  parentTaskId?: string;
  recurrenceRule?: RecurrenceRule;
  reminderEnabled: boolean;
  reminderLeadTime?: number;
  completedAt?: Timestamp;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  order: number;
}

export interface TaskFilters {
  goalId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  searchQuery?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}
