import { useState } from 'react';
import { useAuth } from '../../../stores/AuthContext';
import { useGoals } from '../../../stores/GoalContext';
import { useTasks } from '../../../stores/TaskContext';
import { usePro } from '../../../hooks/usePro';
import { UpgradeModal } from '../../../components/common';
import type { Goal } from '../../../types';

const GOAL_COLORS = [
  { name: 'Indigo', hex: '#6366f1', bg: 'bg-indigo-500' },
  { name: 'Emerald', hex: '#10b981', bg: 'bg-emerald-500' },
  { name: 'Amber', hex: '#f59e0b', bg: 'bg-amber-500' },
  { name: 'Rose', hex: '#f43f5e', bg: 'bg-rose-500' },
  { name: 'Sky', hex: '#0ea5e9', bg: 'bg-sky-500' },
  { name: 'Purple', hex: '#a855f7', bg: 'bg-purple-500' },
];

export const GoalsManager = () => {
  const { user } = useAuth();
  const { goals, addGoal, removeGoal, editGoal } = useGoals();
  const { tasks } = useTasks();
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0].hex);
  const { isPro } = usePro();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    await addGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      color: selectedColor,
      targetDate: targetDate ? ({ seconds: Math.floor(new Date(targetDate).getTime() / 1000), nanoseconds: 0 } as any) : undefined,
    });

    setTitle('');
    setDescription('');
    setTargetDate('');
    setSelectedColor(GOAL_COLORS[0].hex);
    setShowAddModal(false);
  };

  // Archive helper kept for future edit settings
  const handleArchiveGoal = async (goal: Goal) => {
    await editGoal(goal.id, { archived: true });
  };
  console.log('Archive helper loaded:', handleArchiveGoal);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Goals & Milestones</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Track high-level goals and link tasks to them.</p>
        </div>
        <button
          onClick={() => {
            if (!isPro && goals.length >= 5) {
              setShowUpgradeModal(true);
            } else {
              setShowAddModal(true);
            }
          }}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-sm"
        >
          + Create Goal
        </button>
      </div>

      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            // Find connected tasks
            const connectedTasks = tasks.filter((t) => t.goalId === goal.id);
            const completedTasks = connectedTasks.filter((t) => t.status === 'done');
            const calculatedProgress = connectedTasks.length > 0
              ? Math.round((completedTasks.length / connectedTasks.length) * 100)
              : goal.progress || 0;

            const goalColor = goal.color || '#6366f1';

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden transition-colors"
              >
                {/* Accent side bar */}
                <div
                  className="absolute top-0 left-0 bottom-0 w-1.5"
                  style={{ backgroundColor: goalColor }}
                />

                <div className="flex items-start justify-between pl-2">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{goal.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="text-gray-400 hover:text-red-500 p-1 text-xs"
                    title="Delete Goal"
                  >
                    ✕
                  </button>
                </div>

                {/* Progress bar */}
                <div className="pl-2 space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-500 dark:text-gray-400">
                      {completedTasks.length} of {connectedTasks.length} task(s) completed
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{calculatedProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${calculatedProgress}%`, backgroundColor: goalColor }}
                    />
                  </div>
                </div>

                {/* Connected tasks list snippet */}
                {connectedTasks.length > 0 && (
                  <div className="pl-2 pt-2 border-t border-gray-100 dark:border-slate-800/80">
                    <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Linked Tasks</p>
                    <div className="space-y-1">
                      {connectedTasks.slice(0, 3).map((t) => (
                        <div key={t.id} className="flex items-center gap-2 text-xs">
                          <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'done' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                          <span className={`truncate ${t.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                            {t.title}
                          </span>
                        </div>
                      ))}
                      {connectedTasks.length > 3 && (
                        <p className="text-[10px] text-gray-400 italic pl-3">
                          +{connectedTasks.length - 3} more task(s)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto text-xl">
            🎯
          </div>
          <h3 className="font-bold text-gray-800 dark:text-white">No active goals yet</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Create goals to group your tasks into clear objectives and monitor your progress over time.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            + Create First Goal
          </button>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Create New Goal</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Launch Product Redesign"
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Optional details about this goal..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Color Tag
                </label>
                <div className="flex items-center gap-2">
                  {GOAL_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setSelectedColor(c.hex)}
                      className={`w-7 h-7 rounded-full transition-transform ${c.bg} ${
                        selectedColor === c.hex ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Goal Tracking"
      />
    </div>
  );
};
