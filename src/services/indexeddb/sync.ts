import { type SyncOperation } from '../../lib/db';
import { addToSyncQueue, removeFromSyncQueue, getSyncQueueFromDB } from './queries';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../../lib/firebase';

export const syncWithFirestore = async (): Promise<void> => {
  const operations = await getSyncQueueFromDB();
  
  for (const operation of operations) {
    try {
      await processSyncOperation(operation);
      await removeFromSyncQueue(operation.id);
    } catch (error) {
      console.error('Failed to sync operation:', operation, error);
      // Keep in queue for retry
    }
  }
};

const processSyncOperation = async (operation: SyncOperation): Promise<void> => {
  const { collection, action, documentId, data } = operation;
  
  switch (collection) {
    case 'tasks':
      await syncTask(action, documentId, data);
      break;
    case 'projects':
      await syncProject(action, documentId, data);
      break;
    case 'timeEntries':
      await syncTimeEntry(action, documentId, data);
      break;
    case 'pomodoroSessions':
      await syncPomodoroSession(action, documentId, data);
      break;
    case 'goals':
      await syncGoal(action, documentId, data);
      break;
    case 'dailyReviews':
      await syncDailyReview(action, documentId, data);
      break;
    default:
      console.warn('Unknown collection in sync operation:', collection);
  }
};

const syncTask = async (action: string, documentId: string, data: any): Promise<void> => {
  const docRef = doc(firestore, 'tasks', documentId);
  
  switch (action) {
    case 'create':
    case 'update':
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      break;
    case 'delete':
      await deleteDoc(docRef);
      break;
  }
};

const syncProject = async (action: string, documentId: string, data: any): Promise<void> => {
  const docRef = doc(firestore, 'projects', documentId);
  
  switch (action) {
    case 'create':
    case 'update':
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      break;
    case 'delete':
      await deleteDoc(docRef);
      break;
  }
};

const syncTimeEntry = async (action: string, documentId: string, data: any): Promise<void> => {
  const docRef = doc(firestore, 'timeEntries', documentId);
  
  switch (action) {
    case 'create':
    case 'update':
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      break;
    case 'delete':
      await deleteDoc(docRef);
      break;
  }
};

const syncPomodoroSession = async (action: string, documentId: string, data: any): Promise<void> => {
  const docRef = doc(firestore, 'pomodoroSessions', documentId);
  
  switch (action) {
    case 'create':
    case 'update':
      await setDoc(docRef, {
        ...data,
      }, { merge: true });
      break;
    case 'delete':
      await deleteDoc(docRef);
      break;
  }
};

const syncGoal = async (action: string, documentId: string, data: any): Promise<void> => {
  const docRef = doc(firestore, 'goals', documentId);
  
  switch (action) {
    case 'create':
    case 'update':
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      break;
    case 'delete':
      await deleteDoc(docRef);
      break;
  }
};

const syncDailyReview = async (action: string, documentId: string, data: any): Promise<void> => {
  const docRef = doc(firestore, 'dailyReviews', documentId);
  
  switch (action) {
    case 'create':
    case 'update':
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      break;
    case 'delete':
      await deleteDoc(docRef);
      break;
  }
};

export const queueSyncOperation = async (
  collection: string,
  action: 'create' | 'update' | 'delete',
  documentId: string,
  data: any
): Promise<void> => {
  const operation: SyncOperation = {
    id: `${collection}-${documentId}-${Date.now()}`,
    collection,
    action,
    documentId,
    data,
    timestamp: Date.now(),
  };
  
  await addToSyncQueue(operation);
};
