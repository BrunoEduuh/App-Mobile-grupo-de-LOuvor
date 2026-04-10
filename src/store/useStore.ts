import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, set as dbSet, push, onValue, remove, update } from 'firebase/database';
import { database } from '../lib/firebase';

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
  syncWithFirebase: () => void;
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
      syncWithFirebase: () => {
        const songsRef = ref(database, 'songs');
        const weeklyRef = ref(database, 'weeklySelection');
        const lastDateRef = ref(database, 'lastSelectionDate');

        onValue(songsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const songsList = Object.keys(data).map(key => ({
              ...data[key],
              id: key
            }));
            set({ songs: songsList });
          } else {
            set({ songs: [] });
          }
        });

        onValue(weeklyRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            set({ weeklySelection: data });
          }
        });

        onValue(lastDateRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            set({ lastSelectionDate: data });
          }
        });
      },
      addSong: (songData) => {
        const songsRef = ref(database, 'songs');
        const newSongRef = push(songsRef);
        const newSong = {
          ...songData,
          playCount: 0,
          lastPlayedDate: null
        };
        dbSet(newSongRef, newSong);
      },
      updateSong: (songId, updates) => {
        const songRef = ref(database, `songs/${songId}`);
        update(songRef, updates);
      },
      checkAndResetWeeklySetlist: (force = false) => {
        const { songs, lastSelectionDate, weeklySelection } = get();
        const now = Date.now();
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

        const diff = lastSelectionDate ? now - lastSelectionDate : SEVEN_DAYS;
        const daysPassed = Math.floor(diff / (24 * 60 * 60 * 1000));

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

          // Update Firebase
          const newWeeklySelection = {
            domingo: selected.slice(0, 2),
            segunda: selected.slice(2, 4)
          };

          dbSet(ref(database, 'weeklySelection'), newWeeklySelection);
          dbSet(ref(database, 'lastSelectionDate'), now);

          selectedIds.forEach(id => {
            const song = songs.find(s => s.id === id);
            if (song) {
              const songRef = ref(database, `songs/${id}`);
              update(songRef, { 
                playCount: (song.playCount || 0) + 1, 
                lastPlayedDate: now 
              });
            }
          });
        }
      },
      incrementPlayCount: (songId) => {
        const { songs } = get();
        const song = songs.find(s => s.id === songId);
        if (song) {
          const songRef = ref(database, `songs/${songId}`);
          update(songRef, { playCount: (song.playCount || 0) + 1 });
        }
      },
      toggleFavorite: (songId) => set((state) => ({
        favorites: state.favorites.includes(songId)
          ? state.favorites.filter(id => id !== songId)
          : [...state.favorites, songId]
      })),
      deleteSong: (songId) => {
        const songRef = ref(database, `songs/${songId}`);
        remove(songRef);
      },
      clearAllSongs: () => {
        remove(ref(database, 'songs'));
        remove(ref(database, 'weeklySelection'));
        remove(ref(database, 'lastSelectionDate'));
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
