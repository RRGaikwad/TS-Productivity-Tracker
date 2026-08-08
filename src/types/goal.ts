import { Timestamp, FieldValue } from 'firebase/firestore';

export interface Goal {
  id: string;
  ownerId: string;
  title: string;
  targetDate?: Timestamp;
  linkedProjectIds: string[];
  progress: number; // 0-100
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  archived: boolean;
}
