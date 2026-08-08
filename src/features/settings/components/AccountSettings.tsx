import { useAuth } from '../../../stores/AuthContext';

export const AccountSettings = () => {
  const { userProfile, signOut } = useAuth();

  if (!userProfile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{userProfile.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <p className="text-gray-900">{userProfile.displayName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {userProfile.plan === 'free' ? 'Free' : 'Pro'}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={signOut}
        className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
};
