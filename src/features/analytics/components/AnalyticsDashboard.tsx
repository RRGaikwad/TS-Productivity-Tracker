import { useState } from 'react';
import { useAnalytics, DateRangeDays } from '../hooks/useAnalytics';
import { formatDuration } from '../../../lib/utils';
import { usePro } from '../../../hooks/usePro';
import { UpgradeModal } from '../../../components/common';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export const AnalyticsDashboard = () => {
  const [days, setDays] = useState<DateRangeDays>(7);
  const { isPro } = usePro();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { loading, summary, tasksCompletedTrend, timeByProject, timeByDay } = useAnalytics(days);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics & Insights</h2>
          <p className="text-xs text-gray-500 mt-1">Track your productivity, task velocity, and focus hours.</p>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          {([7, 14, 30] as DateRangeDays[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                if (!isPro && d !== 7) {
                  setShowUpgradeModal(true);
                } else {
                  setDays(d);
                }
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                days === d ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Tasks</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{summary.tasksCompleted}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Time Tracked</p>
          <p className="text-3xl font-extrabold text-indigo-600 mt-2 font-mono">
            {formatDuration(summary.totalTimeSpentSeconds)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Focus Sessions</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">{summary.pomodoroSessionsCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</p>
          <p className="text-3xl font-extrabold text-amber-500 mt-2">{summary.completionRatePercentage}%</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Completed Trend */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Task Completion Velocity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksCompletedTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Tasks Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Spent by Day */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Daily Focus Hours</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="hours" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} name="Hours" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time by Project */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Time Spent by Project</h3>
          {timeByProject.length > 0 ? (
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeByProject}
                    dataKey="hours"
                    nameKey="projectName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ projectName, hours }) => `${projectName}: ${hours}h`}
                  >
                    {timeByProject.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-gray-400">No time logged for projects in this window.</div>
          )}
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Extended Analytics"
      />
    </div>
  );
};
