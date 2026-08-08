import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Scheduled Functions
export const sendReminderNotifications = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    
    const notificationsSnapshot = await db
      .collection('notifications')
      .where('scheduledFor', '<=', now)
      .where('sent', '==', false)
      .get();
    
    const batch = db.batch();
    
    for (const doc of notificationsSnapshot.docs) {
      const notification = doc.data();
      
      // Send FCM message (implementation deferred - requires FCM setup)
      // await admin.messaging().send({ ... });
      
      batch.update(doc.ref, {
        sent: true,
        sentAt: admin.firestore.Timestamp.now(),
      });
    }
    
    await batch.commit();
    return null;
  });

export const calculateStreaks = functions.pubsub
  .schedule('0 0 * * *')
  .onRun(async (context) => {
    const db = admin.firestore();
    const streaksSnapshot = await db.collection('streaks').get();
    
    const batch = db.batch();
    const now = admin.firestore.Timestamp.now();
    const oneDayAgo = new Date(now.toDate().getTime() - 24 * 60 * 60 * 1000);
    
    for (const doc of streaksSnapshot.docs) {
      const streak = doc.data();
      const userId = doc.id;
      
      // Check if user completed a task or Pomodoro session yesterday
      const tasksCompleted = await db
        .collection('tasks')
        .where('ownerId', '==', userId)
        .where('status', '==', 'done')
        .where('completedAt', '>=', admin.firestore.Timestamp.fromDate(oneDayAgo))
        .where('completedAt', '<=', now)
        .get();
      
      const pomodoroSessions = await db
        .collection('pomodoroSessions')
        .where('ownerId', '==', userId)
        .where('startTime', '>=', admin.firestore.Timestamp.fromDate(oneDayAgo))
        .where('startTime', '<=', now)
        .get();
      
      const hadActivity = !tasksCompleted.empty || !pomodoroSessions.empty;
      
      if (hadActivity) {
        // Increment streak
        batch.update(doc.ref, {
          currentStreak: admin.firestore.FieldValue.increment(1),
          lastActiveDate: now,
          updatedAt: now,
        });
      } else {
        // Check if user has freezes remaining
        if (streak.freezesRemaining > 0) {
          batch.update(doc.ref, {
            freezesRemaining: admin.firestore.FieldValue.increment(-1),
            updatedAt: now,
          });
        } else {
          // Reset streak
          batch.update(doc.ref, {
            currentStreak: 0,
            lastActiveDate: now,
            updatedAt: now,
          });
        }
      }
      
      // Reset weekly freezes on Sunday
      const dayOfWeek = now.toDate().getDay();
      if (dayOfWeek === 0) {
        batch.update(doc.ref, {
          freezesRemaining: 1,
          freezeResetDate: now,
          updatedAt: now,
        });
      }
    }
    
    await batch.commit();
    return null;
  });

export const generateWeeklySummary = functions.pubsub
  .schedule('0 9 * * 0')
  .onRun(async (context) => {
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users').get();
    
    const now = admin.firestore.Timestamp.now();
    const oneWeekAgo = new Date(now.toDate().getTime() - 7 * 24 * 60 * 60 * 1000);
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      // Get daily reviews for the past week
      const dailyReviews = await db
        .collection('dailyReviews')
        .where('ownerId', '==', userId)
        .where('date', '>=', admin.firestore.Timestamp.fromDate(oneWeekAgo))
        .where('date', '<=', now)
        .get();
      
      let totalTasksCompleted = 0;
      let totalTimeSpent = 0;
      let totalPomodoroSessions = 0;
      
      for (const reviewDoc of dailyReviews.docs) {
        const review = reviewDoc.data();
        totalTasksCompleted += review.tasksCompleted || 0;
        totalTimeSpent += review.timeSpentSeconds || 0;
        totalPomodoroSessions += review.pomodoroSessionsCount || 0;
      }
      
      // Get streak
      const streakDoc = await db.collection('streaks').doc(userId).get();
      const streak = streakDoc.exists ? streakDoc.data() : null;
      
      // Create notification
      await db.collection('notifications').add({
        ownerId: userId,
        type: 'weekly_summary',
        title: 'Your Weekly Summary',
        body: `You completed ${totalTasksCompleted} tasks, tracked ${Math.floor(totalTimeSpent / 60)} minutes, and did ${totalPomodoroSessions} focus sessions this week. Current streak: ${streak?.currentStreak || 0} days.`,
        scheduledFor: now,
        sent: false,
        createdAt: now,
      });
    }
    
    return null;
  });

