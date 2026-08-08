import { useTimer } from '../../../stores/TimerContext';
import type { Task } from '../../../types';

interface TimerButtonProps {
  task: Task;
}

export const TimerButton = ({ task }: TimerButtonProps) => {
  const { state, taskId, startTimer, pauseTimer, resumeTimer, stopTimer } = useTimer();

  const isTaskActive = taskId === task.id;
  const isRunning = state === 'running' && isTaskActive;
  const isPaused = state === 'paused' && isTaskActive;

  const handleStart = () => {
    if (isTaskActive) {
      if (isRunning) {
        pauseTimer();
      } else if (isPaused) {
        resumeTimer();
      }
    } else {
      startTimer(task.id);
    }
  };

  const handleStop = () => {
    stopTimer();
  };

  if (!isTaskActive) {
    return (
      <button
        onClick={handleStart}
        className="flex items-center gap-1 text-gray-400 hover:text-blue-500 transition-colors"
        title="Start timer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleStart}
        className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
        title={isRunning ? 'Pause' : 'Resume'}
      >
        {isRunning ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>
      <button
        onClick={handleStop}
        className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
        title="Stop timer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
      </button>
    </div>
  );
};
