import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore, getDocFromServer, doc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const database = getDatabase(app);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
  const errorCode = (error as any)?.code ? String((error as any).code) : 'unknown';

  console.error(`Firestore Error [${errorCode}]: ${errorMessage} (Op: ${operationType}, Path: ${path || 'unknown'})`);

  throw new Error(JSON.stringify({
    message: String(errorMessage),
    type: String(operationType),
    path: path ? String(path) : null,
    code: String(errorCode)
  }));
}

// CRITICAL: Connection test as per instructions
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection verified successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();
