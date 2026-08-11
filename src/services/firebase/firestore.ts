import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type DocumentData,
  type Query,
  type Unsubscribe,
} from 'firebase/firestore';
import { firestore } from '../../lib/firebase';
import type { User, Task, Goal } from '../../types';


// Users
export const getUserDoc = async (userId: string): Promise<DocumentData | null> => {
  const docRef = doc(firestore, 'users', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const updateUserDoc = async (userId: string, data: Partial<User>): Promise<void> => {
  const docRef = doc(firestore, 'users', userId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Goals
export const getGoals = async (userId: string): Promise<Goal[]> => {
  const q = query(
    collection(firestore, 'goals'),
    where('ownerId', '==', userId),
    where('archived', '==', false),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Goal));
};

export const createGoal = async (data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const payload: any = {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  Object.entries(data).forEach(([key, val]) => {
    if (val !== undefined) payload[key] = val;
  });
  const docRef = await addDoc(collection(firestore, 'goals'), payload);
  return docRef.id;
};

export const updateGoal = async (goalId: string, data: Partial<Goal>): Promise<void> => {
  const docRef = doc(firestore, 'goals', goalId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteGoal = async (goalId: string): Promise<void> => {
  const docRef = doc(firestore, 'goals', goalId);
  await deleteDoc(docRef);
};

export const subscribeToGoals = (userId: string, callback: (goals: Goal[]) => void): Unsubscribe => {
  const q = query(
    collection(firestore, 'goals'),
    where('ownerId', '==', userId),
    where('archived', '==', false)
  );

  return onSnapshot(q, (snapshot) => {
    const goals = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Goal));
    callback(goals);
  });
};

// Tasks
export const getTasks = async (userId: string, filters?: {
  projectId?: string;
  status?: string;
  priority?: string;
}): Promise<Task[]> => {
  let q: Query = query(
    collection(firestore, 'tasks'),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  if (filters?.projectId) {
    q = query(q, where('projectId', '==', filters.projectId));
  }
  
  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  
  if (filters?.priority) {
    q = query(q, where('priority', '==', filters.priority));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task));
};

export const createTask = async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const payload: any = {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  Object.entries(data).forEach(([key, val]) => {
    if (val !== undefined) {
      payload[key] = val;
    }
  });

  const docRef = await addDoc(collection(firestore, 'tasks'), payload);
  return docRef.id;
};

export const updateTask = async (taskId: string, data: Partial<Task>): Promise<void> => {
  const docRef = doc(firestore, 'tasks', taskId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const docRef = doc(firestore, 'tasks', taskId);
  await deleteDoc(docRef);
};

export const subscribeToTasks = (userId: string, callback: (tasks: Task[]) => void): Unsubscribe => {
  const q = query(
    collection(firestore, 'tasks'),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task));
    callback(tasks);
  });
};
