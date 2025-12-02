'use client';
import React, { useMemo, type ReactNode } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseInstances = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider value={firebaseInstances}>
      {children}
    </FirebaseProvider>
  );
}
