import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StatusBar, Modal, ScrollView, TextInput, SafeAreaView, StyleSheet } from 'react-native';
import { Heart, Music, ChevronRight, Play, X, BookOpen, Edit3, ArrowLeft, Plus, Trash2, Search, Link as LinkIcon, AlertTriangle } from 'lucide-react-native';
import { useStore, Song } from '../store/useStore';
import StudyModal from '../components/StudyModal';
import { useTheme } from '../context/ThemeContext';

export default function Biblioteca() {
  const { songs, addSong, favorites, toggleFavorite, updateSong, deleteSong, clearAllSongs, settings, isAdmin } = useStore();
  const { colors, isDark, sfs } = useTheme();
// ... (keep rest of state)
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'delete' | 'clear';
  } | null>(null);
  const [newSong, setNewSong] = useState({ title: '', url: '', theme: 'ADORAÇÃO', lyrics: '' });
  const [isSearchingLyrics, setIsSearchingLyrics] = useState(false);
  const [showManualSearchConfirm, setShowManualSearchConfirm] = useState(false);

  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const rankedSongs = useMemo(() => {
    const filtered = songs.filter(song => 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.theme.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return [...filtered].sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
  }, [songs, searchQuery]);

  const handleAddSong = async () => {
    if (newSong.title && newSong.url) {
      let artist = '';
      let title = newSong.title;
      if (newSong.title.includes(' - ')) {
        const parts = newSong.title.split(' - ');
        title = parts[0].trim();
        artist = parts[1].trim();
      }

      // Se a letra estiver vazia e tivermos um artista, tenta buscar uma última vez
      let finalLyrics = newSong.lyrics;
      if (!finalLyrics && artist) {
        setIsSearchingLyrics(true);
        try {
          const response = await fetch(`https://api.vagalume.com.br/search.php?art=${encodeURIComponent(artist)}&mus=${encodeURIComponent(title)}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          if (data.type === 'exact' || data.type === 'aprox') {
            finalLyrics = data.mus[0].text;
          }
        } catch (e) {
          console.warn("Erro na busca final de letra (Vagalume pode estar fora do ar ou bloqueado): " + (e instanceof Error ? e.message : String(e)));
          // Não bloqueia o salvamento se a busca falhar
        } finally {
          setIsSearchingLyrics(false);
        }
      }

      addSong({
        title: title,
        artist: artist,
        url: newSong.url,
        theme: newSong.theme,
        lyrics: finalLyrics
      });
      setNewSong({ title: '', url: '', theme: 'ADORAÇÃO', lyrics: '' });
      setIsModalOpen(false);
    }
  };

  const searchVagalumeLyrics = async () => {
    if (!newSong.title || newSong.title.length < 3) return;
    
    setIsSearchingLyrics(true);
    try {
      // Limpeza básica da query para aumentar precisão
      let cleanQuery = newSong.title
        .replace(/\(.*\)/g, '') // Remove parênteses e conteúdo (ex: Ao Vivo)
        .replace(/\[.*\]/g, '') // Remove colchetes
        .replace(/feat\..*/gi, '') // Remove participações
        .trim();

      let artist = '';
      let title = cleanQuery;

      // Tenta extrair artista se estiver no formato "Música - Artista"
      if (cleanQuery.includes(' - ')) {
        const parts = cleanQuery.split(' - ');
        title = parts[0].trim();
        artist = parts[1].trim();
      }

      // Se não tiver artista, faz uma busca otimizada
      if (!artist) {
        const searchUrl = `https://api.vagalume.com.br/search.artmus?q=${encodeURIComponent(cleanQuery)}&limit=5`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        
        if (searchData.response && searchData.response.docs && searchData.response.docs.length > 0) {
          // Busca o primeiro documento que tenha título (música)
          const doc = searchData.response.docs.find((d: any) => d.title);
          if (doc) {
            title = doc.title;
            artist = doc.band;
          } else {
            throw new Error("Música não encontrada nos resultados");
          }
        } else {
          throw new Error("Nenhum resultado para a busca");
        }
      }

      // Busca a letra final com timeout para não travar
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de timeout

      try {
        const lyricsUrl = `https://api.vagalume.com.br/search.php?art=${encodeURIComponent(artist)}&mus=${encodeURIComponent(title)}`;
        const response = await fetch(lyricsUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (data.type === 'exact' || data.type === 'aprox') {
          const lyrics = data.mus[0].text;
          // Atualiza o título para o padrão encontrado se o usuário não usou o padrão (Música - Artista)
          if (!newSong.title.includes(' - ')) {
            setNewSong(prev => ({ ...prev, title: `${title} - ${artist}`, lyrics }));
          } else {
            setNewSong(prev => ({ ...prev, lyrics }));
          }
        } else {
          setShowManualSearchConfirm(true);
        }
      } catch (e) {
        console.warn("Erro na busca de letra (Vagalume): " + (e instanceof Error ? e.message : String(e)));
        setShowManualSearchConfirm(true);
      }
    } catch (error) {
      console.warn("Erro na busca otimizada: " + (error instanceof Error ? error.message : String(error)));
      setShowManualSearchConfirm(true);
    } finally {
      setIsSearchingLyrics(false);
    }
  };

  const handleClearAll = () => {
    setConfirmConfig({
      title: "Limpar Repertório",
      message: "Tem certeza que deseja remover TODOS os louvores? Esta ação não pode ser desfeita.",
      type: 'clear',
      onConfirm: () => {
        clearAllSongs();
        setIsConfirmOpen(false);
      }
    });
    setIsConfirmOpen(true);
  };

  const handleDeleteSong = (id: string, title: string) => {
    setConfirmConfig({
      title: "Remover Louvor",
      message: `Deseja remover "${title}" do repertório?`,
      type: 'delete',
      onConfirm: () => {
        deleteSong(id);
        setIsConfirmOpen(false);
      }
    });
    setIsConfirmOpen(true);
  };

  const handleOpenStudy = (song: Song) => {
    setSelectedSong(song);
  };

  const SongItem = ({ item, index }: { item: Song; index: number }) => (
    <View>
      <TouchableOpacity 
        style={[styles.songCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        activeOpacity={0.7}
        onPress={() => handleOpenStudy(item)}
      >
        <View style={styles.songInfoContainer}>
          <View style={[styles.musicIconBg, { backgroundColor: isDark ? '#121212' : '#F0F9FF' }]}>
            <Music size={20} color={isDark ? colors.primary : '#0077B6'} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title.split(' - ')[0].trim()}
            </Text>
            {item.artist ? (
              <Text style={{ fontSize: 10, color: colors.subtitle, fontWeight: '600', marginTop: 2 }}>{item.artist}</Text>
            ) : null}
            <View style={styles.songMeta}>
              <View style={[styles.themeBadge, { backgroundColor: isDark ? '#121212' : '#E0F2FE', borderColor: isDark ? colors.primary : 'transparent', borderWidth: isDark ? 1 : 0 }]}>
                <Text style={[styles.themeText, { color: isDark ? colors.primary : '#0284C7' }]}>
                  {item.theme}
                </Text>
              </View>
              <Text style={[styles.dot, { color: colors.subtitle }]}>•</Text>
              <Text style={[styles.playCountText, { color: colors.subtitle }]}>
                {item.playCount} execuções
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={() => toggleFavorite(item.id)}
            style={styles.favoriteButton}
          >
            <Heart 
              size={18} 
              color={favorites.includes(item.id) ? "#FF006E" : colors.subtitle} 
              fill={favorites.includes(item.id) ? "#FF006E" : "transparent"}
            />
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity 
              onPress={() => handleDeleteSong(item.id, item.title)}
              style={[styles.deleteButton, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2' }]}
            >
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );

  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 24,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    headerIconBg: {
      padding: 8,
      borderRadius: 12,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: sfs(22),
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: -1,
    },
    subtitle: {
      fontSize: sfs(12),
      fontWeight: '700',
      marginLeft: 4,
    },
    listContent: {
      paddingBottom: 40,
    },
    songCard: {
      marginHorizontal: 24,
      marginBottom: 16,
      padding: 20,
      borderRadius: 32,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 3,
    },
    songInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    musicIconBg: {
      padding: 12,
      borderRadius: 16,
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    songTitle: {
      fontWeight: '900',
      fontSize: sfs(16),
      letterSpacing: -0.5,
    },
    songMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    themeBadge: {
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 4,
    },
    themeText: {
      fontSize: sfs(8),
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    dot: {
      fontSize: sfs(10),
      marginHorizontal: 6,
    },
    playCountText: {
      fontSize: sfs(8),
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    favoriteButton: {
      padding: 8,
      marginRight: 8,
    },
    deleteButton: {
      padding: 8,
      borderRadius: 12,
    },
    clearAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
    },
    clearAllText: {
      color: '#EF4444',
      fontSize: sfs(10),
      fontWeight: '900',
      marginLeft: 6,
      textTransform: 'uppercase',
    },
    chevronBg: {
      padding: 8,
      borderRadius: 20,
    },
    emptyContainer: {
      padding: 60,
      alignItems: 'center',
    },
    emptyText: {
      fontWeight: '600',
      marginTop: 16,
      textAlign: 'center',
      lineHeight: 20,
      fontSize: sfs(14),
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
      borderWidth: 1,
      marginTop: 16,
    },
    searchInput: {
      flex: 1,
      marginLeft: 12,
      fontWeight: '700',
    },
    fabContainer: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      zIndex: 2000,
    },
    fab: {
      width: 52,
      height: 52,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 8,
    },
    confirmOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    confirmContent: {
      borderRadius: 32,
      padding: 32,
      alignItems: 'center',
      width: '100%',
    },
    confirmIconBg: {
      padding: 16,
      borderRadius: 20,
      marginBottom: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmTitle: {
      fontSize: sfs(22),
      fontWeight: '900',
      marginBottom: 12,
      textAlign: 'center',
    },
    confirmMessage: {
      fontSize: sfs(15),
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 32,
    },
    confirmActions: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    cancelBtn: {
      flex: 1,
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
    },
    cancelBtnText: {
      fontWeight: '800',
      fontSize: sfs(14),
    },
    confirmBtn: {
      flex: 1,
      padding: 16,
      borderRadius: 16,
      backgroundColor: '#EF4444',
      alignItems: 'center',
    },
    confirmBtnText: {
      color: 'white',
      fontWeight: '800',
      fontSize: sfs(14),
    },
    modalOverlay: {
      flex: 1,
    },
    modalContent: {
      flex: 1,
      padding: 24,
    },
    modalHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 12,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: sfs(24),
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: -0.5,
    },
    modalSubtitle: {
      fontSize: sfs(10),
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 3,
    },
    closeButton: {
      padding: 12,
      borderRadius: 16,
    },
    inputGroup: {
      marginBottom: 14,
    },
    inputLabel: {
      fontSize: sfs(10),
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 3,
    },
    textInput: {
      borderRadius: 16,
      padding: 12,
      fontWeight: '700',
      fontSize: sfs(16),
      borderWidth: 1,
    },
    urlInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      paddingHorizontal: 20,
      borderWidth: 1,
    },
    urlInput: {
      flex: 1,
      padding: 12,
      fontWeight: '700',
      fontSize: sfs(14),
    },
    themeGroup: {
      marginBottom: 16,
    },
    themeOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 16,
    },
    themeOption: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 16,
      borderWidth: 1,
    },
    themeOptionActive: {
    },
    themeOptionText: {
      fontSize: sfs(12),
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    themeOptionTextActive: {
      color: 'white',
    },
    submitButton: {
      padding: 20,
      borderRadius: 20,
      alignItems: 'center',
      marginTop: 8,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 8,
    },
    submitButtonText: {
      color: 'white',
      fontSize: sfs(18),
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
  }), [sfs]);

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={[styles.headerIconBg, { backgroundColor: colors.primary }]}>
              <BookOpen size={20} color={isDark ? "black" : "#FFD700"} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Biblioteca</Text>
          </View>
          {isAdmin && songs.length > 0 && (
            <TouchableOpacity onPress={() => handleClearAll()} style={[styles.clearAllBtn, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2' }]}>
              <Trash2 size={16} color="#EF4444" />
              <Text style={styles.clearAllText}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.subtitle, { color: colors.subtitle }]}>Repertório Ranqueado por Frequência</Text>

        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={20} color={colors.subtitle} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar por título ou tema..."
            placeholderTextColor={colors.subtitle}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={rankedSongs}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <SongItem item={item} index={index} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Music size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.subtitle }]}>
              Nenhum louvor cadastrado na sua Biblioteca.
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.fabContainer}>
        <TouchableOpacity 
          onPress={() => setIsModalOpen(true)}
          style={[styles.fab, { backgroundColor: isDark ? colors.blue : colors.primary, shadowColor: isDark ? colors.blue : colors.primary }]}
          activeOpacity={0.8}
        >
          <Plus size={24} color={isDark ? 'white' : '#FFD700'} strokeWidth={3} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.card }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
              
              <View style={styles.modalHeader}>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text, fontSize: sfs(20) }]}>Novo Louvor</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.secondary, fontSize: sfs(9) }]}>Adicionar ao Repertório</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setIsModalOpen(false)}
                  style={[styles.closeButton, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
                >
                  <X size={24} color={colors.subtitle} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.secondary, fontSize: sfs(9) }]}>Título do Louvor</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', color: colors.text, borderColor: colors.border, fontSize: sfs(16) }]}
                    placeholder="Ex: Música - Artista"
                    placeholderTextColor={colors.subtitle}
                    value={newSong.title}
                    onChangeText={(text) => setNewSong({ ...newSong, title: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.secondary, fontSize: sfs(9) }]}>Link do YouTube</Text>
                  <View style={[styles.urlInputContainer, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
                    <LinkIcon size={20} color={colors.subtitle} />
                    <TextInput
                      style={[styles.urlInput, { color: colors.text, fontSize: sfs(12) }]}
                      placeholder="https://youtube.com/..."
                      placeholderTextColor={colors.subtitle}
                      value={newSong.url}
                      onChangeText={(text) => setNewSong({ ...newSong, url: text })}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.inputLabel, { color: colors.secondary, fontSize: Math.max(9, settings.fontSize * 0.5) }]}>Letra da Música</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {isSearchingLyrics && <Text style={{ fontSize: sfs(10), color: colors.secondary, fontWeight: 'bold' }}>Buscando...</Text>}
                      <TouchableOpacity onPress={() => searchVagalumeLyrics()} style={{ backgroundColor: isDark ? colors.blue : '#F0F9FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                        <Text style={{ fontSize: sfs(10), color: isDark ? 'white' : colors.secondary, fontWeight: '900' }}>BUSCAR AGORA</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', color: colors.text, borderColor: colors.border, height: 100, textAlignVertical: 'top', paddingTop: 12, fontSize: sfs(16) }]}
                    placeholder="A letra aparecerá aqui automaticamente ou cole manualmente..."
                    placeholderTextColor={colors.subtitle}
                    multiline
                    value={newSong.lyrics}
                    onChangeText={(text) => setNewSong({ ...newSong, lyrics: text })}
                  />
                </View>

                <View style={styles.themeGroup}>
                  <Text style={[styles.inputLabel, { color: colors.secondary, fontSize: sfs(9) }]}>Temática / Estilo</Text>
                  <View style={styles.themeOptions}>
                    {['ADORAÇÃO', 'CELEBRAÇÃO', 'CORINHO DE FOGO', 'SANTA CEIA', 'CORINHO'].map((theme) => (
                      <TouchableOpacity
                        key={theme}
                        onPress={() => setNewSong({ ...newSong, theme })}
                        style={[
                          styles.themeOption,
                          { borderColor: colors.border },
                          newSong.theme === theme && [styles.themeOptionActive, { backgroundColor: isDark ? colors.blue : colors.primary, borderColor: isDark ? colors.blue : colors.primary }]
                        ]}
                      >
                        <Text style={[
                          styles.themeOptionText,
                          { color: colors.subtitle, fontSize: sfs(10) },
                          newSong.theme === theme && [styles.themeOptionTextActive, { color: 'white' }]
                        ]}>
                          {theme}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleAddSong()}
                  style={[styles.submitButton, { backgroundColor: isDark ? colors.blue : colors.primary }]}
                >
                  <Text style={[styles.submitButtonText, { color: 'white', fontSize: sfs(14) }]}>Adicionar Louvor</Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Modal de Confirmação de Busca Manual - Movido para dentro para sobrepor corretamente */}
              <Modal
                visible={showManualSearchConfirm}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowManualSearchConfirm(false)}
              >
                <View style={[styles.confirmOverlay, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(3, 4, 94, 0.6)' }]}>
                  <View style={{ width: '100%', maxWidth: 400 }}>
                    <View style={[styles.confirmContent, { backgroundColor: colors.card }]}>
                      <View style={[styles.confirmIconBg, { backgroundColor: isDark ? '#1E293B' : '#F0F9FF' }]}>
                        <AlertTriangle size={32} color={colors.secondary} />
                      </View>
                      <Text style={[styles.confirmTitle, { color: colors.text }]}>Letra não encontrada</Text>
                      <Text style={[styles.confirmMessage, { color: colors.subtitle }]}>
                        Não conseguimos encontrar a letra automaticamente. Deseja realizar uma busca manual ou preencher agora?
                      </Text>
                      
                      <View style={styles.confirmActions}>
                        <TouchableOpacity 
                          onPress={() => setShowManualSearchConfirm(false)}
                          style={[styles.cancelBtn, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
                        >
                          <Text style={[styles.cancelBtnText, { color: colors.subtitle }]}>Não, depois</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => {
                            setShowManualSearchConfirm(false);
                          }}
                          style={[styles.confirmBtn, { backgroundColor: colors.secondary }]}
                        >
                          <Text style={styles.confirmBtnText}>Sim, Manual</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <StudyModal 
        visible={!!selectedSong}
        song={selectedSong}
        onClose={() => setSelectedSong(null)}
        onUpdate={(id, updates) => {
          updateSong(id, updates);
          if (selectedSong && selectedSong.id === id) {
            setSelectedSong({ ...selectedSong, ...updates });
          }
        }}
      />

      {/* Modal de Confirmação Customizado */}
      <Modal
        visible={isConfirmOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsConfirmOpen(false)}
      >
        <View style={[styles.confirmOverlay, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(3, 4, 94, 0.6)' }]}>
          <View style={{ width: '100%', maxWidth: 400 }}>
            <View style={[styles.confirmContent, { backgroundColor: colors.card }]}>
              <View style={[styles.confirmIconBg, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2' }]}>
                <AlertTriangle size={32} color="#EF4444" />
              </View>
              <Text style={[styles.confirmTitle, { color: colors.text, fontSize: sfs(16) }]}>{confirmConfig?.title}</Text>
              <Text style={[styles.confirmMessage, { color: colors.subtitle, fontSize: sfs(12) }]}>{confirmConfig?.message}</Text>
              
              <View style={styles.confirmActions}>
                <TouchableOpacity 
                  onPress={() => setIsConfirmOpen(false)}
                  style={[styles.cancelBtn, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
                >
                  <Text style={[styles.cancelBtnText, { color: colors.subtitle, fontSize: sfs(12) }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => confirmConfig?.onConfirm?.()}
                  style={styles.confirmBtn}
                >
                  <Text style={[styles.confirmBtnText, { fontSize: sfs(12) }]}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


