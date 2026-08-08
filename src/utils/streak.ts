import { isSameDay, subDays } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import type { Task, Streak } from '../types';

export const calculateStreak = (tasks: Task[], currentStreakObj?: Streak): Streak => {
  const completedTasks = tasks.filter((t) => t.status === 'done');
  if (completedTasks.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: currentStreakObj?.longestStreak || 0,
      freezesRemaining: currentStreakObj?.freezesRemaining ?? 2,
      lastActiveDate: null as any,
      freezeResetDate: null as any,
      perProjectStreaks: {},
      updatedAt: Timestamp.now(),
    };
  }

  // Map dates of completed tasks
  const completedDates = completedTasks
    .map((t) => {
      if (!t.updatedAt) return null;
      if (typeof t.updatedAt === 'object' && 'seconds' in t.updatedAt) {
        return new Date(t.updatedAt.seconds * 1000);
      }
      return null;
    })
    .filter(Boolean) as Date[];

  const today = new Date();
  let streak = 0;
  let freezes = currentStreakObj?.freezesRemaining ?? 2;
  let checkDate = today;

  // Check today first
  const completedToday = completedDates.some((d) => isSameDay(d, today));
  if (completedToday) {
    streak += 1;
    checkDate = subDays(today, 1);
  } else {
    // Check yesterday
    checkDate = subDays(today, 1);
  }

  // Iterate backwards
  while (true) {
    const dateToVerify = checkDate;
    const hasActivity = completedDates.some((d) => isSameDay(d, dateToVerify));

    if (hasActivity) {
      streak += 1;
      checkDate = subDays(checkDate, 1);
    } else if (freezes > 0 && streak > 0) {
      // Use freeze for missing day
      freezes -= 1;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  const longestStreak = Math.max(streak, currentStreakObj?.longestStreak || 0);

  return {
    currentStreak: streak,
    longestStreak,
    freezesRemaining: freezes,
    lastActiveDate: Timestamp.fromDate(today),
    freezeResetDate: Timestamp.fromDate(today),
    perProjectStreaks: currentStreakObj?.perProjectStreaks || {},
    updatedAt: Timestamp.now(),
  };
};
