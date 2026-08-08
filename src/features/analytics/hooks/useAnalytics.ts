import { useState, useEffect } from 'react';
import { db } from '../../../lib/db';
import { useAuth } from '../../../stores/AuthContext';
import { useProjects } from '../../../stores/ProjectContext';
import type { Task, TimeEntry, PomodoroSession } from '../../../types';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export type DateRangeDays = 7 | 14 | 30;

export const useAnalytics = (days: DateRangeDays = 7) => {
  const { user } = useAuth();
  const { projects } = useProjects();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [pomoSessions, setPomoSessions] = useState<PomodoroSession[]>([]);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setTimeEntries([]);
      setPomoSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      db.tasks.where('ownerId').equals(user.uid).toArray(),
      db.timeEntries.where('ownerId').equals(user.uid).toArray(),
      db.pomodoroSessions.where('ownerId').equals(user.uid).toArray(),
    ])
      .then(([allTasks, allTime, allPomo]) => {
        setTasks(allTasks);
        setTimeEntries(allTime);
        setPomoSessions(allPomo);
      })
      .catch((err) => console.error('Error fetching analytics data:', err))
      .finally(() => setLoading(false));
  }, [user, days]);

  // Summary Metrics
  const completedTasks = tasks.filter((t) => t.status === 'done');
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;

  const totalTimeSpentSeconds = timeEntries.reduce(
    (acc: number, entry: TimeEntry) => acc + (entry.durationSeconds || 0),
    0
  );

  // Tasks Completed Trend
  const tasksCompletedTrend = Array.from({ length: days }).map((_, idx) => {
    const d = subDays(new Date(), days - 1 - idx);
    const dayStr = format(d, 'MMM dd');
    const dayStart = startOfDay(d).getTime();
    const dayEnd = endOfDay(d).getTime();

    const count = completedTasks.filter((t) => {
      if (!t.updatedAt) return false;
      const tTime = typeof t.updatedAt === 'object' && 'seconds' in t.updatedAt ? t.updatedAt.seconds * 1000 : 0;
      return tTime >= dayStart && tTime <= dayEnd;
    }).length;

    return { date: dayStr, count };
  });

  // Time Spent by Project
  const timeByProject = projects.map((p) => {
    const pEntries = timeEntries.filter((e) => e.projectId === p.id);
    const seconds = pEntries.reduce((acc: number, e: TimeEntry) => acc + (e.durationSeconds || 0), 0);
    return {
      projectName: p.name,
      color: p.color || '#3B82F6',
      hours: Number((seconds / 3600).toFixed(1)),
    };
  }).filter((p) => p.hours > 0);

  // Time Spent by Day
  const timeByDay = Array.from({ length: days }).map((_, idx) => {
    const d = subDays(new Date(), days - 1 - idx);
    const dayStr = format(d, 'MMM dd');
    const dayStart = startOfDay(d).getTime();
    const dayEnd = endOfDay(d).getTime();

    const dayEntries = timeEntries.filter((e) => {
      if (!e.startTime) return false;
      const eTime = typeof e.startTime === 'object' && 'seconds' in e.startTime ? e.startTime.seconds * 1000 : 0;
      return eTime >= dayStart && eTime <= dayEnd;
    });

    const seconds = dayEntries.reduce((acc: number, e: TimeEntry) => acc + (e.durationSeconds || 0), 0);
    return { date: dayStr, hours: Number((seconds / 3600).toFixed(1)) };
  });

  return {
    loading,
    summary: {
      tasksCompleted: completedTasks.length,
      totalTimeSpentSeconds,
      pomodoroSessionsCount: pomoSessions.filter((s) => s.completed).length,
      completionRatePercentage: completionRate,
    },
    tasksCompletedTrend,
    timeByProject,
    timeByDay,
  };
};
