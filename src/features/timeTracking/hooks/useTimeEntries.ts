import { useState, useEffect } from 'react';
import { db } from '../../../lib/db';
import { useAuth } from '../../../stores/AuthContext';
import { formatDuration } from '../../../lib/utils';
import type { TimeEntry } from '../../../types';

export const useTaskTime = (taskId: string) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    if (!user || !taskId) {
      setEntries([]);
      return;
    }

    db.timeEntries
      .where('taskId')
      .equals(taskId)
      .toArray()
      .then((data) => setEntries(data))
      .catch((err) => console.error('Error fetching task time entries:', err));
  }, [user, taskId]);

  const totalSeconds = entries.reduce((acc: number, entry: TimeEntry) => acc + (entry.durationSeconds || 0), 0);

  return {
    entries,
    totalSeconds,
    formattedTotal: formatDuration(totalSeconds),
  };
};

export const useProjectTime = (projectId: string) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    if (!user || !projectId) {
      setEntries([]);
      return;
    }

    db.timeEntries
      .where('projectId')
      .equals(projectId)
      .toArray()
      .then((data) => setEntries(data))
      .catch((err) => console.error('Error fetching project time entries:', err));
  }, [user, projectId]);

  const totalSeconds = entries.reduce((acc: number, entry: TimeEntry) => acc + (entry.durationSeconds || 0), 0);

  return {
    entries,
    totalSeconds,
    formattedTotal: formatDuration(totalSeconds),
  };
};
