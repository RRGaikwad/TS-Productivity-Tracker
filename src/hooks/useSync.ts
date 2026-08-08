import { useEffect } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { syncWithFirestore } from '../services/indexeddb/sync';

export const useSync = () => {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (isOnline) {
      // Sync pending operations when coming back online
      syncWithFirestore().catch((error) => {
        console.error('Sync failed:', error);
      });
    }
  }, [isOnline]);
};
