import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Verse {
  text: string;
  reference: string;
}

export interface Song {
  id: string;
  title: string;
  url: string;
  theme: string;
  playCount: number;
  lastPlayedDate: number | null; // Timestamp of last time it was in a setlist
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
    darkMode: boolean;
    fontSize: number;
  };
  setRandomVerse: () => void;
  addSong: (song: Omit<Song, 'id' | 'playCount' | 'lastPlayedDate'>) => void;
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
  // Adicione centenas de versículos abaixo...
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
        darkMode: false,
        fontSize: 16,
      },
      setRandomVerse: () => set((state) => ({
        currentVerse: BIBLIA_CURADA[Math.floor(Math.random() * BIBLIA_CURADA.length)]
      })),
      addSong: (songData) => set((state) => ({
        songs: [...state.songs, { ...songData, id: Math.random().toString(36).substr(2, 9), playCount: 0, lastPlayedDate: null }]
      })),
      checkAndResetWeeklySetlist: (force = false) => {
        const { songs, lastSelectionDate, weeklySelection } = get();
        const now = Date.now();
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

        const diff = lastSelectionDate ? now - lastSelectionDate : SEVEN_DAYS;
        const daysPassed = Math.floor(diff / (24 * 60 * 60 * 1000));

        console.log(`[Ciclo Semanal] Verificando... Dias desde último sorteio: ${daysPassed}`);

        // Verifica se precisa resetar (7 dias se passaram ou é a primeira vez)
        const needsReset = force || !lastSelectionDate || (diff >= SEVEN_DAYS);

        if (needsReset) {
          console.log("[Ciclo Semanal] Reset Automático Iniciado!");
          if (songs.length < 4) {
            console.log("[Ciclo Semanal] Erro: Repertório insuficiente (< 4 músicas).");
            return;
          }

          // Peso Zero: Exclui músicas que estão na seleção atual para evitar repetição imediata
          const currentSelectionIds = [
            ...weeklySelection.domingo.map(s => s.id),
            ...weeklySelection.segunda.map(s => s.id)
          ];

          const eligibleSongs = songs.filter(s => !currentSelectionIds.includes(s.id));
          
          // Se o repertório for muito pequeno para excluir, usa todos
          const sourcePool = eligibleSongs.length >= 4 ? eligibleSongs : [...songs];
          
          // Sorteio Inteligente: Prioriza músicas menos tocadas no ano
          const sortedPool = sourcePool.sort((a, b) => a.playCount - b.playCount);
          
          // Pega um pool de candidatas (ex: as 8 menos tocadas) e embaralha
          const candidates = sortedPool.slice(0, 8).sort(() => 0.5 - Math.random());
          
          // Seleciona estritamente 4 louvores: 2+2
          const selected = candidates.slice(0, 4);
          const selectedIds = selected.map(s => s.id);

          // Atualiza metadados das músicas selecionadas
          const updatedSongs = songs.map(s => {
            if (selectedIds.includes(s.id)) {
              return { ...s, playCount: s.playCount + 1, lastPlayedDate: now };
            }
            return s;
          });

          set({ 
            songs: updatedSongs,
            weeklySelection: {
              domingo: selected.slice(0, 2),
              segunda: selected.slice(2, 4)
            }, 
            lastSelectionDate: now 
          });

          console.log("[Ciclo Semanal] Novo Repertório Gerado com Sucesso!");
          console.log("-> Domingo:", selected.slice(0, 2).map(s => s.title));
          console.log("-> Segunda:", selected.slice(2, 4).map(s => s.title));
        } else {
          console.log("[Ciclo Semanal] Ciclo ainda vigente. Próximo reset em", 7 - daysPassed, "dias.");
        }
      },
      incrementPlayCount: (songId) => set((state) => ({
        songs: state.songs.map(s => 
          s.id === songId ? { ...s, playCount: s.playCount + 1 } : s
        )
      })),
      toggleFavorite: (songId) => set((state) => ({
        favorites: state.favorites.includes(songId)
          ? state.favorites.filter(id => id !== songId)
          : [...state.favorites, songId]
      })),
      deleteSong: (songId) => set((state) => ({
        songs: state.songs.filter(s => s.id !== songId),
        favorites: state.favorites.filter(id => id !== songId),
        weeklySelection: {
          domingo: state.weeklySelection.domingo.filter(s => s.id !== songId),
          segunda: state.weeklySelection.segunda.filter(s => s.id !== songId),
        }
      })),
      clearAllSongs: () => set({
        songs: [],
        favorites: [],
        weeklySelection: { domingo: [], segunda: [] },
        lastSelectionDate: null
      }),
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
    }),
    {
      name: 'firmados-mobile-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
