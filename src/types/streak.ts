import { Timestamp, FieldValue } from 'firebase/firestore';

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Timestamp;
  freezesRemaining: number;
  freezeResetDate: Timestamp;
  perProjectStreaks: Record<string, ProjectStreak>;
  updatedAt: Timestamp | FieldValue;
}

export interface ProjectStreak {
  currentStreak: number;
  lastActiveDate: Timestamp;
}
