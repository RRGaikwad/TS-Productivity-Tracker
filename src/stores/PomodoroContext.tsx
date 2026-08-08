import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/db';
import { queueSyncOperation } from '../services/indexeddb/sync';
import { Timestamp } from 'firebase/firestore';
import type { PomodoroSession, SessionType } from '../types';

interface PomodoroContextType {
  mode: SessionType;
  state: 'idle' | 'running' | 'paused';
  timeLeft: number; // in seconds
  selectedTaskId: string | null;
  workDuration: number; // mins
  shortBreakDuration: number; // mins
  longBreakDuration: number; // mins
  completedSessionsCount: number;
  setSelectedTaskId: (id: string | null) => void;
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resumePomodoro: () => void;
  resetPomodoro: () => void;
  skipSession: () => void;
  updateSettings: (settings: { workDuration?: number; shortBreakDuration?: number; longBreakDuration?: number }) => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<SessionType>('work');
  const [state, setState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  const getDurationForMode = (m: SessionType) => {
    switch (m) {
      case 'work':
        return workDuration * 60;
      case 'short_break':
        return shortBreakDuration * 60;
      case 'long_break':
        return longBreakDuration * 60;
    }
  };

  // Sync initial timer when mode or settings change while idle
  useEffect(() => {
    if (state === 'idle') {
      setTimeLeft(getDurationForMode(mode));
    }
  }, [mode, workDuration, shortBreakDuration, longBreakDuration]);

  // Countdown timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === 'running' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (state === 'running' && timeLeft === 0) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [state, timeLeft]);

  const handleSessionComplete = async () => {
    setState('idle');
    const now = Timestamp.now();
    const duration = getDurationForMode(mode);

    if (user) {
      // Save Pomodoro Session
      const session: PomodoroSession = {
        id: `pomo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ownerId: user.uid,
        taskId: selectedTaskId || undefined,
        type: mode,
        startTime: new Timestamp(now.seconds - duration, now.nanoseconds),
        durationSeconds: duration,
        completed: true,
        createdAt: now,
      };

      await db.pomodoroSessions.put(session);
      await queueSyncOperation('pomodoroSessions', 'create', session.id, session);

      // If tied to task, also record timeEntry
      if (selectedTaskId && mode === 'work') {
        const task = await db.tasks.get(selectedTaskId);
        if (task) {
          const entry = {
            id: `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ownerId: user.uid,
            taskId: selectedTaskId,
            projectId: task.projectId,
            startTime: session.startTime,
            endTime: now,
            durationSeconds: duration,
            source: 'timer' as const,
            notes: 'Pomodoro session',
            createdAt: now,
            updatedAt: now,
          };
          await db.timeEntries.put(entry);
          await queueSyncOperation('timeEntries', 'create', entry.id, entry);
        }
      }
    }

    // Switch mode
    if (mode === 'work') {
      const nextCount = completedSessionsCount + 1;
      setCompletedSessionsCount(nextCount);
      if (nextCount % 4 === 0) {
        setMode('long_break');
      } else {
        setMode('short_break');
      }
    } else {
      setMode('work');
    }
  };

  const startPomodoro = () => setState('running');
  const pausePomodoro = () => setState('paused');
  const resumePomodoro = () => setState('running');
  const resetPomodoro = () => {
    setState('idle');
    setTimeLeft(getDurationForMode(mode));
  };

  const skipSession = () => {
    setState('idle');
    if (mode === 'work') {
      setMode('short_break');
    } else {
      setMode('work');
    }
  };

  const updateSettings = (settings: { workDuration?: number; shortBreakDuration?: number; longBreakDuration?: number }) => {
    if (settings.workDuration) setWorkDuration(settings.workDuration);
    if (settings.shortBreakDuration) setShortBreakDuration(settings.shortBreakDuration);
    if (settings.longBreakDuration) setLongBreakDuration(settings.longBreakDuration);
  };

  return (
    <PomodoroContext.Provider
      value={{
        mode,
        state,
        timeLeft,
        selectedTaskId,
        workDuration,
        shortBreakDuration,
        longBreakDuration,
        completedSessionsCount,
        setSelectedTaskId,
        startPomodoro,
        pausePomodoro,
        resumePomodoro,
        resetPomodoro,
        skipSession,
        updateSettings,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
