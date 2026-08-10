import { useState, type ReactNode } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { AccountSettings } from './AccountSettings';
import { PomodoroSettings } from './PomodoroSettings';
import { NotificationSettings } from './NotificationSettings';

type SettingsSection = 'appearance' | 'pomodoro' | 'notifications' | 'account';

interface SidebarItem {
  id: SettingsSection;
  label: string;
  description: string;
  icon: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: 'appearance',
    label: 'Appearance',
    description: 'Theme & display',
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
  },
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    description: 'Timer & focus',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Alerts & reminders',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  },
  {
    id: 'account',
    label: 'Account',
    description: 'Profile & security',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
];

const SECTION_CONTENT: Record<SettingsSection, ReactNode> = {
  appearance: <ThemeToggle />,
  pomodoro: <PomodoroSettings />,
  notifications: <NotificationSettings />,
  account: <AccountSettings />,
};

const SECTION_TITLES: Record<SettingsSection, { title: string; subtitle: string }> = {
  appearance: { title: 'Appearance', subtitle: 'Customize how TechSuccession looks and feels' },
  pomodoro: { title: 'Pomodoro Timer', subtitle: 'Configure your focus sessions and break intervals' },
  notifications: { title: 'Notifications', subtitle: 'Manage alerts and push notification preferences' },
  account: { title: 'Account', subtitle: 'View your profile info and manage your account' },
};

export const SettingsPanel = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
  const { title, subtitle } = SECTION_TITLES[activeSection];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your preferences and account details</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* ── Sidebar ── */}
        <aside className="md:w-56 shrink-0">
          {/* Mobile: horizontal tabs */}
          <div className="flex md:hidden gap-1 overflow-x-auto no-scrollbar pb-1">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                }`}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop: vertical sidebar */}
          <nav className="hidden md:flex flex-col gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-left transition-all duration-150 group ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-100'
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-medium leading-tight">{item.label}</p>
                  <p className={`text-xs leading-tight mt-0.5 ${activeSection === item.id ? 'text-blue-500' : 'text-gray-400'}`}>
                    {item.description}
                  </p>
                </div>
                {activeSection === item.id && (
                  <span className="ml-auto w-1 h-6 rounded-full bg-blue-500 shrink-0" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Content panel ── */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            </div>
            {/* Section body */}
            <div className="p-6">
              {SECTION_CONTENT[activeSection]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
