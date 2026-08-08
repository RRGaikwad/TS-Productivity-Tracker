import { useState, useEffect } from 'react';
import { usePomodoro } from '../../../stores/PomodoroContext';
import { useTasks } from '../../../stores/TaskContext';
import { formatDuration } from '../../../lib/utils';
import { db } from '../../../lib/db';
import { useAuth } from '../../../stores/AuthContext';
import type { PomodoroSession } from '../../../types';

export const PomodoroTimer = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const {
    mode,
    state,
    timeLeft,
    selectedTaskId,
    completedSessionsCount,
    setSelectedTaskId,
    startPomodoro,
    pausePomodoro,
    resumePomodoro,
    resetPomodoro,
    skipSession,
    updateSettings,
    workDuration,
    shortBreakDuration,
    longBreakDuration,
  } = usePomodoro();

  const [showSettings, setShowSettings] = useState(false);
  const [newWork, setNewWork] = useState(workDuration);
  const [newShort, setNewShort] = useState(shortBreakDuration);
  const [newLong, setNewLong] = useState(longBreakDuration);
  const [recentSessions, setRecentSessions] = useState<PomodoroSession[]>([]);

  // Fetch recent Pomodoro history
  useEffect(() => {
    if (!user) {
      setRecentSessions([]);
      return;
    }
    db.pomodoroSessions
      .orderBy('createdAt')
      .reverse()
      .limit(10)
      .toArray()
      .then((sessions) => setRecentSessions(sessions))
      .catch((err) => console.error('Error loading pomodoro sessions:', err));
  }, [user, state]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      workDuration: newWork,
      shortBreakDuration: newShort,
      longBreakDuration: newLong,
    });
    setShowSettings(false);
  };

  const modeTitle = mode === 'work' ? 'Focus Session' : mode === 'short_break' ? 'Short Break' : 'Long Break';
  const modeColor = mode === 'work' ? 'bg-indigo-600' : mode === 'short_break' ? 'bg-emerald-600' : 'bg-amber-600';

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
        {/* Header Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full text-white transition-colors ${modeColor}`}>
            {modeTitle}
          </span>
        </div>

        {/* Task Selection */}
        <div className="mb-6 max-w-sm mx-auto">
          <label className="block text-xs font-medium text-gray-500 mb-1">Target Task (Optional)</label>
          <select
            value={selectedTaskId || ''}
            onChange={(e) => setSelectedTaskId(e.target.value || null)}
            className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
          >
            <option value="">-- Select a task to focus on --</option>
            {tasks
              .filter((t) => t.status !== 'done')
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
          </select>
        </div>

        {/* Timer Display */}
        <div className="my-8">
          <div className="font-mono text-6xl font-extrabold text-gray-900 tracking-tight">
            {formatDuration(timeLeft)}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Completed today: <span className="font-semibold text-gray-700">{completedSessionsCount} sessions</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {state === 'idle' && (
            <button
              onClick={startPomodoro}
              className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-md transition-all transform active:scale-95"
            >
              Start Focus
            </button>
          )}
          {state === 'running' && (
            <button
              onClick={pausePomodoro}
              className="px-8 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 shadow-md transition-all transform active:scale-95"
            >
              Pause
            </button>
          )}
          {state === 'paused' && (
            <button
              onClick={resumePomodoro}
              className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-md transition-all transform active:scale-95"
            >
              Resume
            </button>
          )}

          <button
            onClick={resetPomodoro}
            className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            title="Reset Timer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={skipSession}
            className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            title="Skip Session"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Settings Toggle */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
          >
            ⚙ Settings
          </button>
        </div>

        {/* Timer Settings Form */}
        {showSettings && (
          <form onSubmit={handleSaveSettings} className="mt-4 p-4 bg-gray-50 rounded-xl text-left space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase">Pomodoro Durations (minutes)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Work</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={newWork}
                  onChange={(e) => setNewWork(parseInt(e.target.value) || 1)}
                  className="w-full text-xs p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Short Break</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={newShort}
                  onChange={(e) => setNewShort(parseInt(e.target.value) || 1)}
                  className="w-full text-xs p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Long Break</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={newLong}
                  onChange={(e) => setNewLong(parseInt(e.target.value) || 1)}
                  className="w-full text-xs p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-xs px-3 py-1 bg-white border rounded text-gray-600"
              >
                Cancel
              </button>
              <button type="submit" className="text-xs px-3 py-1 bg-indigo-600 text-white rounded font-medium">
                Save
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Pomodoro History */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Recent Sessions</h3>
        {recentSessions && recentSessions.length > 0 ? (
          <div className="space-y-2">
            {recentSessions.map((s: PomodoroSession) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.type === 'work' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                  <span className="font-medium text-gray-700 capitalize">{s.type.replace('_', ' ')}</span>
                  {s.taskId && (
                    <span className="text-gray-400 truncate max-w-[200px]">
                      • {tasks.find((t) => t.id === s.taskId)?.title || 'Task'}
                    </span>
                  )}
                </div>
                <span className="font-mono text-gray-500">{Math.round(s.durationSeconds / 60)}m</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No completed sessions yet today.</p>
        )}
      </div>
    </div>
  );
};
