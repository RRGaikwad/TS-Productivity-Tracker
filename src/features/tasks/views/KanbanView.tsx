import { useState } from 'react';
import { useTasks } from '../../../stores/TaskContext';
import { TaskCard } from '../components/TaskCard';
import type { TaskStatus } from '../../../types';

export const KanbanView = () => {
  const { tasks, editTask } = useTasks();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'todo', title: 'To Do', color: 'border-amber-400 bg-amber-50/50' },
    { id: 'in_progress', title: 'In Progress', color: 'border-blue-400 bg-blue-50/50' },
    { id: 'done', title: 'Done', color: 'border-emerald-400 bg-emerald-50/50' },
  ];

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: TaskStatus) => {
    if (draggedTaskId) {
      await editTask(draggedTaskId, { status });
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(col.id)}
            className={`rounded-2xl p-4 border-2 min-h-[500px] flex flex-col ${col.color} transition-colors`}
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">{col.title}</h3>
              <span className="text-xs font-semibold bg-white px-2.5 py-0.5 rounded-full border border-gray-200 text-gray-600">
                {colTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  className="cursor-grab active:cursor-grabbing transition-transform"
                >
                  <TaskCard task={task} />
                </div>
              ))}
              {colTasks.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-xs text-gray-400">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
