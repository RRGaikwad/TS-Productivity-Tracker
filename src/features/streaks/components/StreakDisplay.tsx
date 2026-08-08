import { useTasks } from '../../../stores/TaskContext';
import { calculateStreak } from '../../../utils/streak';

export const StreakDisplay = () => {
  const { tasks } = useTasks();
  const streak = calculateStreak(tasks);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md">
          🔥
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold text-amber-950">{streak.currentStreak} Day Streak!</h3>
            {streak.freezesRemaining > 0 && (
              <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-medium">
                ❄️ {streak.freezesRemaining} Freezes left
              </span>
            )}
          </div>
          <p className="text-xs text-amber-800 mt-0.5">
            {streak.currentStreak > 0
              ? 'Awesome momentum! Keep completing tasks daily.'
              : "Don't worry — finish a task today to jumpstart your streak!"}
          </p>
        </div>
      </div>

      <div className="text-right hidden sm:block">
        <p className="text-xs text-amber-700 font-medium">Best Streak</p>
        <p className="text-lg font-bold text-amber-900">{streak.longestStreak} Days</p>
      </div>
    </div>
  );
};
