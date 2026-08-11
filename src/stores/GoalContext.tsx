import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/db';
import { queueSyncOperation } from '../services/indexeddb/sync';
import { subscribeToGoals, createGoal, updateGoal, deleteGoal } from '../services/firebase/firestore';
import type { Goal } from '../types';

interface GoalContextType {
  goals: Goal[];
  loading: boolean;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'progress' | 'archived'>) => Promise<void>;
  editGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Load from IndexedDB first (instant UI update)
    db.goals
      .where('ownerId')
      .equals(user.uid)
      .toArray()
      .then((localGoals) => {
        setGoals(localGoals.filter((g) => !g.archived));
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // 2. Subscribe to Firestore in background for persistent sync
    const unsubscribe = subscribeToGoals(user.uid, (firestoreGoals) => {
      setGoals(firestoreGoals.filter((g) => !g.archived));
      // Save all fetched goals to IndexedDB cache
      firestoreGoals.forEach((g) => {
        db.goals.put(g).catch(() => {});
      });
    });

    return () => unsubscribe();
  }, [user]);

  const addGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'progress' | 'archived'>) => {
    if (!user) return;

    const tempId = `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newGoal: Goal = {
      ...goalData,
      id: tempId,
      ownerId: user.uid,
      progress: 0,
      archived: false,
      createdAt: new Date().toISOString() as any,
      updatedAt: new Date().toISOString() as any,
    };

    // Optimistic state update
    setGoals((prev) => [...prev, newGoal]);

    // Local IndexedDB update
    try {
      await db.goals.put(newGoal);
    } catch (err) {
      console.warn('IndexedDB goal add warning:', err);
    }

    // Remote Firestore write
    try {
      const cleanData: any = {};
      Object.entries(goalData).forEach(([k, v]) => {
        if (v !== undefined) cleanData[k] = v;
      });

      const firestoreId = await createGoal({
        ...cleanData,
        ownerId: user.uid,
        progress: 0,
        archived: false,
      });

      // Update ID locally
      setGoals((prev) =>
        prev.map((g) => (g.id === tempId ? { ...g, id: firestoreId } : g))
      );

      await db.goals.delete(tempId);
      await db.goals.put({ ...newGoal, id: firestoreId });
    } catch (error) {
      console.error('Failed to create goal on Firestore (kept locally):', error);
    }
  };

  const editGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return;

    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));

    try {
      const existing = await db.goals.get(id);
      if (existing) {
        const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() as any };
        await db.goals.put(updated);
      }
      await updateGoal(id, updates);
      await queueSyncOperation('goals', 'update', id, updates);
    } catch (err) {
      console.error('Failed to update goal:', err);
    }
  };

  const removeGoal = async (id: string) => {
    if (!user) return;

    setGoals((prev) => prev.filter((g) => g.id !== id));

    try {
      await db.goals.delete(id);
      await deleteGoal(id);
      await queueSyncOperation('goals', 'delete', id, { id });
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  return (
    <GoalContext.Provider value={{ goals, loading, addGoal, editGoal, removeGoal }}>
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
};
