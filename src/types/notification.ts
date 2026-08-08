import { Timestamp, FieldValue } from 'firebase/firestore';

export type NotificationType = 'reminder' | 'streak' | 'weekly_summary';

export interface Notification {
  id: string;
  ownerId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: {
    taskId?: string;
    goalId?: string;
  };
  scheduledFor: Timestamp;
  sent: boolean;
  sentAt?: Timestamp;
  createdAt: Timestamp | FieldValue;
}