// Triggered Functions
export const onTaskComplete = functions.firestore
  .document('tasks/{taskId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Only proceed if status changed to 'done'
    if (before.status === 'done' || after.status !== 'done') {
      return null;
    }
    
    const db = admin.firestore();
    const userId = after.ownerId;
    const now = admin.firestore.Timestamp.now();
    
    // Update streak
    const streakRef = db.collection('streaks').doc(userId);
    const streakDoc = await streakRef.get();
    
    if (streakDoc.exists) {
      await streakRef.update({
        currentStreak: admin.firestore.FieldValue.increment(1),
        lastActiveDate: now,
        updatedAt: now,
      });
    } else {
      await streakRef.set({
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: now,
        freezesRemaining: 1,
        freezeResetDate: now,
        perProjectStreaks: {},
        updatedAt: now,
      });
    }
    
    // Update goal progress if task is linked to a goal
    if (after.projectId) {
      const projectDoc = await db.collection('projects').doc(after.projectId).get();
      if (projectDoc.exists && projectDoc.data()?.goalId) {
        const goalRef = db.collection('goals').doc(projectDoc.data()!.goalId);
        await goalRef.update({
          progress: admin.firestore.FieldValue.increment(10), // Simple increment for v1
          updatedAt: now,
        });
      }
    }
    
    // Update daily review
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyReviewRef = db
      .collection('dailyReviews')
      .where('ownerId', '==', userId)
      .where('date', '==', admin.firestore.Timestamp.fromDate(today))
      .limit(1);
    
    const dailyReviewSnapshot = await dailyReviewRef.get();
    
    if (dailyReviewSnapshot.empty) {
      await db.collection('dailyReviews').add({
        ownerId: userId,
        date: admin.firestore.Timestamp.fromDate(today),
        top3Tasks: [context.params.taskId],
        tasksCompleted: 1,
        timeSpentSeconds: 0,
        pomodoroSessionsCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      const reviewDoc = dailyReviewSnapshot.docs[0];
      const review = reviewDoc.data();
      const top3Tasks = review.top3Tasks || [];
      
      await reviewDoc.ref.update({
        top3Tasks: top3Tasks.length < 3 ? [...top3Tasks, context.params.taskId] : top3Tasks,
        tasksCompleted: admin.firestore.FieldValue.increment(1),
        updatedAt: now,
      });
    }
    
    return null;
  });

export const onUserCreate = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snapshot, context) => {
    const db = admin.firestore();
    const userId = context.params.userId;
    const now = admin.firestore.Timestamp.now();
    
    // Create default projects
    const workProject = await db.collection('projects').add({
      ownerId: userId,
      name: 'Work',
      color: '#3B82F6',
      createdAt: now,
      updatedAt: now,
      archived: false,
    });
    
    const personalProject = await db.collection('projects').add({
      ownerId: userId,
      name: 'Personal',
      color: '#10B981',
      createdAt: now,
      updatedAt: now,
      archived: false,
    });
    
    // Create streaks document
    await db.collection('streaks').doc(userId).set({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: now,
      freezesRemaining: 1,
      freezeResetDate: now,
      perProjectStreaks: {},
      updatedAt: now,
    });
    
    return null;
  });
