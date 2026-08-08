import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } from '../services/firebase/auth';
import type { User as UserType } from '../types/user';
import { getUserDoc } from '../services/firebase/firestore';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserType | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  guestSignIn: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const profile = await getUserDoc(firebaseUser.uid);
          setUserProfile(profile as UserType | null);
        } catch (err) {
          console.warn('Could not fetch user profile from Firestore:', err);
          setUserProfile({
            id: firebaseUser.uid,
            email: firebaseUser.email || 'demo@local.com',
            displayName: firebaseUser.displayName || 'Demo User',
            plan: 'free',
            createdAt: new Date() as any,
            updatedAt: new Date() as any,
            settings: {
              theme: 'light',
              pomodoro: { workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, autoStartBreaks: false },
              reminders: { defaultLeadTime: 15 },
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          });
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    await signInWithGoogle();
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    await signInWithEmail(email, password);
  };

  const handleSignUpWithEmail = async (email: string, password: string, displayName: string) => {
    await signUpWithEmail(email, password, displayName);
  };

  const handleGuestSignIn = () => {
    const mockUser: any = {
      uid: 'demo_user_123',
      email: 'demo@local.com',
      displayName: 'Demo User',
    };
    setUser(mockUser);
    setUserProfile({
      id: 'demo_user_123',
      email: 'demo@local.com',
      displayName: 'Demo User',
      plan: 'free',
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      settings: {
        theme: 'light',
        pomodoro: { workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, autoStartBreaks: false },
        reminders: { defaultLeadTime: 15 },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      // ignore
    }
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        guestSignIn: handleGuestSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
