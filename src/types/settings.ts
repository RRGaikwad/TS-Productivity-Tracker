export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  pomodoro: PomodoroUserSettings;
  reminders: ReminderSettings;
  timezone: string;
}

export interface PomodoroUserSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
}

export interface ReminderSettings {
  defaultLeadTime: number;
}
