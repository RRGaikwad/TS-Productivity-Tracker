import { useState } from 'react';
import { useAuth } from '../../../stores/AuthContext';
import { db } from '../../../lib/db';
import { queueSyncOperation } from '../../../services/indexeddb/sync';
import { Timestamp } from 'firebase/firestore';
import type { Task } from '../../../types';

interface ManualTimeEntryProps {
  task: Task;
  onClose?: () => void;
}

export const ManualTimeEntry = ({ task, onClose }: ManualTimeEntryProps) => {
  const { user } = useAuth();
  const [minutes, setMinutes] = useState<number>(30);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || minutes <= 0) return;

    setIsSubmitting(true);
    try {
      const now = Timestamp.now();
      const durationSeconds = minutes * 60;
      const startTime = new Timestamp(now.seconds - durationSeconds, now.nanoseconds);

      const entry = {
        id: `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ownerId: user.uid,
        taskId: task.id,
        projectId: task.projectId,
        startTime,
        endTime: now,
        durationSeconds,
        source: 'manual' as const,
        notes: notes.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };

      await db.timeEntries.put(entry);

      // Queue sync operation
      await queueSyncOperation('timeEntries', 'create', entry.id, entry);

      setMinutes(30);
      setNotes('');
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to save manual time entry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Log Time Manually</h4>
        {onClose && (
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs">
            ✕
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Duration (mins)</label>
          <input
            type="number"
            min="1"
            max="1440"
            value={minutes}
            onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-full text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex-[2]">
          <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
          <input
            type="text"
            placeholder="What did you work on?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-1 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Add Time'}
        </button>
      </div>
    </form>
  );
};
