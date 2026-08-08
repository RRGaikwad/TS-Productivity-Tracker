import { useState, useEffect } from 'react';
import { db } from '../../../lib/db';
import { useAuth } from '../../../stores/AuthContext';
import { useProjects } from '../../../stores/ProjectContext';
import { queueSyncOperation } from '../../../services/indexeddb/sync';
import { Timestamp } from 'firebase/firestore';
import { usePro } from '../../../hooks/usePro';
import { UpgradeModal } from '../../../components/common';
import type { Goal } from '../../../types';

export const GoalsManager = () => {
  const { user } = useAuth();
  const { projects } = useProjects();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const { isPro } = usePro();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      return;
    }
    db.goals
      .where('ownerId')
      .equals(user.uid)
      .toArray()
      .then((data) => setGoals(data.filter((g) => !g.archived)))
      .catch((err) => console.error('Error fetching goals:', err));
  }, [user]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    const now = Timestamp.now();
    const newGoal: Goal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ownerId: user.uid,
      title: title.trim(),
      targetDate: targetDate ? Timestamp.fromDate(new Date(targetDate)) : undefined,
      linkedProjectIds: selectedProjectId ? [selectedProjectId] : [],
      progress: 0,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.goals.put(newGoal);
    await queueSyncOperation('goals', 'create', newGoal.id, newGoal);

    setGoals((prev) => [...prev, newGoal]);
    setTitle('');
    setDescription('');
    setTargetDate('');
    setSelectedProjectId('');
    setShowAddModal(false);
  };

  const handleToggleArchive = async (goal: Goal) => {
    const updated = { ...goal, archived: true, updatedAt: Timestamp.now() };
    await db.goals.put(updated);
    await queueSyncOperation('goals', 'update', goal.id, updated);
    setGoals((prev) => prev.filter((g) => g.id !== goal.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Goals & Key Milestones</h2>
          <p className="text-xs text-gray-500">Track high-level goals and link them to projects.</p>
        </div>
        <button
          onClick={() => {
            if (!isPro && goals.length >= 1) {
              setShowUpgradeModal(true);
            } else {
              setShowAddModal(true);
            }
          }}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          + Create Goal
        </button>
      </div>

      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const project = projects.find((p) => goal.linkedProjectIds?.includes(p.id));
            return (
              <div key={goal.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                  </div>
                  <button
                    onClick={() => handleToggleArchive(goal)}
                    className="text-gray-300 hover:text-gray-500 text-xs"
                    title="Archive Goal"
                  >
                    ✕
                  </button>
                </div>

                {project && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                    <span className="text-xs text-gray-500 font-medium">{project.name}</span>
                  </div>
                )}

                <div className="pt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span className="font-semibold text-indigo-600">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-xs">
          No active goals set yet. Click "+ Create Goal" to define your objectives.
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateGoal} className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-gray-900">Create New Goal</h3>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Goal Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Launch v1 Product"
                className="w-full text-xs p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details or key outcome..."
                className="w-full text-xs p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Linked Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">None</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700"
              >
                Create Goal
              </button>
            </div>
          </form>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Unlimited Goals"
      />
    </div>
  );
};
