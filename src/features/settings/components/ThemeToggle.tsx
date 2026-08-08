import { useSettings } from '../../../stores/SettingsContext';

export const ThemeToggle = () => {
  const { settings, updateSettings } = useSettings();

  if (!settings) return null;

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Theme:</span>
      <select
        value={settings.theme}
        onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'system')}
        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
};
