import { ThemeToggle } from './ThemeToggle';
import { AccountSettings } from './AccountSettings';
import { PomodoroSettings } from './PomodoroSettings';
import { NotificationSettings } from './NotificationSettings';

export const SettingsPanel = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      
      <div className="space-y-8">
        <div>
          <ThemeToggle />
        </div>

        <div>
          <PomodoroSettings />
        </div>

        <div>
          <NotificationSettings />
        </div>

        <div>
          <AccountSettings />
        </div>
      </div>
    </div>
  );
};
