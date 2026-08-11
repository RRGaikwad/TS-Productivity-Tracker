import { useState } from 'react';
import { useTasks } from '../../../stores/TaskContext';
import { useGoals } from '../../../stores/GoalContext';
import { PRIORITIES, STATUSES, RECURRENCE_RULES } from '../../../lib/constants';
import type { TaskPriority, TaskStatus, RecurrenceRule } from '../../../types';

interface TaskFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultGoalId?: string;
}

export const TaskForm = ({ onSuccess, onCancel, defaultGoalId }: TaskFormProps) => {
  const { addTask } = useTasks();
  const { goals } = useGoals();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalId, setGoalId] = useState(defaultGoalId || '');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addTask({
        goalId: goalId || undefined,
        title,
        description: description.trim() || undefined,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        recurrenceRule,
        reminderEnabled: false,
        order: Date.now(),
      } as any);

      setTitle('');
      setDescription('');
      setGoalId('');
      setPriority('medium');
      setStatus('todo');
      setDueDate('');
      setRecurrenceRule(undefined);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="taskTitle" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Title *
        </label>
        <input
          id="taskTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Task title"
        />
      </div>

      <div>
        <label htmlFor="taskDescription" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="taskDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add a description..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="taskGoal" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Linked Goal
          </label>
          <select
            id="taskGoal"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No Goal (General)</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                🎯 {goal.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="taskPriority" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            id="taskPriority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(PRIORITIES).map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="taskStatus" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            id="taskStatus"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(STATUSES).map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="taskDueDate" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <input
            id="taskDueDate"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="taskRecurrence" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Recurrence
        </label>
        <select
          id="taskRecurrence"
          value={recurrenceRule || ''}
          onChange={(e) => setRecurrenceRule((e.target.value || undefined) as RecurrenceRule | undefined)}
          className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">None</option>
          {Object.values(RECURRENCE_RULES).map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading || !title}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-xl text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 transition-all shadow-sm"
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-xl text-xs font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
