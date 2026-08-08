import Dexie, { Table } from 'dexie';
import type { Task, Project, TimeEntry, PomodoroSession, Goal, DailyReview, Streak } from '../types';

export interface SyncOperation {
  id: string;
  collection: string;
  action: 'create' | 'update' | 'delete';
  documentId: string;
  data: any;
  timestamp: number;
}

export class TaskProductivityDB extends Dexie {
  tasks!: Table<Task>;
  projects!: Table<Project>;
  timeEntries!: Table<TimeEntry>;
  pomodoroSessions!: Table<PomodoroSession>;
  goals!: Table<Goal>;
  dailyReviews!: Table<DailyReview>;
  streaks!: Table<Streak>;
  syncQueue!: Table<SyncOperation>;

  constructor() {
    super('TaskProductivityDB');
    this.version(1).stores({
      tasks: 'id, ownerId, projectId, status, dueDate, parentTaskId, [ownerId+projectId], [ownerId+status], [ownerId+dueDate]',
      projects: 'id, ownerId, [ownerId+archived]',
      timeEntries: 'id, ownerId, taskId, projectId, startTime, [ownerId+taskId], [ownerId+startTime], [ownerId+projectId+startTime]',
      pomodoroSessions: 'id, ownerId, startTime, [ownerId+startTime]',
      goals: 'id, ownerId, [ownerId+archived]',
      dailyReviews: 'id, ownerId, date, [ownerId+date]',
      streaks: 'ownerId',
      syncQueue: 'id, collection, action, timestamp',
    });
  }
}

export const db = new TaskProductivityDB();
