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
        // Provide immediate fallback userProfile so UI opens smoothly without waiting for network
        const defaultProfile: UserType = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          plan: 'free',
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
          settings: {
            theme: 'light',
            pomodoro: { workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, autoStartBreaks: false },
            reminders: { defaultLeadTime: 15 },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        };
        setUserProfile(defaultProfile);
        setLoading(false);

        // Fetch actual profile asynchronously in background
        try {
          const profile = await getUserDoc(firebaseUser.uid);
          if (profile) {
            setUserProfile(profile as UserType);
          }
        } catch (err) {
          console.warn('Could not fetch user profile from Firestore:', err);
        }
      } else {
        setUserProfile(null);
        setLoading(false);
      }
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
