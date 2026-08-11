import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { updateUserDoc } from '../services/firebase/firestore';
import type { UserSettings } from '../types';

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function applyThemeToDOM(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement;
  const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldBeDark = theme === 'dark' || (theme === 'system' && isSystemDark);

  if (shouldBeDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  try {
    localStorage.setItem('app_theme', theme);
  } catch (e) {}
}

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { userProfile } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(() => {
    const savedTheme = (localStorage.getItem('app_theme') as any) || 'system';
    return {
      theme: savedTheme,
      pomodoro: { workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, autoStartBreaks: false },
      reminders: { defaultLeadTime: 15 },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  });
  const [loading, setLoading] = useState(true);

  // Apply theme on initial mount and whenever settings.theme changes
  useEffect(() => {
    if (settings?.theme) {
      applyThemeToDOM(settings.theme);
    }
  }, [settings?.theme]);

  // Listen for OS system theme changes if theme === 'system'
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings?.theme === 'system') {
        applyThemeToDOM('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings?.theme]);

  useEffect(() => {
    if (userProfile?.settings) {
      setSettings(userProfile.settings);
      setLoading(false);
    }
  }, [userProfile]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates } as UserSettings;
    setSettings(newSettings);

    if (updates.theme) {
      applyThemeToDOM(updates.theme);
    }

    if (userProfile) {
      try {
        await updateUserDoc(userProfile.id, { settings: newSettings });
      } catch (error) {
        console.error('Failed to update settings in Firestore:', error);
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
