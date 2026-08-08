import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type TimerState = 'idle' | 'running' | 'paused';

interface TimerContextType {
  state: TimerState;
  taskId: string | null;
  elapsedSeconds: number;
  startTimer: (taskId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<TimerState>('idle');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Load persisted timer state on mount
  useEffect(() => {
    const saved = localStorage.getItem('timerState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.state === 'running' && parsed.startTime) {
          const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
          setElapsedSeconds(elapsed);
          setStartTime(parsed.startTime);
          setTaskId(parsed.taskId);
          setState('running');
        } else if (parsed.state === 'paused') {
          setElapsedSeconds(parsed.elapsedSeconds);
          setTaskId(parsed.taskId);
          setState('paused');
        }
      } catch (e) {
        console.error('Failed to load timer state:', e);
      }
    }
  }, []);

  // Update elapsed time when running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === 'running' && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state, startTime]);

  // Persist timer state
  useEffect(() => {
    const timerState = { state, taskId, elapsedSeconds, startTime };
    localStorage.setItem('timerState', JSON.stringify(timerState));
  }, [state, taskId, elapsedSeconds, startTime]);

  const startTimer = (newTaskId: string) => {
    setTaskId(newTaskId);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setState('running');
  };

  const pauseTimer = () => {
    setState('paused');
    setStartTime(null);
  };

  const resumeTimer = () => {
    setStartTime(Date.now() - elapsedSeconds * 1000);
    setState('running');
  };

  const stopTimer = () => {
    setState('idle');
    setTaskId(null);
    setElapsedSeconds(0);
    setStartTime(null);
  };

  return (
    <TimerContext.Provider
      value={{
        state,
        taskId,
        elapsedSeconds,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
