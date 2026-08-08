import { Timestamp, FieldValue } from 'firebase/firestore';

export interface DailyReview {
  id: string;
  ownerId: string;
  date: Timestamp;
  top3Tasks: string[];
  reflectionNote?: string;
  tasksCompleted: number;
  timeSpentSeconds: number;
  pomodoroSessionsCount: number;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}
