import { Timestamp, FieldValue } from 'firebase/firestore';

export type SessionType = 'work' | 'short_break' | 'long_break';

export interface PomodoroSession {
  id: string;
  ownerId: string;
  taskId?: string;
  type: SessionType;
  startTime: Timestamp;
  durationSeconds: number;
  completed: boolean;
  createdAt: Timestamp | FieldValue;
}

export interface PomodoroSettings {
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  autoStartBreaks: boolean;
}
