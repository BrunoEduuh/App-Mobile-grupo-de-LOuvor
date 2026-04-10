import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDGuFyPW4zgc2KAsV-zW7cswWi2s7FqrLQ",
  databaseURL: "https://app-firmados-default-rtdb.firebaseio.com",
  projectId: "app-firmados",
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
