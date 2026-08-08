import { useState } from 'react';
import { AuthProvider, useAuth } from './stores/AuthContext';
import { SettingsProvider } from './stores/SettingsContext';
import { ProjectProvider } from './stores/ProjectContext';
import { TaskProvider } from './stores/TaskContext';
import { TimerProvider } from './stores/TimerContext';
import { PomodoroProvider } from './stores/PomodoroContext';
import { SignInForm, SignUpForm, GoogleSignInButton } from './features/auth/components';
import { ProjectList } from './features/projects/components';
import { TaskList } from './features/tasks/components';
import { SettingsPanel } from './features/settings/components';
import { PomodoroTimer } from './features/pomodoro/components/PomodoroTimer';
import { AnalyticsDashboard } from './features/analytics/components/AnalyticsDashboard';
import { GoalsManager } from './features/goals/components/GoalsManager';
import { StreakDisplay } from './features/streaks/components/StreakDisplay';
import { DailyPlanningPrompt } from './features/dailyReview/components/DailyPlanningPrompt';
import { OfflineIndicator } from './components/common';
import { Header, Navigation } from './components/layout';
import { useSync } from './hooks/useSync';

type Tab = 'tasks' | 'projects' | 'pomodoro' | 'analytics' | 'goals' | 'settings';

function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('tasks');
  const { user, loading, guestSignIn } = useAuth();
  useSync();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OfflineIndicator />
        <Header />
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {activeTab === 'tasks' && (
            <>
              <DailyPlanningPrompt />
              <StreakDisplay />
              <TaskList />
            </>
          )}
          {activeTab === 'projects' && <ProjectList />}
          {activeTab === 'pomodoro' && <PomodoroTimer />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'goals' && <GoalsManager />}
          {activeTab === 'settings' && <SettingsPanel />}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TechSuccession</h1>
        </div>
        <p className="text-gray-600 mb-8 text-center">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </p>

        <div className="mb-6 space-y-3">
          <GoogleSignInButton />
          <button
            onClick={guestSignIn}
            className="w-full py-2.5 px-4 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors text-sm flex items-center justify-center gap-2"
          >
            ⚡ Quick Demo Mode (No Login Required)
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {isSignUp ? <SignUpForm /> : <SignInForm />}

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ProjectProvider>
          <TaskProvider>
            <TimerProvider>
              <PomodoroProvider>
                <AuthPage />
              </PomodoroProvider>
            </TimerProvider>
          </TaskProvider>
        </ProjectProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
