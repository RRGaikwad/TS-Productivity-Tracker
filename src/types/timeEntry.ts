import { Timestamp, FieldValue } from 'firebase/firestore';

export type TimeEntrySource = 'timer' | 'manual';

export interface TimeEntry {
  id: string;
  ownerId: string;
  taskId: string;
  projectId: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  durationSeconds: number;
  source: TimeEntrySource;
  notes?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}
