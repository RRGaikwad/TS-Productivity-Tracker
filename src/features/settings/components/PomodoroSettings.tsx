import { useSettings } from '../../../stores/SettingsContext';

export const PomodoroSettings = () => {
  const { settings, updateSettings } = useSettings();

  if (!settings) return null;

  const handleUpdate = (field: keyof typeof settings.pomodoro, value: number | boolean) => {
    updateSettings({
      pomodoro: {
        ...settings.pomodoro,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Pomodoro Settings</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Work Duration (minutes)
        </label>
        <input
          type="number"
          min="15"
          max="60"
          value={settings.pomodoro.workDuration}
          onChange={(e) => handleUpdate('workDuration', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Short Break Duration (minutes)
        </label>
        <input
          type="number"
          min="3"
          max="15"
          value={settings.pomodoro.shortBreakDuration}
          onChange={(e) => handleUpdate('shortBreakDuration', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Long Break Duration (minutes)
        </label>
        <input
          type="number"
          min="10"
          max="30"
          value={settings.pomodoro.longBreakDuration}
          onChange={(e) => handleUpdate('longBreakDuration', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="autoStartBreaks"
          checked={settings.pomodoro.autoStartBreaks}
          onChange={(e) => handleUpdate('autoStartBreaks', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="autoStartBreaks" className="text-sm text-gray-700">
          Auto-start breaks
        </label>
      </div>
    </div>
  );
};
