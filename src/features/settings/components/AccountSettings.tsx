import { useState } from 'react';
import { useAuth } from '../../../stores/AuthContext';

function getInitials(email?: string | null, displayName?: string | null): string {
  if (displayName) {
    const parts = displayName.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return 'U';
}

export const AccountSettings = () => {
  const { user, userProfile, signOut } = useAuth();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  if (!userProfile) return null;

  const initials = getInitials(user?.email, userProfile.displayName);

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-gray-900 truncate">{userProfile.displayName}</p>
          <p className="text-sm text-gray-500 truncate">{userProfile.email}</p>
          <span className={`mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            userProfile.plan === 'free'
              ? 'bg-gray-100 text-gray-600'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {userProfile.plan === 'free' ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Free Plan
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Pro Plan
              </>
            )}
          </span>
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-3">
        {[
          { label: 'Email', value: userProfile.email, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
          { label: 'Display Name', value: userProfile.displayName, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-sm text-gray-800 font-semibold truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="border border-red-100 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 bg-red-50 border-b border-red-100">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm font-semibold text-red-700">Danger Zone</p>
          </div>
        </div>
        <div className="px-4 py-4 bg-white space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Sign Out</p>
              <p className="text-xs text-gray-400 mt-0.5">You'll be redirected to the login page</p>
            </div>
            {confirmSignOut ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmSignOut(false)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={signOut}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  Confirm
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmSignOut(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
