import { useSettings } from '../../../stores/SettingsContext';

type Theme = 'light' | 'dark' | 'system';

const THEMES: { value: Theme; label: string; description: string; icon: string }[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Clean & bright',
    icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Easy on eyes',
    icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  },
  {
    value: 'system',
    label: 'System',
    description: 'Auto-detect',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2',
  },
];

export const ThemeToggle = () => {
  const { settings, updateSettings } = useSettings();

  if (!settings) return null;

  const handleThemeChange = (theme: Theme) => {
    updateSettings({ theme });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Color Theme</h3>
        <p className="text-xs text-gray-400 mb-4">Choose how TechSuccession appears on your device</p>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((theme) => {
            const isActive = settings.theme === theme.value;
            return (
              <button
                key={theme.value}
                onClick={() => handleThemeChange(theme.value)}
                className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {/* Theme preview box */}
                <div className={`w-12 h-9 rounded-lg flex items-center justify-center shadow-sm ${
                  theme.value === 'light'
                    ? 'bg-white border border-gray-200'
                    : theme.value === 'dark'
                    ? 'bg-gray-900'
                    : 'bg-gradient-to-br from-white to-gray-800'
                }`}>
                  <svg
                    className={`w-5 h-5 ${theme.value === 'dark' ? 'text-yellow-400' : theme.value === 'light' ? 'text-yellow-500' : 'text-blue-500'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={theme.icon} />
                  </svg>
                </div>
                <div className="text-center">
                  <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                    {theme.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{theme.description}</p>
                </div>
                {isActive && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8 15.414l-4.707-4.707a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
