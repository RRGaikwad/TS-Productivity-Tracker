import { useState } from 'react';
import { useTasks } from '../../../stores/TaskContext';
import { useGoals } from '../../../stores/GoalContext';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TimerButton } from '../../timeTracking/components/TimerButton';
import { ManualTimeEntry } from '../../timeTracking/components/ManualTimeEntry';
import { useTaskTime } from '../../timeTracking/hooks/useTimeEntries';
import { formatDate, isOverdue } from '../../../lib/utils';
import type { Task } from '../../../types';

interface TaskCardProps {
  task: Task;
}

function safeToDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'object' && typeof val.seconds === 'number') {
    return new Date(val.seconds * 1000);
  }
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export const TaskCard = ({ task }: TaskCardProps) => {
  const { editTask, removeTask } = useTasks();
  const { goals } = useGoals();
  const { totalSeconds, formattedTotal } = useTaskTime(task.id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogTime, setShowLogTime] = useState(false);

  const goal = goals.find((g) => g.id === task.goalId);
  const dueDateObj = safeToDate(task.dueDate);
  const isTaskOverdue = dueDateObj ? isOverdue(dueDateObj) : false;

  const handleStatusChange = async (newStatus: string) => {
    await editTask(task.id, { status: newStatus as any });
  };

  const handleDelete = async () => {
    await removeTask(task.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className={`font-semibold text-sm ${task.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {goal && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/50 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" style={{ backgroundColor: goal.color }} />
                <span>🎯 {goal.title}</span>
              </div>
            )}
            {totalSeconds > 0 && (
              <span className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md">
                ⏱ {formattedTotal}
              </span>
            )}
          </div>
        </div>
        <TaskPriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <TimerButton task={task} />
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs px-2 py-1 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none"
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          {dueDateObj && (
            <span className={`text-xs font-medium ${isTaskOverdue ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <span className="hidden sm:inline">Due: </span>
              {formatDate(dueDateObj)}
            </span>
          )}
        </div>

        <div className="flex gap-1 items-center">
          <button
            onClick={() => setShowLogTime(!showLogTime)}
            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 text-xs"
            title="Log time"
          >
            ⏱
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1 text-xs"
            title="Delete task"
          >
            🗑
          </button>
        </div>
      </div>

      {showLogTime && (
        <ManualTimeEntry task={task} onClose={() => setShowLogTime(false)} />
      )}

      {showDeleteConfirm && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Delete this task?</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 font-semibold"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
