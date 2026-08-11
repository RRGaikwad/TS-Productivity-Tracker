import { useState, useMemo } from 'react';
import { useTasks } from '../../../stores/TaskContext';
import { useGoals } from '../../../stores/GoalContext';
import { TaskForm } from './TaskForm';
import { TaskCard } from './TaskCard';
import { QuickAddBar } from './QuickAddBar';
import { KanbanView } from '../views/KanbanView';
import { CalendarView } from '../views/CalendarView';
import { EmptyState, SkeletonList } from '../../../components/common';
import { PRIORITIES, STATUSES } from '../../../lib/constants';
import type { TaskPriority, TaskStatus } from '../../../types';

export const TaskList = () => {
  const { tasks, loading } = useTasks();
  const { goals } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');
  const [filterGoal, setFilterGoal] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('createdAt');

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by Goal
    if (filterGoal) {
      filtered = filtered.filter((task) => task.goalId === filterGoal);
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }

    // Filter by priority
    if (filterPriority) {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Helper to extract timestamp ms safely
    const getTimestamp = (val: any) => {
      if (!val) return 0;
      if (val instanceof Date) return val.getTime();
      if (typeof val === 'object' && typeof val.seconds === 'number') return val.seconds * 1000;
      if (typeof val === 'string' || typeof val === 'number') return new Date(val).getTime() || 0;
      return 0;
    };

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'dueDate') {
        const aDue = getTimestamp(a.dueDate);
        const bDue = getTimestamp(b.dueDate);
        if (!aDue && !bDue) return 0;
        if (!aDue) return 1;
        if (!bDue) return -1;
        return aDue - bDue;
      }
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // createdAt
      const aTime = getTimestamp(a.createdAt);
      const bTime = getTimestamp(b.createdAt);
      return bTime - aTime;
    });

    return filtered;
  }, [tasks, filterGoal, filterStatus, filterPriority, searchQuery, sortBy]);

  const clearFilters = () => {
    setFilterGoal('');
    setFilterStatus('');
    setFilterPriority('');
    setSearchQuery('');
  };

  const hasActiveFilters = filterGoal || filterStatus || filterPriority || searchQuery;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-9 w-24 bg-gray-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="h-28 bg-gray-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <QuickAddBar />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tasks</h2>
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white dark:bg-slate-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'kanban' ? 'bg-white dark:bg-slate-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'calendar' ? 'bg-white dark:bg-slate-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
        >
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Goal</label>
            <select
              value={filterGoal}
              onChange={(e) => setFilterGoal(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Goals</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  🎯 {goal.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TaskStatus | '')}
              className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {Object.values(STATUSES).map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as TaskPriority | '')}
              className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              {Object.values(PRIORITIES).map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'createdAt')}
              className="px-3 py-1 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Created Date</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
          <TaskForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {filteredAndSortedTasks.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No matching tasks' : 'No tasks yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your filters or search query.'
              : 'Create your first task to get started tracking your productivity.'
          }
          action={
            !hasActiveFilters && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Create Task
              </button>
            )
          }
        />
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          <p className="text-xs text-gray-400 font-medium">{filteredAndSortedTasks.length} task(s)</p>
          {filteredAndSortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanView />
      ) : (
        <CalendarView />
      )}
    </div>
  );
};
