import { ReactNode } from 'react';
import { useAuth } from '../../../stores/AuthContext';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page or show sign-in form
    window.location.href = '/auth';
    return null;
  }

  return <>{children}</>;
};
