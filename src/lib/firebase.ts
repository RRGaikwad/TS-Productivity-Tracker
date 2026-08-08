import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyForLocalTesting12345',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'techsuccession-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'techsuccession-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'techsuccession-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:demo123456789',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  firestore = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialization error, running in local-only fallback mode:', error);
  // Fallbacks if initialization fails
  app = getApps()[0] || initializeApp(firebaseConfig);
  auth = getAuth(app);
  firestore = getFirestore(app);
}

// Check if we're using the emulator
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(firestore, 'localhost', 8080);
  } catch (e) {
    console.warn('Could not connect to Firebase emulators:', e);
  }
}

export { app, auth, firestore };
