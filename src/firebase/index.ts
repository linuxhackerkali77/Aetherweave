'use client';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  getFirestore,
  type Firestore
} from 'firebase/firestore';
import { firebaseConfig } from './config';

// ---
// App
// ---

let firebaseApp: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let firestoreInstance: Firestore | undefined;

function initializeFirebase(): { app: FirebaseApp, auth: Auth, firestore: Firestore } {
  if (!firebaseApp) {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApp();
    }
  }

  if(!authInstance) {
    authInstance = getAuth(firebaseApp);
  }

  if (!firestoreInstance) {
    // Use regular getFirestore for faster initialization
    firestoreInstance = getFirestore(firebaseApp);
  }

  return { app: firebaseApp, auth: authInstance, firestore: firestoreInstance };
}

const { auth, firestore } = initializeFirebase();

export { initializeFirebase, auth, firestore };
