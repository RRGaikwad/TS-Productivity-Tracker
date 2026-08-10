import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToTasks, createTask, updateTask, deleteTask } from '../services/firebase/firestore';
import { getTasksFromDB, addTaskToDB, updateTaskInDB, deleteTaskFromDB } from '../services/indexeddb';
import { queueSyncOperation } from '../services/indexeddb/sync';
import type { Task } from '../types';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>) => Promise<void>;
  editTask: (id: string, updates: Partial<Task>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Load from IndexedDB first — show data immediately
    getTasksFromDB(user.uid).then((localTasks) => {
      setTasks(localTasks);
      setLoading(false); // unblock UI right away
    }).catch(() => {
      setLoading(false); // still unblock even if IndexedDB fails
    });

    // Subscribe to Firestore — syncs silently in the background
    const unsubscribe = subscribeToTasks(user.uid, (firestoreTasks) => {
      setTasks(firestoreTasks);
    });

    return () => unsubscribe();
  }, [user]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>) => {
    if (!user) return;

    const tempId = `temp-${Date.now()}`;
    const tempTask: any = {
      ...taskData,
      ownerId: user.uid,
      id: tempId,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: Date.now(),
    };

    // Optimistic update
    setTasks((prev) => [tempTask, ...prev]);

    try {
      // Add to IndexedDB (convert dates/timestamps to plain serializable values for Dexie)
      const serializableTask = JSON.parse(JSON.stringify(tempTask));
      await addTaskToDB(serializableTask);

      // Add to Firestore
      const firestoreId = await createTask({ ...taskData, ownerId: user.uid });

      // Update local state with Firestore ID
      setTasks((prev) =>
        prev.map((t: any) => (t.id === tempId ? { ...t, id: firestoreId } : t))
      );

      // Update IndexedDB with Firestore ID
      const updatedSerializable = JSON.parse(JSON.stringify({ ...tempTask, id: firestoreId }));
      await updateTaskInDB(tempId, { id: firestoreId });
      await deleteTaskFromDB(tempId);
      await addTaskToDB(updatedSerializable);
    } catch (error) {
      console.error('Failed to add task:', error);
      // Revert on error
      setTasks((prev) => prev.filter((t: any) => t.id !== tempId));
      await deleteTaskFromDB(tempId);
    }
  };

  const editTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return;

    const task = tasks.find((t) => t.id === id);
    const isCompleting = updates.status === 'done' && task?.status !== 'done';

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));

    // Handle recurring tasks
    if (isCompleting && task?.recurrenceRule) {
      let nextDueDate = task.dueDate ? new Date(task.dueDate.seconds * 1000) : new Date();
      if (task.recurrenceRule === 'daily') {
        nextDueDate.setDate(nextDueDate.getDate() + 1);
      } else if (task.recurrenceRule === 'weekly') {
        nextDueDate.setDate(nextDueDate.getDate() + 7);
      } else if (task.recurrenceRule === 'monthly') {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }

      const { id: _oldId, createdAt: _oldCreatedAt, updatedAt: _oldUpdatedAt, ...baseTask } = task as any;
      await addTask({
        ...baseTask,
        status: 'todo',
        dueDate: { seconds: Math.floor(nextDueDate.getTime() / 1000), nanoseconds: 0 } as any,
      });
    }

    try {
      // Update IndexedDB
      await updateTaskInDB(id, updates);

      // Update Firestore
      await updateTask(id, updates);

      // Queue sync operation
      await queueSyncOperation('tasks', 'update', id, updates);
    } catch (error) {
      console.error('Failed to update task:', error);
      // Revert on error
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...(updates as any) } : t)));
    }
  };

  const removeTask = async (id: string) => {
    if (!user) return;

    const taskToDelete = tasks.find((t) => t.id === id);

    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      // Delete from IndexedDB
      await deleteTaskFromDB(id);

      // Delete from Firestore
      await deleteTask(id);

      // Queue sync operation
      await queueSyncOperation('tasks', 'delete', id, { id });
    } catch (error) {
      console.error('Failed to delete task:', error);
      // Revert on error
      if (taskToDelete) {
        setTasks((prev) => [...prev, taskToDelete]);
      }
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, loading, addTask, editTask, removeTask }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
