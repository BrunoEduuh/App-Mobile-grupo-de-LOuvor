import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StatusBar, Modal, ScrollView, StyleSheet, Linking, SafeAreaView, Alert } from 'react-native';
import { Search, Music, ChevronRight, X, Heart, Play, ArrowLeft, BookOpen, Edit3, Save, Calendar, Clock, RefreshCw } from 'lucide-react-native';
import { useStore, Song } from '../store/useStore';
import StudyModal from '../components/StudyModal';
import { useTheme } from '../context/ThemeContext';

export default function Escala() {
  const { 
    weeklySelection, 
    favorites, 
    toggleFavorite, 
    updateSong, 
    settings, 
    isAdmin, 
    user,
    songs,
    rehearsalInfo,
    updateRehearsalInfo,
    updateWeeklySelection,
    checkAndResetWeeklySetlist 
  } = useStore();
  
  const { colors, isDark, sfs } = useTheme();
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  
  // Master Admin check
  const masterEmails = ['duuhbr12@gmail.com', 'bruno_mendes_silva@outlook.com'];
  const isMasterAdmin = masterEmails.includes(user?.email?.toLowerCase() || '');

  const [editRehearsal, setEditRehearsal] = useState(rehearsalInfo);
  const [editSelection, setEditSelection] = useState(weeklySelection);

  const weeklySongs = useMemo(() => {
    return [...weeklySelection.domingo, ...weeklySelection.segunda];
  }, [weeklySelection]);

  const handleOpenManage = () => {
    setEditRehearsal(rehearsalInfo);
    setEditSelection(weeklySelection);
    setIsManageModalOpen(true);
  };

  const handleSaveManagement = async () => {
    try {
      await updateRehearsalInfo(editRehearsal);
      await updateWeeklySelection(editSelection);
      setIsManageModalOpen(false);
      setTimeout(() => {
        Alert.alert('Sucesso', 'Alterações salvas com sucesso!');
      }, 500);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  const toggleSongInSelection = (song: Song, day: 'domingo' | 'segunda') => {
    const currentDaySongs = editSelection[day];
    const isSelected = currentDaySongs.some(s => s.id === song.id);
    
    if (isSelected) {
      setEditSelection({
        ...editSelection,
        [day]: currentDaySongs.filter(s => s.id !== song.id)
      });
    } else {
      if (currentDaySongs.length >= 2) {
        Alert.alert('Limite atingido', 'Cada dia pode ter no máximo 2 louvores.');
        return;
      }
      setEditSelection({
        ...editSelection,
        [day]: [...currentDaySongs, song]
      });
    }
  };

  const SongItem = ({ item, index }: { item: Song; index: number }) => {
    const isFavorite = favorites.includes(item.id);
    
    return (
      <View>
        <TouchableOpacity 
          style={[styles.songCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.7}
          onPress={() => setSelectedSong(item)}
        >
          <View style={styles.songInfoContainer}>
            <View style={[styles.musicIconBg, { backgroundColor: isDark ? '#121212' : '#F0F9FF' }]}>
              <Music size={20} color={isDark ? colors.primary : '#0077B6'} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.songTitle, { color: colors.text, fontSize: sfs(16) }]} numberOfLines={1}>
                {item.title.split(' - ')[0].trim()}
              </Text>
              {item.artist ? (
                <Text style={{ fontSize: sfs(10), color: colors.subtitle, fontWeight: '600', marginTop: 2 }}>{item.artist}</Text>
              ) : null}
              <View style={styles.songMeta}>
                <View style={[styles.themeBadge, { backgroundColor: isDark ? '#121212' : '#E0F2FE', borderColor: isDark ? colors.primary : 'transparent', borderWidth: isDark ? 1 : 0 }]}>
                  <Text style={[styles.themeText, { color: isDark ? colors.primary : '#0284C7', fontSize: sfs(8) }]}>
                    {item.theme}
                  </Text>
                </View>
                <Text style={[styles.dot, { color: colors.subtitle, fontSize: sfs(10) }]}>•</Text>
                <Text style={[styles.playCountText, { color: colors.subtitle, fontSize: sfs(8) }]}>
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
                color={isFavorite ? '#FF006E' : colors.subtitle} 
                fill={isFavorite ? '#FF006E' : 'transparent'}
              />
            </TouchableOpacity>
            <View style={[styles.chevronBg, { backgroundColor: isDark ? '#121212' : '#F8FAFC' }]}>
              <ChevronRight size={18} color={colors.subtitle} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

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
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    resetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      gap: 6,
    },
    resetText: {
      fontSize: sfs(12),
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    headerIconBg: {
      padding: 8,
      borderRadius: 12,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: sfs(24),
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: -1,
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
    },
    searchInput: {
      flex: 1,
      marginLeft: 12,
      fontWeight: '700',
      fontSize: sfs(16),
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
      marginRight: 4,
    },
    chevronBg: {
      padding: 8,
      borderRadius: 20,
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      fontWeight: '600',
      marginTop: 16,
      textAlign: 'center',
      fontSize: sfs(14),
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 24,
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
      justifyContent: 'space-between',
    },
    backButton: {
      padding: 8,
      backgroundColor: '#F1F5F9',
      borderRadius: 12,
    },
    saveButton: {
      padding: 10,
      borderRadius: 12,
    },
    modalTitle: {
      fontSize: sfs(20),
      fontWeight: '900',
      color: '#03045E',
    },
    manageSection: {
      marginBottom: 32,
    },
    manageSectionTitle: {
      fontSize: sfs(10),
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 2,
      marginBottom: 12,
    },
    manageCard: {
      borderRadius: 24,
      padding: 8,
      borderWidth: 1,
    },
    inputGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
    },
    manageInput: {
      flex: 1,
      fontSize: sfs(14),
      fontWeight: '700',
    },
    divider: {
      height: 1,
      marginHorizontal: 16,
    },
    daySubTitle: {
      fontSize: sfs(14),
      fontWeight: '800',
      marginBottom: 12,
    },
    selectionPool: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    poolItem: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      maxWidth: '48%',
    },
    poolItemText: {
      fontSize: sfs(10),
      fontWeight: '800',
    },
    autoResetBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      padding: 6,
      borderRadius: 8,
      backgroundColor: 'rgba(2, 62, 138, 0.05)',
    },
  }), [sfs]);

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={[styles.headerIconBg, { backgroundColor: colors.primary }]}>
              <Music size={20} color={isDark ? "black" : "#FFD700"} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text, fontSize: sfs(24) }]}>Escala da Semana</Text>
          </View>
          {isMasterAdmin && (
            <TouchableOpacity 
              onPress={handleOpenManage}
              style={[styles.resetButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
            >
              <Edit3 size={16} color={colors.primary} />
              <Text style={[styles.resetText, { color: colors.primary }]}>Gerenciar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={weeklySongs}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <SongItem item={item} index={index} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Music size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.subtitle }]}>
              Nenhum louvor na escala desta semana.
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={isManageModalOpen}
        animationType="slide"
        onRequestClose={() => setIsManageModalOpen(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity 
              onPress={() => setIsManageModalOpen(false)}
              style={[styles.backButton, { backgroundColor: colors.border }]}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Gerenciar Escala</Text>
            <TouchableOpacity 
              onPress={handleSaveManagement}
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
            >
              <Save size={20} color={isDark ? "black" : "white"} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
            <View style={styles.manageSection}>
              <Text style={[styles.manageSectionTitle, { color: colors.secondary }]}>Informações do Ensaio</Text>
              <View style={[styles.manageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.inputGroup}>
                  <Calendar size={18} color={colors.subtitle} />
                  <TextInput
                    style={[styles.manageInput, { color: colors.text }]}
                    value={editRehearsal.day}
                    onChangeText={(text) => setEditRehearsal({ ...editRehearsal, day: text })}
                    placeholder="Dia do ensaio (ex: Sextas-feiras)"
                    placeholderTextColor={colors.subtitle}
                  />
                </View>
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                <View style={styles.inputGroup}>
                  <Clock size={18} color={colors.subtitle} />
                  <TextInput
                    style={[styles.manageInput, { color: colors.text }]}
                    value={editRehearsal.time}
                    onChangeText={(text) => setEditRehearsal({ ...editRehearsal, time: text })}
                    placeholder="Horário (ex: 19:00)"
                    placeholderTextColor={colors.subtitle}
                  />
                </View>
              </View>
            </View>

            <View style={styles.manageSection}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={[styles.manageSectionTitle, { color: colors.secondary, marginBottom: 0 }]}>Seleção de Louvores</Text>
                <TouchableOpacity 
                  onPress={async () => {
                    await checkAndResetWeeklySetlist(true);
                    // After auto-reset, we sync the local edit state with the new selection
                    setEditSelection(useStore.getState().weeklySelection);
                  }}
                  style={styles.autoResetBtn}
                >
                  <RefreshCw size={14} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>AUTO RESET</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.daySubTitle, { color: colors.text }]}>Domingo (Máx 2)</Text>
              <View style={styles.selectionPool}>
                {songs.map(song => {
                  const isSelected = editSelection.domingo.some(s => s.id === song.id);
                  return (
                    <TouchableOpacity
                      key={`dom-${song.id}`}
                      onPress={() => toggleSongInSelection(song, 'domingo')}
                      style={[
                        styles.poolItem, 
                        { backgroundColor: isSelected ? colors.primary : colors.card, borderColor: isSelected ? colors.primary : colors.border }
                      ]}
                    >
                      <Text style={[styles.poolItemText, { color: isSelected ? (isDark ? 'black' : 'white') : colors.text }]} numberOfLines={1}>
                        {song.title.split(' - ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.daySubTitle, { color: colors.text, marginTop: 24 }]}>Segunda (Máx 2)</Text>
              <View style={styles.selectionPool}>
                {songs.map(song => {
                  const isSelected = editSelection.segunda.some(s => s.id === song.id);
                  return (
                    <TouchableOpacity
                      key={`seg-${song.id}`}
                      onPress={() => toggleSongInSelection(song, 'segunda')}
                      style={[
                        styles.poolItem, 
                        { backgroundColor: isSelected ? colors.primary : colors.card, borderColor: isSelected ? colors.primary : colors.border }
                      ]}
                    >
                      <Text style={[styles.poolItemText, { color: isSelected ? (isDark ? 'black' : 'white') : colors.text }]} numberOfLines={1}>
                        {song.title.split(' - ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
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
    </View>
  );
}


