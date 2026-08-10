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
import { Header } from './components/layout';
import { useSync } from './hooks/useSync';

type Tab = 'tasks' | 'projects' | 'pomodoro' | 'analytics' | 'goals' | 'settings';

function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('tasks');
  const { user, loading } = useAuth();
  useSync();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 font-medium">Loading TechSuccession…</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OfflineIndicator />
        {/* Header now contains both the top bar AND nav (desktop inline + mobile drawer) */}
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TechSuccession</h1>
        </div>
        <p className="text-gray-500 mb-8 text-center text-sm">
          {isSignUp ? 'Create your account to get started' : 'Welcome back — sign in to continue'}
        </p>

        <div className="mb-6">
          <GoogleSignInButton />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-gray-400 uppercase tracking-wide">Or continue with email</span>
          </div>
        </div>

        {isSignUp ? <SignUpForm /> : <SignInForm />}

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
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
