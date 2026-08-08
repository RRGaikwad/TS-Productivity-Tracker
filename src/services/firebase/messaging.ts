import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { app, firestore } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

let messaging: Messaging | null = null;
try {
  messaging = getMessaging(app);
} catch (e) {
  console.warn('Firebase Messaging not supported in this environment');
}

export const requestNotificationPermission = async (userId: string) => {
  if (!messaging) return;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      if (token) {
        await setDoc(doc(firestore, 'users', userId, 'fcmTokens', token), {
          token,
          createdAt: new Date(),
          device: navigator.userAgent,
        });
      }
    }
  } catch (error) {
    console.error('An error occurred while requesting notification permission', error);
  }
};

export const setupOnMessage = (onMessageReceived: (payload: any) => void) => {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    onMessageReceived(payload);
  });
};

