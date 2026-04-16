import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  doc, 
  setDoc, 
  query, 
  orderBy, 
  getDoc,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Verse, BIBLIA_CURADA } from '../constants/content';
import { registerForPushNotificationsAsync, sendPushNotification } from '../lib/notifications';
import { handleFirestoreError, OperationType } from '../lib/firebase';

// Helper to sanitize Firestore data to plain objects and handle circularity
function sanitizeData(data: any): any {
  if (data === null || data === undefined) return data;
  
  // Handle Firestore Timestamp
  if (data instanceof Timestamp) {
    return data.toMillis();
  }
  
  // Handle Firestore DocumentReference or other non-plain objects that might be circular
  if (typeof data === 'object') {
    // If it's a Firestore Reference or something with a 'firestore' property, it's likely circular
    if (data.firestore || data.constructor?.name === 'DocumentReference' || data.constructor?.name === 'Query' || data.constructor?.name === 'Firestore') {
      return '[FirebaseObject]'; // Strip it or convert to string representation
    }

    if (Array.isArray(data)) {
      return data.map(sanitizeData);
    }
    
    // Only proceed with plain objects
    if (data.constructor === Object) {
      const sanitized: any = {};
      for (const key in data) {
        sanitized[key] = sanitizeData(data[key]);
      }
      return sanitized;
    }

    // For other objects (like Errors), convert to string if they might be complex
    return String(data);
  }
  
  return data;
}

export interface Song {
  id: string;
  title: string;
  artist?: string;
  url: string;
  theme: string;
  playCount: number;
  lastPlayedDate: number | null; // Timestamp of last time it was in a setlist
  lyrics?: string;
  rehearsalNotes?: string;
}

interface AppState {
  user: { uid: string; email: string | null } | null;
  userRole: 'admin' | 'user' | null;
  isAdmin: boolean;
  currentVerse: Verse;
  songs: Song[];
  weeklySelection: {
    domingo: Song[];
    segunda: Song[];
  };
  rehearsalInfo: {
    day: string;
    time: string;
  };
  favorites: string[];
  lastSelectionDate: number | null;
  settings: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
    fontSize: number;
  };
  setRandomVerse: () => void;
  setUser: (user: { uid: string; email: string | null } | null) => void;
  syncWithFirebase: () => (() => void);
  addSong: (song: Omit<Song, 'id' | 'playCount' | 'lastPlayedDate'>) => void;
  updateSong: (songId: string, updates: Partial<Omit<Song, 'id'>>) => void;
  checkAndResetWeeklySetlist: (force?: boolean) => void;
  updateWeeklySelection: (selection: AppState['weeklySelection']) => void;
  updateRehearsalInfo: (info: AppState['rehearsalInfo']) => void;
  incrementPlayCount: (songId: string) => void;
  toggleFavorite: (songId: string) => void;
  deleteSong: (songId: string) => void;
  clearAllSongs: () => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  testFirebaseConnection: () => Promise<boolean>;
}

