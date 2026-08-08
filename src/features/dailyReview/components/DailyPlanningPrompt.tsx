import { useState } from 'react';
import { useTasks } from '../../../stores/TaskContext';

export const DailyPlanningPrompt = () => {
  const { tasks } = useTasks();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const todoTasks = tasks.filter((t) => t.status === 'todo');

  return (
    <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 text-indigo-300 hover:text-white text-sm"
      >
        ✕
      </button>

      <div className="max-w-xl">
        <span className="text-xs font-bold uppercase tracking-wider bg-indigo-800 text-indigo-200 px-2.5 py-1 rounded-md">
          ☀️ Daily Focus Plan
        </span>
        <h3 className="text-xl font-extrabold mt-3">What are your top priorities today?</h3>
        <p className="text-xs text-indigo-200 mt-1">
          Setting 1-3 core objectives each morning increases task completion rate by 40%.
        </p>

        {todoTasks.length > 0 ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-indigo-300 font-medium">Pending Tasks for Today:</p>
            <div className="flex flex-wrap gap-2">
              {todoTasks.slice(0, 4).map((t) => (
                <span key={t.id} className="text-xs bg-indigo-800/80 px-3 py-1.5 rounded-lg border border-indigo-700/50">
                  {t.title}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-indigo-300 mt-4">You currently have no pending todo tasks!</p>
        )}
      </div>
    </div>
  );
};
