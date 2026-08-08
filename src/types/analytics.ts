export interface AnalyticsSummary {
  tasksCompleted: number;
  totalTimeSpentSeconds: number;
  pomodoroSessionsCount: number;
  completionRatePercentage: number;
}

export interface TasksCompletedDataPoint {
  date: string;
  count: number;
}

export interface TimeByProjectDataPoint {
  projectName: string;
  color: string;
  hours: number;
}

export interface TimeByDayDataPoint {
  date: string;
  hours: number;
}

export interface ProductiveHourDataPoint {
  hour: string; // e.g. "9 AM"
  count: number;
}
