import { Timestamp, FieldValue } from 'firebase/firestore';

export interface Goal {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  color?: string;
  targetDate?: Timestamp;
  progress: number; // 0-100
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  archived: boolean;
}
