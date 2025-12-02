
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useUser } from '@/hooks/use-user';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  pinned: boolean;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export function useNotes() {
  const firestore = useFirestore();
  const { user, incrementStat } = useUser();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);


  const notesCollection = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'notes');
  }, [firestore]);

  useEffect(() => {
    if (!user || !notesCollection) {
      setNotes([]);
      setLoading(false);
      return;
    };

    setLoading(true);
    const q = query(
      notesCollection, 
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notesData: Note[] = [];
      querySnapshot.forEach((doc) => {
        notesData.push({ id: doc.id, ...doc.data() } as Note);
      });
      // Perform sorting on the client-side
      notesData.sort((a, b) => {
        // Pinned notes first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        // Then sort by updatedAt descending
        if (b.updatedAt && a.updatedAt) {
          return b.updatedAt.toMillis() - a.updatedAt.toMillis();
        }
        return 0;
      });
      setNotes(notesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, notesCollection]);

  const addNote = async (noteData: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !notesCollection) throw new Error('User not logged in or firestore not available');
    
    await incrementStat('notesCreated', 1);

    const docRef = await addDoc(notesCollection, {
      ...noteData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef;
  };

  const updateNote = async (noteId: string, noteData: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>) => {
    if (!firestore) throw new Error('Firestore not available');
    const noteRef = doc(firestore, 'notes', noteId);
    await updateDoc(noteRef, {
        ...noteData,
        updatedAt: serverTimestamp(),
    });
  };

  const deleteNote = async (noteId: string) => {
    if (!firestore) throw new Error('Firestore not available');
    const noteRef = doc(firestore, 'notes', noteId);
    await deleteDoc(noteRef);
  };
  
  const bulkDeleteNotes = async (noteIds: string[]) => {
    if (!firestore) throw new Error("Firestore not available");
    const batch = writeBatch(firestore);
    noteIds.forEach(id => {
      const noteRef = doc(firestore, 'notes', id);
      batch.delete(noteRef);
    });
    await batch.commit();
  }

  return { notes, loading, addNote, updateNote, deleteNote, bulkDeleteNotes };
}