const initialSongs: Song[] = [];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      userRole: null,
      isAdmin: false,
      currentVerse: BIBLIA_CURADA[0],
      songs: initialSongs,
      weeklySelection: { domingo: [], segunda: [] },
      rehearsalInfo: { day: 'Sextas-feiras', time: '19:00' },
      favorites: [],
      lastSelectionDate: null,
      settings: {
        notifications: true,
        theme: 'system',
        fontSize: 16,
      },
      setRandomVerse: () => set((state) => ({
        currentVerse: BIBLIA_CURADA[Math.floor(Math.random() * BIBLIA_CURADA.length)]
      })),
      setUser: (user) => set({ user }),
      syncWithFirebase: () => {
        const { user } = get();
        if (!user) return () => {};

        let unsubscribes: (() => void)[] = [];

        try {
          // Listen for songs (louvores)
          const songsPath = 'louvores';
          const songsQuery = query(collection(db, songsPath), orderBy('playCount', 'desc'));
          
          const unsubscribeSongs = onSnapshot(songsQuery, (snapshot) => {
            const songsList = snapshot.docs.map(doc => ({
              ...sanitizeData(doc.data()),
              id: doc.id
            })) as Song[];
            set({ songs: songsList });
          }, (error) => {
            handleFirestoreError(error, OperationType.LIST, songsPath);
          });
          unsubscribes.push(unsubscribeSongs);

          // Listen for weekly selection (escalas)
          const weeklyPath = 'escalas';
          const unsubscribeWeekly = onSnapshot(doc(db, weeklyPath, 'current'), (snapshot) => {
            if (snapshot.exists()) {
              const data = sanitizeData(snapshot.data());
              set({ 
                weeklySelection: data.selection || { domingo: [], segunda: [] },
                lastSelectionDate: data.lastSelectionDate || null
              });
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, `${weeklyPath}/current`);
          });
          unsubscribes.push(unsubscribeWeekly);

          // Listen for user role and initialize if needed
          const userPath = `users/${user.uid}`;
          const unsubscribeRole = onSnapshot(doc(db, userPath), (snapshot) => {
            const masterEmails = ['duuhbr12@gmail.com', 'bruno_mendes_silva@outlook.com'];
            const isMasterAdmin = masterEmails.includes(user.email?.toLowerCase() || '');
            
            if (snapshot.exists()) {
              const data = sanitizeData(snapshot.data());
              set({ 
                userRole: data.role || 'user',
                isAdmin: data.role === 'admin' || isMasterAdmin
              });
            } else {
              // Initialize user if not exists
              const newUser = {
                email: user.email,
                role: isMasterAdmin ? 'admin' : 'user',
                createdAt: Date.now()
              };
              setDoc(doc(db, userPath), newUser).catch(err => {
                // If it fails, we still want the app to work, just log it
                console.error("Failed to initialize user document:", err?.message || String(err));
              });
            }
            
            // Register for push notifications
            registerForPushNotificationsAsync(user.uid).catch(e => console.error("Push registration error:", e?.message || String(e)));
          }, (error) => {
            // If this fails, the user might not have a document yet or permission issue
            console.warn("User role listener failed:", error?.message || String(error));
          });
          unsubscribes.push(unsubscribeRole);

          // Listen for rehearsal info
          const configPath = 'config/rehearsal';
          const unsubscribeRehearsal = onSnapshot(doc(db, configPath), (snapshot) => {
            if (snapshot.exists()) {
              set({ rehearsalInfo: sanitizeData(snapshot.data()) as AppState['rehearsalInfo'] });
            }
          }, (error) => {
            // Don't throw for rehearsal info, just log
            console.warn("Rehearsal info listener failed:", error?.message || String(error));
          });
          unsubscribes.push(unsubscribeRehearsal);

        } catch (error: any) {
          console.error("Error setting up Firebase listeners:", error?.message || String(error));
        }

        return () => {
          unsubscribes.forEach(unsub => unsub());
        };
      },
      addSong: async (songData) => {
        const songsPath = 'louvores';
        try {
          const { user } = get();
          const newSong = {
            ...songData,
            playCount: 0,
            lastPlayedDate: null,
            addedBy: user?.uid || 'anonymous',
            createdAt: Date.now()
          };
          await addDoc(collection(db, songsPath), newSong);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, songsPath);
        }
      },
      updateSong: async (songId, updates) => {
        const songPath = `louvores/${songId}`;
        try {
          await updateDoc(doc(db, songPath), updates);
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, songPath);
        }
      },
      updateWeeklySelection: async (selection) => {
        const weeklyPath = 'escalas/current';
        try {
          await updateDoc(doc(db, weeklyPath), {
            selection,
            updatedAt: Date.now()
          });
          // Notify users
          await sendPushNotification(
            'Escala Atualizada! 🎵',
            'A escala de louvores da semana foi alterada manualmente pela liderança.'
          );
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, weeklyPath);
        }
      },
      updateRehearsalInfo: async (info) => {
        const configPath = 'config/rehearsal';
        try {
          await setDoc(doc(db, configPath), info);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, configPath);
        }
      },
      checkAndResetWeeklySetlist: async (force = false) => {
        const { songs, lastSelectionDate, weeklySelection } = get();
        const now = Date.now();
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

        const diff = lastSelectionDate ? now - lastSelectionDate : SEVEN_DAYS;
        const needsReset = force || !lastSelectionDate || (diff >= SEVEN_DAYS);

        if (needsReset) {
          if (songs.length < 4) return;

          const currentSelectionIds = [
            ...weeklySelection.domingo.map(s => s.id),
            ...weeklySelection.segunda.map(s => s.id)
          ];

          const eligibleSongs = songs.filter(s => !currentSelectionIds.includes(s.id));
          const sourcePool = eligibleSongs.length >= 4 ? eligibleSongs : [...songs];
          const sortedPool = sourcePool.sort((a, b) => a.playCount - b.playCount);
          const candidates = sortedPool.slice(0, 8).sort(() => 0.5 - Math.random());
          const selected = candidates.slice(0, 4);
          const selectedIds = selected.map(s => s.id);

          const newWeeklySelection = {
            domingo: selected.slice(0, 2),
            segunda: selected.slice(2, 4)
          };

          try {
            const batch = writeBatch(db);
            
            // Update weekly selection doc
            batch.set(doc(db, 'escalas', 'current'), {
              selection: newWeeklySelection,
              lastSelectionDate: now,
              updatedAt: now
            });

            // Update play counts for selected songs
            selectedIds.forEach(id => {
              const song = songs.find(s => s.id === id);
              if (song) {
                batch.update(doc(db, 'louvores', id), {
                  playCount: (song.playCount || 0) + 1,
                  lastPlayedDate: now
                });
              }
            });

            await batch.commit();

            // Notify users
            await sendPushNotification(
              'Nova Escala Liberada! ✨',
              'Os louvores da semana foram sorteados. Confira agora no app!'
            );
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'escalas/current');
          }
        }
      },
      incrementPlayCount: async (songId) => {
        const { songs } = get();
        const song = songs.find(s => s.id === songId);
        if (song) {
          const songPath = `louvores/${songId}`;
          try {
            await updateDoc(doc(db, songPath), { 
              playCount: (song.playCount || 0) + 1 
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, songPath);
          }
        }
      },
      toggleFavorite: (songId) => set((state) => ({
        favorites: state.favorites.includes(songId)
          ? state.favorites.filter(id => id !== songId)
          : [...state.favorites, songId]
      })),
      deleteSong: async (songId) => {
        const songPath = `louvores/${songId}`;
        try {
          await deleteDoc(doc(db, songPath));
          // Clean up local favorites
          set((state) => ({
            favorites: state.favorites.filter(id => id !== songId)
          }));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, songPath);
        }
      },
      clearAllSongs: async () => {
        const { songs } = get();
        try {
          const batch = writeBatch(db);
          songs.forEach(song => {
            batch.delete(doc(db, 'louvores', song.id));
          });
          batch.delete(doc(db, 'escalas', 'current'));
          await batch.commit();
          // Clear local favorites
          set({ favorites: [] });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'louvores');
        }
      },
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      testFirebaseConnection: async () => {
        try {
          const testDoc = doc(db, 'config', 'connection_test');
          await getDoc(testDoc);
          return true;
        } catch (error: any) {
          console.error('Firebase connection test failed:', error?.message || String(error));
          return false;
        }
      },
    }),
    {
      name: 'firmados-mobile-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        favorites: state.favorites, 
        settings: state.settings,
        currentVerse: state.currentVerse
      }),
    }
  )
);
