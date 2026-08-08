import { useTimer } from '../../../stores/TimerContext';
import { formatDuration } from '../../../lib/utils';

export const TimerDisplay = () => {
  const { state, elapsedSeconds } = useTimer();

  if (state === 'idle') return null;

  return (
    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
      <span className="font-mono text-sm font-medium">
        {formatDuration(elapsedSeconds)}
      </span>
    </div>
  );
};
