
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  serverTimestamp,
  Timestamp,
  where,
  getDoc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { useFirestore, useAuth } from '@/firebase/provider';
import { useUser, UserProfile } from '@/hooks/use-user';
import { useNotifications } from './use-notifications';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export type PublicUser = Omit<UserProfile, 'isAnonymous' | 'settings' | 'questResets' | 'questsCompleted' | 'interests' >;


export interface Connection {
  id: string; // The ID of the other user in the connection
  status: 'pending' | 'friends' | 'blocked';
  requestedBy: string; // UID of user who initiated
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export function useConnections() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, incrementStat } = useUser();
  const { addNotification } = useNotifications();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoize the collection references
  const connectionsCollectionRef = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'connections');
  }, [firestore, user]);

  const usersCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  // Fetch user's connections and their profiles
  useEffect(() => {
    if (!connectionsCollectionRef || !firestore) {
      setConnections([]);
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(connectionsCollectionRef, async (snapshot) => {
      const connectionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Connection));
      
      setConnections(connectionsData);

      if (connectionsData.length > 0) {
        const userIds = connectionsData.map(c => c.id).filter(id => id);
        
        if (userIds.length > 0) {
          try {
            const userQuery = query(collection(firestore, 'users'), where('__name__', 'in', userIds));
            const userDocsSnapshot = await getDocs(userQuery);
            
            const newUsers = userDocsSnapshot.docs.map(docSnap => ({
              ...(docSnap.data() as UserProfile),
              id: docSnap.id,
            }));

            setUsers(newUsers);
          } catch (error) {
            console.error("Error fetching user documents for connections:", error);
            setUsers([]);
          }
        } else {
           setUsers([]);
        }
      } else {
        setUsers([]);
      }
      
      setLoading(false);

    }, (error) => {
      console.error("Error fetching connections snapshot:", error);
      const permissionError = new FirestorePermissionError({
        path: connectionsCollectionRef.path,
        operation: 'list',
      }, auth);
      errorEmitter.emit('permission-error', permissionError);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [connectionsCollectionRef, firestore, auth]);


  const findUserByUsername = useCallback(async (username: string): Promise<PublicUser | null> => {
    if (!usersCollectionRef) return null;
    const q = query(usersCollectionRef, where("username", "==", username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const userDoc = querySnapshot.docs[0];
    const data = userDoc.data();
    return {
        id: userDoc.id,
        username: data.username,
        displayName: data.displayName || null,
        email: data.email || null,
        photoURL: data.photoURL || null,
    } as PublicUser;
  }, [usersCollectionRef]);


  const sendFriendRequest = useCallback(async (targetUserId: string) => {
    if (!firestore || !user || user.uid === targetUserId) return;

    const batch = writeBatch(firestore);
    const now = serverTimestamp();

    const senderData = { status: 'pending' as const, requestedBy: user.uid, createdAt: now, updatedAt: now };
    const receiverData = { status: 'pending' as const, requestedBy: user.uid, createdAt: now, updatedAt: now };

    // Sender's connection doc
    const senderRef = doc(firestore, 'users', user.uid, 'connections', targetUserId);
    batch.set(senderRef, senderData);

    // Receiver's connection doc
    const receiverRef = doc(firestore, 'users', targetUserId, 'connections', user.uid);
    batch.set(receiverRef, receiverData);

    await batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: receiverRef.path,
          operation: 'create',
          requestResourceData: receiverData,
        }, auth);
        errorEmitter.emit('permission-error', permissionError);
      });

    // Send notification to the target user
    await addNotification({
        type: 'friend_request',
        title: 'New Friend Request',
        description: `You have a new friend request from ${user.displayName || user.email}.`,
        link: '/contacts'
    }, targetUserId);
    
  }, [firestore, user, auth, addNotification]);

  const acceptFriendRequest = useCallback(async (senderId: string) => {
    if (!firestore || !user) return;

    const batch = writeBatch(firestore);
    const now = serverTimestamp();

    // Acceptor's connection doc
    const acceptorRef = doc(firestore, 'users', user.uid, 'connections', senderId);
    batch.update(acceptorRef, { status: 'friends', updatedAt: now });

    // Sender's connection doc
    const senderRef = doc(firestore, 'users', senderId, 'connections', user.uid);
    batch.update(senderRef, { status: 'friends', updatedAt: now });

    await batch.commit();

    // Increment friend count for both users after commit
    await incrementStat('friends', 1);
    const senderUserRef = doc(firestore, 'users', senderId);
    await updateDoc(senderUserRef, { friends: increment(1) });


  }, [firestore, user, incrementStat]);

  const removeConnection = useCallback(async (targetUserId: string) => {
    if (!firestore || !user) return;

    const userConnRef = doc(firestore, 'users', user.uid, 'connections', targetUserId);
    const targetConnRef = doc(firestore, 'users', targetUserId, 'connections', user.uid);

    const userConnSnap = await getDoc(userConnRef);

    const batch = writeBatch(firestore);
    batch.delete(userConnRef);
    batch.delete(targetConnRef);
    
    // Decrement friend counts if they were friends
    if (userConnSnap.exists() && userConnSnap.data().status === 'friends') {
        batch.update(doc(firestore, 'users', user.uid), { friends: increment(-1) });
        batch.update(doc(firestore, 'users', targetUserId), { friends: increment(-1) });
    }

    await batch.commit();
  }, [firestore, user]);

  const blockUser = useCallback(async (targetUserId: string) => {
      if (!firestore || !user) return;

      const userConnRef = doc(firestore, 'users', user.uid, 'connections', targetUserId);
      await setDoc(userConnRef, {
        status: 'blocked',
        requestedBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

       const targetConnRef = doc(firestore, 'users', targetUserId, 'connections', user.uid);
       const targetDoc = await getDoc(targetConnRef);
       if (targetDoc.exists()) {
           await deleteDoc(targetConnRef);
       }

  }, [firestore, user]);


  return { connections, users, loading, findUserByUsername, sendFriendRequest, acceptFriendRequest, removeConnection, blockUser };
}
