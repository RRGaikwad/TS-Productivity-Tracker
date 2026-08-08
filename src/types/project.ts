import { Timestamp, FieldValue } from 'firebase/firestore';

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  color: string;
  goalId?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  archived: boolean;
}
