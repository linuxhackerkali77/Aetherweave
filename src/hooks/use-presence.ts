'use client';
import { useState, useEffect, useCallback } from 'react';
import { doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useUser } from './use-user';

export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

interface PresenceData {
  status: PresenceStatus;
  lastSeen: any;
  isOnline: boolean;
}

export function usePresence() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [status, setStatus] = useState<PresenceStatus>('online');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Update presence in Firestore
  const updatePresence = useCallback(async (newStatus: PresenceStatus) => {
    if (!user || !firestore) return;
    
    const userRef = doc(firestore, 'users', user.uid);
    await updateDoc(userRef, {
      status: newStatus,
      lastSeen: serverTimestamp(),
      isOnline: newStatus !== 'offline'
    });
    setStatus(newStatus);
  }, [user, firestore]);

  // Handle online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      updatePresence('online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      updatePresence('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updatePresence]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        updatePresence('online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updatePresence]);

  // Handle beforeunload to set offline
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && firestore) {
        const userRef = doc(firestore, 'users', user.uid);
        updateDoc(userRef, {
          status: 'offline',
          lastSeen: serverTimestamp(),
          isOnline: false
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, firestore]);

  // Initialize presence on mount
  useEffect(() => {
    if (user && firestore) {
      updatePresence(isOnline ? 'online' : 'offline');
    }
  }, [user, firestore, isOnline, updatePresence]);

  return {
    status,
    isOnline,
    updatePresence
  };
}