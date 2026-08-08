import { db } from '../../lib/db';
import type { Task, Project, TimeEntry, PomodoroSession, Goal, DailyReview, Streak } from '../../types';

// Tasks
export const getTasksFromDB = async (userId: string): Promise<Task[]> => {
  return await db.tasks.where('ownerId').equals(userId).toArray();
};

export const getTasksByProjectFromDB = async (userId: string, projectId: string): Promise<Task[]> => {
  const tasks = await db.tasks.where('projectId').equals(projectId).toArray();
  return tasks.filter(task => task.ownerId === userId);
};

export const getTasksByStatusFromDB = async (userId: string, status: string): Promise<Task[]> => {
  const tasks = await db.tasks.where('status').equals(status).toArray();
  return tasks.filter(task => task.ownerId === userId);
};

export const addTaskToDB = async (task: Task): Promise<void> => {
  await db.tasks.add(task);
};

export const updateTaskInDB = async (id: string, updates: Partial<Task>): Promise<void> => {
  await db.tasks.update(id, updates);
};

export const deleteTaskFromDB = async (id: string): Promise<void> => {
  await db.tasks.delete(id);
};

// Projects
export const getProjectsFromDB = async (userId: string): Promise<Project[]> => {
  return await db.projects.where('ownerId').equals(userId).toArray();
};

export const getActiveProjectsFromDB = async (userId: string): Promise<Project[]> => {
  const projects = await db.projects.where('ownerId').equals(userId).toArray();
  return projects.filter(project => !project.archived);
};

export const addProjectToDB = async (project: Project): Promise<void> => {
  await db.projects.add(project);
};

export const updateProjectInDB = async (id: string, updates: Partial<Project>): Promise<void> => {
  await db.projects.update(id, updates);
};

export const deleteProjectFromDB = async (id: string): Promise<void> => {
  await db.projects.delete(id);
};

// Time Entries
export const getTimeEntriesFromDB = async (userId: string): Promise<TimeEntry[]> => {
  return await db.timeEntries.where('ownerId').equals(userId).toArray();
};

export const getTimeEntriesByTaskFromDB = async (userId: string, taskId: string): Promise<TimeEntry[]> => {
  const entries = await db.timeEntries.where('taskId').equals(taskId).toArray();
  return entries.filter(entry => entry.ownerId === userId);
};

export const addTimeEntryToDB = async (entry: TimeEntry): Promise<void> => {
  await db.timeEntries.add(entry);
};

export const updateTimeEntryInDB = async (id: string, updates: Partial<TimeEntry>): Promise<void> => {
  await db.timeEntries.update(id, updates);
};

export const deleteTimeEntryFromDB = async (id: string): Promise<void> => {
  await db.timeEntries.delete(id);
};

// Pomodoro Sessions
export const getPomodoroSessionsFromDB = async (userId: string): Promise<PomodoroSession[]> => {
  return await db.pomodoroSessions.where('ownerId').equals(userId).toArray();
};

export const addPomodoroSessionToDB = async (session: PomodoroSession): Promise<void> => {
  await db.pomodoroSessions.add(session);
};

export const updatePomodoroSessionInDB = async (id: string, updates: Partial<PomodoroSession>): Promise<void> => {
  await db.pomodoroSessions.update(id, updates);
};

// Goals
export const getGoalsFromDB = async (userId: string): Promise<Goal[]> => {
  return await db.goals.where('ownerId').equals(userId).toArray();
};

export const getActiveGoalsFromDB = async (userId: string): Promise<Goal[]> => {
  const goals = await db.goals.where('ownerId').equals(userId).toArray();
  return goals.filter(goal => !goal.archived);
};

export const addGoalToDB = async (goal: Goal): Promise<void> => {
  await db.goals.add(goal);
};

export const updateGoalInDB = async (id: string, updates: Partial<Goal>): Promise<void> => {
  await db.goals.update(id, updates);
};

export const deleteGoalFromDB = async (id: string): Promise<void> => {
  await db.goals.delete(id);
};

// Daily Reviews
export const getDailyReviewsFromDB = async (userId: string): Promise<DailyReview[]> => {
  return await db.dailyReviews.where('ownerId').equals(userId).toArray();
};

export const getDailyReviewByDateFromDB = async (userId: string, date: Date): Promise<DailyReview | undefined> => {
  const reviews = await db.dailyReviews.where('date').equals(date).toArray();
  return reviews.find(review => review.ownerId === userId);
};

export const addDailyReviewToDB = async (review: DailyReview): Promise<void> => {
  await db.dailyReviews.add(review);
};

export const updateDailyReviewInDB = async (id: string, updates: Partial<DailyReview>): Promise<void> => {
  await db.dailyReviews.update(id, updates);
};

// Streaks
export const getStreakFromDB = async (userId: string): Promise<Streak | undefined> => {
  return await db.streaks.where('ownerId').equals(userId).first();
};

export const addStreakToDB = async (streak: Streak): Promise<void> => {
  await db.streaks.add(streak);
};

export const updateStreakInDB = async (userId: string, updates: Partial<Streak>): Promise<number> => {
  return await db.streaks.where('ownerId').equals(userId).modify(updates);
};

// Sync Queue
export const getSyncQueueFromDB = async (): Promise<any[]> => {
  return await db.syncQueue.orderBy('timestamp').toArray();
};

export const addToSyncQueue = async (operation: any): Promise<void> => {
  await db.syncQueue.add(operation);
};

export const removeFromSyncQueue = async (id: string): Promise<void> => {
  await db.syncQueue.delete(id);
};

export const clearSyncQueue = async (): Promise<void> => {
  await db.syncQueue.clear();
};
