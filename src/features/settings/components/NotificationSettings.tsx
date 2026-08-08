import { useState } from 'react';
import { useAuth } from '../../../stores/AuthContext';
import { requestNotificationPermission } from '../../../services/firebase';

export const NotificationSettings = () => {
  const { user } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const handleEnableNotifications = async () => {
    if (user) {
      await requestNotificationPermission(user.uid);
      setPermissionStatus(Notification.permission);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Notifications</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Push Notifications</h3>
          <p className="text-sm text-gray-500 mt-1 mb-3">
            Receive reminders for upcoming tasks and daily reviews.
          </p>
          
          {permissionStatus === 'granted' ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Notifications Enabled
            </div>
          ) : (
            <button
              onClick={handleEnableNotifications}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Enable Notifications
            </button>
          )}
          {permissionStatus === 'denied' && (
            <p className="text-xs text-red-500 mt-2">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
