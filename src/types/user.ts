import { Timestamp, FieldValue } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  plan: 'free' | 'pro';
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  pomodoro: PomodoroUserSettings;
  reminders: ReminderSettings;
  timezone: string;
}

export interface PomodoroUserSettings {
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  autoStartBreaks: boolean;
}

export interface ReminderSettings {
  defaultLeadTime: number; // minutes before due
}
