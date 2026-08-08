import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  type UserCredential,
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../../lib/firebase';
import type { User as UserType } from '../../types/user';

export const signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  
  // Create user document if it doesn't exist
  await ensureUserDocument(result.user);
  
  return result;
};

export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result;
};

export const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<UserCredential> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update display name
  await updateProfile(result.user, { displayName });
  
  // Create user document
  await ensureUserDocument(result.user);
  
  return result;
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

const ensureUserDocument = async (firebaseUser: User): Promise<void> => {
  const userDocRef = doc(firestore, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) {
    const newUser: Omit<UserType, 'id'> = {
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
      photoURL: firebaseUser.photoURL,
      plan: 'free',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      settings: {
        theme: 'system',
        pomodoro: {
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          autoStartBreaks: false,
        },
        reminders: {
          defaultLeadTime: 60, // 1 hour before due
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
    
    await setDoc(userDocRef, newUser);
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
