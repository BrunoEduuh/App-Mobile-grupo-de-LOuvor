import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore, getDocFromServer, doc } from 'firebase/firestore';
const firebaseConfig = {
  projectId: "gen-lang-client-0569954161",
  appId: "1:48701284341:web:98d0a3710ba050c9bf0abc",
  apiKey: "AIzaSyBwOHJI9Zbj7iMbBTvxI2JHY7EeeM1F2eQ",
  authDomain: "gen-lang-client-0569954161.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-976ac814-e92d-4367-8274-8e93a8812807",
  storageBucket: "gen-lang-client-0569954161.firebasestorage.app",
  messagingSenderId: "48701284341",
  measurementId: ""
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  // Extract error message safely without any risk of circularity
  let errorMessage = 'Unknown error';
  
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      errorMessage = error.message;
    } else {
      errorMessage = String(error);
    }
  } else {
    errorMessage = String(error || 'Unknown error');
  }

  const errInfo = {
    error: errorMessage,
    operationType,
    path,
    uid: auth.currentUser?.uid || 'not-logged-in'
  };

  // Log the object directly - browsers handle circularity in console.error
  console.error('Firestore Error Details:', errInfo);

  // Throw a simple JSON string with NO complex objects
  try {
    const errorJson = JSON.stringify({
      message: errorMessage,
      type: operationType,
      path: path,
      code: (error as any)?.code || 'unknown'
    });
    throw new Error(errorJson);
  } catch (e) {
    // Fallback if stringify fails for any reason
    throw new Error(`Firestore ${operationType} error: ${errorMessage}`);
  }
}

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
export const googleProvider = new GoogleAuthProvider();

// CRITICAL: Connection test as per instructions
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection verified successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
    // Skip logging for other errors, as this is simply a connection test.
  }
}
testConnection();
