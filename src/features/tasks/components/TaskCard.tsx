import { useState } from 'react';
import { useTasks } from '../../../stores/TaskContext';
import { useProjects } from '../../../stores/ProjectContext';
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
  const { projects } = useProjects();
  const { totalSeconds, formattedTotal } = useTaskTime(task.id);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogTime, setShowLogTime] = useState(false);

  const project = projects.find((p) => p.id === task.projectId);
  const dueDateObj = safeToDate(task.dueDate);
  const isTaskOverdue = dueDateObj ? isOverdue(dueDateObj) : false;

  const handleStatusChange = async (newStatus: string) => {
    await editTask(task.id, { status: newStatus as any });
  };

  const handleDelete = async () => {
    await removeTask(task.id);
    setShowDeleteConfirm(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow p-4 border-2 border-blue-500">
        <div className="text-sm text-gray-600 mb-2">Edit task (simplified)</div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className={`font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            {project && (
              <div className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="text-xs text-gray-500">{project.name}</span>
              </div>
            )}
            {totalSeconds > 0 && (
              <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                ⏱ {formattedTotal}
              </span>
            )}
          </div>
        </div>
        <TaskPriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <TimerButton task={task} />
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          {dueDateObj && (
            <span className={`text-xs ${isTaskOverdue ? 'text-red-600' : 'text-gray-500'}`}>
              <span className="hidden sm:inline">Due: </span>
              {formatDate(dueDateObj)}
            </span>
          )}
        </div>

        <div className="flex gap-1 items-center">
          <button
            onClick={() => setShowLogTime(!showLogTime)}
            className="text-gray-400 hover:text-blue-600 p-1 text-xs flex items-center gap-0.5"
            title="Log manual time"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-gray-400 hover:text-red-600 p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {showLogTime && (
        <ManualTimeEntry task={task} onClose={() => setShowLogTime(false)} />
      )}

      {showDeleteConfirm && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm text-gray-600 mb-2">Delete this task?</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
