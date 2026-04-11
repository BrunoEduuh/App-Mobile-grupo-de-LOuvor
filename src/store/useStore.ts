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

enum OperationType {
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

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // We don't throw here to avoid crashing the whole app, but we log it clearly
}

interface Verse {
  text: string;
  reference: string;
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
  incrementPlayCount: (songId: string) => void;
  toggleFavorite: (songId: string) => void;
  deleteSong: (songId: string) => void;
  clearAllSongs: () => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
}

/**
 * BASE BÍBLICA INTEGRAL - GÊNESIS A APOCALIPSE
 * Estrutura preparada para suportar centenas de textos curados.
 */
const BIBLIA_CURADA: Verse[] = [
  { text: "No princípio, criou Deus os céus e a terra.", reference: "Gênesis 1:1" },
  { text: "O Senhor é o meu pastor; nada me faltará.", reference: "Salmos 23:1" },
  { text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.", reference: "João 3:16" },
  { text: "Eu sou o Alfa e o Ômega, o Princípio e o Fim, diz o Senhor.", reference: "Apocalipse 1:8" },
  { text: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13" },
  { text: "O temor do Senhor é o princípio da sabedoria.", reference: "Provérbios 1:7" },
  { text: "Consagra ao Senhor as tuas obras, e teus pensamentos serão estabelecidos.", reference: "Provérbios 16:3" },
  { text: "Eis que faço novas todas as coisas.", reference: "Apocalipse 21:5" },
  { text: "Sê forte e corajoso; não temas, nem te espantes.", reference: "Josué 1:9" },
  { text: "A graça do Senhor Jesus seja com todos. Amém.", reference: "Apocalipse 22:21" },
];

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
        
        // Listen for songs (louvores)
        const songsPath = 'louvores';
        const songsQuery = query(collection(db, songsPath), orderBy('playCount', 'desc'));
        
        const unsubscribeSongs = onSnapshot(songsQuery, (snapshot) => {
          const songsList = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          })) as Song[];
          set({ songs: songsList });
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, songsPath);
        });

        // Listen for weekly selection (escalas)
        const weeklyPath = 'escalas';
        const unsubscribeWeekly = onSnapshot(doc(db, weeklyPath, 'current'), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            set({ 
              weeklySelection: data.selection || { domingo: [], segunda: [] },
              lastSelectionDate: data.lastSelectionDate || null
            });
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `${weeklyPath}/current`);
        });

        // Listen for user role if user is logged in
        let unsubscribeRole = () => {};
        if (user) {
          const userPath = `users/${user.uid}`;
          unsubscribeRole = onSnapshot(doc(db, userPath), (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              const isMasterAdmin = user.email === 'duuhbr12@gmail.com';
              set({ 
                userRole: data.role || 'user',
                isAdmin: data.role === 'admin' || isMasterAdmin
              });
            } else {
              // Initialize user if not exists
              const isMasterAdmin = user.email === 'duuhbr12@gmail.com';
              const newUser = {
                email: user.email,
                role: isMasterAdmin ? 'admin' : 'user',
                createdAt: Date.now()
              };
              setDoc(doc(db, userPath), newUser).catch(err => {
                handleFirestoreError(err, OperationType.CREATE, userPath);
              });
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, userPath);
          });
        } else {
          set({ userRole: null, isAdmin: false });
        }

        return () => {
          unsubscribeSongs();
          unsubscribeWeekly();
          unsubscribeRole();
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
