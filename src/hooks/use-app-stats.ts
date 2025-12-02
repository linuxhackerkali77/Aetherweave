
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  increment,
  runTransaction
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useAuth } from '@/firebase/provider';

export interface AppStat {
  appId: string;
  viewCount: number;
}

export function useAppStats() {
  const firestore = useFirestore();
  const auth = useAuth();
  const [appStats, setAppStats] = useState<AppStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) {
      setAppStats([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const appStatsCollectionRef = collection(firestore, 'app-stats');
    const unsubscribe = onSnapshot(appStatsCollectionRef, (snapshot) => {
      const statsData = snapshot.docs.map(doc => ({
        appId: doc.id,
        ...doc.data()
      } as AppStat));
      setAppStats(statsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching app stats:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [firestore]);
  
  const incrementViewCount = useCallback(async (appId: string) => {
    if (!firestore || !auth.currentUser) {
        console.error("Firestore or user not available for incrementing view count.");
        return;
    }
    
    const statRef = doc(firestore, 'app-stats', appId);

    try {
        await runTransaction(firestore, async (transaction) => {
            const statDoc = await transaction.get(statRef);
            if (!statDoc.exists()) {
                transaction.set(statRef, { appId: appId, viewCount: 1 });
            } else {
                const newViewCount = (statDoc.data().viewCount || 0) + 1;
                transaction.update(statRef, { viewCount: newViewCount });
            }
        });
    } catch (error) {
        console.error("Transaction failed: ", error);
    }
}, [firestore, auth]);


  return { appStats, loading, incrementViewCount };
}
