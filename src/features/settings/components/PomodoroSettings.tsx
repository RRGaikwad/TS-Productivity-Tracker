import { useSettings } from '../../../stores/SettingsContext';

interface StepperProps {
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}

const Stepper = ({ label, sublabel, value, min, max, step = 1, unit = 'min', onChange }: StepperProps) => {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
        </div>
        {/* Stepper control */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1">
          <button
            onClick={dec}
            disabled={value <= min}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
            aria-label={`Decrease ${label}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
          </button>
          <span className="w-14 text-center text-sm font-bold text-gray-900 tabular-nums">
            {value} <span className="text-xs font-normal text-gray-400">{unit}</span>
          </span>
          <button
            onClick={inc}
            disabled={value >= max}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
            aria-label={`Increase ${label}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      {/* Visual range bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-300">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
};

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  id: string;
}

const Toggle = ({ checked, onChange, id }: ToggleProps) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 toggle-track focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      checked ? 'bg-blue-500' : 'bg-gray-200'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md toggle-thumb ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

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
    <div className="space-y-6">
      {/* Duration steppers */}
      <div className="space-y-6">
        <Stepper
          label="Work Duration"
          sublabel="Focus session length"
          value={settings.pomodoro.workDuration}
          min={15}
          max={60}
          step={5}
          unit="min"
          onChange={(v) => handleUpdate('workDuration', v)}
        />

        <div className="border-t border-gray-100" />

        <Stepper
          label="Short Break"
          sublabel="Rest between focus sessions"
          value={settings.pomodoro.shortBreakDuration}
          min={3}
          max={15}
          step={1}
          unit="min"
          onChange={(v) => handleUpdate('shortBreakDuration', v)}
        />

        <div className="border-t border-gray-100" />

        <Stepper
          label="Long Break"
          sublabel="Extended rest after 4 sessions"
          value={settings.pomodoro.longBreakDuration}
          min={10}
          max={30}
          step={5}
          unit="min"
          onChange={(v) => handleUpdate('longBreakDuration', v)}
        />
      </div>

      {/* Auto-start toggle */}
      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">Auto-start Breaks</p>
            <p className="text-xs text-gray-400 mt-0.5">Automatically begin breaks after each focus session</p>
          </div>
          <Toggle
            id="autoStartBreaks"
            checked={settings.pomodoro.autoStartBreaks}
            onChange={(v) => handleUpdate('autoStartBreaks', v)}
          />
        </div>
      </div>
    </div>
  );
};
