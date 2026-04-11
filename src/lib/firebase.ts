import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// Initialize Firestore with robust configuration and error handling
let firestoreDb: Firestore | undefined;
try {
  // In Firebase v9+, databaseId is the third argument to initializeFirestore
  // initializeFirestore(app, settings, databaseId)
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, firebaseConfig.firestoreDatabaseId || '(default)');
} catch (e) {
  console.warn("Firestore specific initialization failed, trying default...", e);
  try {
    firestoreDb = getFirestore(app);
  } catch (e2) {
    console.error("Firestore service is not available in this project.", e2);
  }
}

export const db = firestoreDb!;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
