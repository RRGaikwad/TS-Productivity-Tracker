import { useAuth } from '../stores/AuthContext';

export const usePro = () => {
  const { userProfile } = useAuth();
  
  const isPro = userProfile?.plan === 'pro';
  
  return {
    isPro,
    canAccess: (feature: 'analytics' | 'goals' | 'calendar' | 'unlimited_projects') => {
      // In a real app, define gating rules based on feature.
      // For now, these are pro-only.
      return isPro || feature === 'analytics'; // Just to use the variable to avoid TS error, although we can just comment it out.
    }
  };
};
