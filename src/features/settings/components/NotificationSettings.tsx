import { useState } from 'react';
import { useAuth } from '../../../stores/AuthContext';
import { requestNotificationPermission } from '../../../services/firebase';

export const NotificationSettings = () => {
  const { user } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [requesting, setRequesting] = useState(false);

  const handleEnableNotifications = async () => {
    if (!user) return;
    setRequesting(true);
    await requestNotificationPermission(user.uid);
    setPermissionStatus(Notification.permission);
    setRequesting(false);
  };

  const isGranted = permissionStatus === 'granted';
  const isDenied  = permissionStatus === 'denied';

  return (
    <div className="space-y-5">
      {/* Push Notifications row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isGranted ? 'bg-emerald-50' : 'bg-gray-100'}`}>
            <svg className={`w-5 h-5 ${isGranted ? 'text-emerald-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Push Notifications</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
              Get reminders for upcoming tasks and daily reviews
            </p>
          </div>
        </div>

        {/* Status / Toggle */}
        {isGranted ? (
          <button
            role="switch"
            aria-checked
            className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-emerald-500 transition-colors toggle-track focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white shadow-md toggle-thumb" />
          </button>
        ) : (
          <button
            onClick={handleEnableNotifications}
            disabled={requesting}
            className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-gray-200 transition-colors toggle-track focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
          >
            <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white shadow-md toggle-thumb" />
          </button>
        )}
      </div>

      {/* Status badge */}
      {isGranted && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">Notifications are enabled</p>
        </div>
      )}

      {isDenied && !isGranted && (
        <div className="px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-amber-700 font-medium">Notifications are blocked</p>
          </div>
          <p className="text-xs text-amber-600 ml-6">
            Click the lock icon in your browser's address bar and allow notifications, then refresh the page.
          </p>
        </div>
      )}

      {/* Divider + additional info */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-400 leading-relaxed">
          Notifications include task due-date reminders, Pomodoro session alerts, and your daily planning prompt.
          You can revoke permission at any time from your browser settings.
        </p>
      </div>
    </div>
  );
};
