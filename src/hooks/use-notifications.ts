
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  Timestamp,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useUser } from '@/hooks/use-user';

export interface Notification {
  id: string;
  userId: string;
  type: 'new_message' | 'task_reminder' | 'file_upload' | 'system_alert' | 'friend_request';
  title: string;
  description: string;
  isRead: boolean;
  link?: string;
  createdAt: Timestamp;
}

export type NewNotification = Omit<Notification, 'id' | 'userId' | 'createdAt' | 'isRead'>;


export function useNotifications() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const notificationsCollectionRef = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'notifications');
  }, [firestore, user]);

  useEffect(() => {
    if (!notificationsCollectionRef) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      notificationsCollectionRef,
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsData: Notification[] = [];
      querySnapshot.forEach((doc) => {
        notificationsData.push({ id: doc.id, ...doc.data() } as Notification);
      });
      setNotifications(notificationsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [notificationsCollectionRef]);

  const addNotification = useCallback(async (notificationData: NewNotification, targetUserId?: string) => {
    const userId = targetUserId || user?.uid;
    if (!userId || !firestore) throw new Error('User not logged in or Firestore not available');
    const collectionRef = collection(firestore, 'users', userId, 'notifications');
    
    return await addDoc(collectionRef, {
      ...notificationData,
      userId: userId,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  }, [user, firestore]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!firestore || !user) return;
    const notificationRef = doc(firestore, 'users', user.uid, 'notifications', notificationId);
    await updateDoc(notificationRef, { isRead: true });
  }, [firestore, user]);

  const markAllAsRead = useCallback(async () => {
    if (!firestore || !user || !notificationsCollectionRef) return;
    
    const batch = writeBatch(firestore);
    const q = query(notificationsCollectionRef, where('isRead', '==', false));
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();
  }, [firestore, user, notificationsCollectionRef]);
  
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  return { notifications, loading, addNotification, markAsRead, markAllAsRead, unreadCount };
}

    