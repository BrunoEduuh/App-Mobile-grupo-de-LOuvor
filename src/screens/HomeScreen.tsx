import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet, ScrollView, Linking, Modal, FlatList, Image } from 'react-native';
import { Anchor, Sparkles, RefreshCw, Calendar, Music, Play, ChevronRight, Unlock, Lightbulb, BarChart3, Heart, ArrowLeft } from 'lucide-react-native';
import { useStore, Song } from '../store/useStore';
import StudyModal from '../components/StudyModal';
import { useTheme } from '../context/ThemeContext';
import { REFLECTIONS, MUSICAL_TIPS } from '../constants/content';

interface HomeScreenProps {
  onNavigate?: (tab: 'home' | 'library' | 'favorites' | 'settings') => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { 
    currentVerse, 
    setRandomVerse, 
    checkAndResetWeeklySetlist, 
    songs, 
    favorites, 
    weeklySelection,
    lastSelectionDate,
    updateSong,
    settings,
    rehearsalInfo
  } = useStore();

  const { colors, isDark, sfs } = useTheme();
  const [reflection, setReflection] = useState(REFLECTIONS[0]);
  const [musicalTip, setMusicalTip] = useState(MUSICAL_TIPS[0]);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const favoriteSongs = useMemo(() => {
    return songs.filter(song => favorites.includes(song.id));
  }, [songs, favorites]);

  useEffect(() => {
    checkAndResetWeeklySetlist();
    setReflection(REFLECTIONS[Math.floor(Math.random() * REFLECTIONS.length)]);
    setMusicalTip(MUSICAL_TIPS[Math.floor(Math.random() * MUSICAL_TIPS.length)]);
    
    // Test Firebase connection
    useStore.getState().testFirebaseConnection().then(success => {
      if (success) {
        console.log('✅ Firebase conectado com sucesso!');
      } else {
        console.warn('⚠️ Falha na conexão com Firebase. Verifique as configurações.');
      }
    });
  }, []);

  const SongMiniCard = ({ song }: { song: Song }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => setSelectedSong(song)}
    >
      <View style={[styles.miniSongCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.miniSongIcon, { backgroundColor: isDark ? '#121212' : '#F0F9FF' }]}>
          <Music size={14} color={isDark ? colors.primary : '#0284C7'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.miniSongTitle, { color: colors.text }]} numberOfLines={1}>
            {song.title.split(' - ')[0].trim()}
          </Text>
          <Text style={[styles.miniSongTheme, { color: colors.subtitle }]}>{song.theme}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => {
            if (song.url) {
              Linking.openURL(song.url);
            }
          }}
          style={[styles.playButton, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2' }]}
        >
          <Play size={14} color="#EF4444" fill="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      height: '100%',
      width: '100%',
    },
    scrollContent: {
      padding: 24,
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
      marginTop: 8,
    },
    welcomeText: {
      fontSize: sfs(14),
      color: '#94A3B8',
      fontWeight: '700',
    },
    brandText: {
      fontSize: sfs(24),
      fontWeight: '900',
      color: '#03045E',
      letterSpacing: -0.5,
    },
    profileIcon: {
      padding: 0,
      borderRadius: 20,
      overflow: 'hidden',
    },
    verseCard: {
      backgroundColor: 'white',
      borderRadius: 32,
      padding: 24,
      marginBottom: 32,
      borderWidth: 1,
      borderColor: '#F1F5F9',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.05,
      shadowRadius: 20,
      elevation: 4,
    },
    verseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    verseLabel: {
      color: '#0284C7',
      fontSize: sfs(10),
      fontWeight: '900',
      letterSpacing: 2,
      marginLeft: 8,
    },
    verseText: {
      color: '#03045E',
      fontSize: sfs(18),
      fontStyle: 'italic',
      lineHeight: 26,
      fontWeight: '600',
      marginBottom: 20,
    },
    verseFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: '#F1F5F9',
      paddingTop: 16,
    },
    reference: {
      color: '#94A3B8',
      fontSize: sfs(12),
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    miniRefresh: {
      backgroundColor: '#F0F9FF',
      padding: 8,
      borderRadius: 12,
    },
    sectionHeader: {
      marginTop: 8,
      marginBottom: 16,
      marginLeft: 4,
    },
    sectionTitle: {
      fontSize: sfs(10),
      fontWeight: '900',
      color: '#0284C7',
      textTransform: 'uppercase',
      letterSpacing: 3,
    },
    daysContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 32,
    },
    dayColumn: {
      flex: 1,
    },
    dayHeader: {
      backgroundColor: '#03045E',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 12,
      alignSelf: 'flex-start',
    },
    dayLabel: {
      color: 'white',
      fontSize: sfs(9),
      fontWeight: '900',
      letterSpacing: 1,
    },
    miniSongCard: {
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#F1F5F9',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    miniSongIcon: {
      backgroundColor: '#F0F9FF',
      padding: 8,
      borderRadius: 10,
      marginRight: 10,
    },
    miniSongTitle: {
      fontSize: sfs(12),
      fontWeight: '800',
      color: '#03045E',
    },
    miniSongTheme: {
      fontSize: sfs(9),
      color: '#94A3B8',
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    playButton: {
      backgroundColor: '#FEF2F2',
      padding: 8,
      borderRadius: 10,
    },
    actionCard: {
      backgroundColor: 'white',
      borderRadius: 24,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#F1F5F9',
      marginBottom: 32,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.05,
      shadowRadius: 16,
      elevation: 3,
    },
    actionIconBg: {
      backgroundColor: '#F0F9FF',
      padding: 12,
      borderRadius: 16,
      marginRight: 16,
    },
    actionTextContainer: {
      flex: 1,
    },
    actionTitle: {
      fontSize: sfs(16),
      fontWeight: '800',
      color: '#03045E',
    },
    actionSubtitle: {
      fontSize: sfs(12),
      color: '#94A3B8',
      fontWeight: '600',
      marginTop: 2,
    },
    actionLegenda: {
      fontSize: sfs(9),
      color: '#64748B',
      fontWeight: '600',
      marginTop: 4,
    },
    reflectionCard: {
      backgroundColor: '#03045E',
      borderRadius: 24,
      padding: 20,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
    },
    reflectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    reflectionLabel: {
      color: '#FFD700',
      fontSize: sfs(9),
      fontWeight: '900',
      letterSpacing: 1.5,
      marginLeft: 8,
    },
    reflectionText: {
      color: 'white',
      fontSize: sfs(14),
      fontWeight: '600',
      lineHeight: 20,
      fontStyle: 'italic',
    },
    reflectionAuthor: {
      color: '#94A3B8',
      fontSize: sfs(10),
      fontWeight: '700',
      marginTop: 12,
      textAlign: 'right',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#F1F5F9',
    },
    statIconBg: {
      padding: 10,
      borderRadius: 14,
      marginRight: 12,
    },
    statValue: {
      fontSize: sfs(18),
      fontWeight: '900',
      color: '#03045E',
    },
    statLabel: {
      fontSize: sfs(8),
      fontWeight: '800',
      color: '#94A3B8',
      letterSpacing: 1,
    },
    tipCard: {
      backgroundColor: '#F0F9FF',
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#BAE6FD',
    },
    tipHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    tipLabel: {
      color: '#023E8A',
      fontSize: sfs(9),
      fontWeight: '900',
      letterSpacing: 1,
      marginLeft: 8,
    },
    tipTitle: {
      fontSize: sfs(16),
      fontWeight: '800',
      color: '#03045E',
      marginBottom: 4,
    },
    tipText: {
      fontSize: sfs(12),
      color: '#0284C7',
      fontWeight: '600',
      lineHeight: 18,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 24,
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
    },
    backButton: {
      padding: 8,
      backgroundColor: '#F1F5F9',
      borderRadius: 12,
      marginRight: 16,
    },
    modalTitle: {
      fontSize: sfs(20),
      fontWeight: '900',
      color: '#03045E',
    },
    favSongCard: {
      backgroundColor: 'white',
      padding: 16,
      borderRadius: 24,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#F1F5F9',
    },
    favIconBg: {
      backgroundColor: '#F0F9FF',
      padding: 12,
      borderRadius: 16,
      marginRight: 16,
    },
    favSongTitle: {
      fontSize: sfs(16),
      fontWeight: '800',
      color: '#03045E',
    },
    favSongArtist: {
      fontSize: sfs(12),
      color: '#94A3B8',
      fontWeight: '600',
    },
  }), [sfs]);

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        // @ts-ignore - className is supported in react-native-web
        className="scrollbar-hide"
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: colors.subtitle, fontSize: sfs(14) }]}>Paz do Senhor,</Text>
            <Text style={[styles.brandText, { color: colors.text, fontSize: sfs(24) }]}>Firmados em Cristo</Text>
          </View>
          <TouchableOpacity style={[styles.profileIcon, { backgroundColor: isDark ? '#1E293B' : '#F0F9FF' }]}>
            <Anchor size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.verseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.verseHeader}>
            <Sparkles size={16} color={isDark ? colors.blue : "#FFD700"} />
            <Text style={[styles.verseLabel, { color: isDark ? "#FFD700" : colors.secondary, fontSize: sfs(10) }]}>PALAVRA DO DIA</Text>
          </View>
          <Text style={[styles.verseText, { color: colors.text, fontSize: sfs(settings.fontSize) }]}>"{currentVerse.text}"</Text>
          <View style={[styles.verseFooter, { borderTopColor: colors.divider }]}>
            <Text style={[styles.reference, { color: colors.subtitle, fontSize: sfs(12) }]}>{currentVerse.reference}</Text>
            <TouchableOpacity onPress={setRandomVerse} style={[styles.miniRefresh, { backgroundColor: isDark ? '#121212' : '#F0F9FF' }]}>
              <RefreshCw size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.actionIconBg, { backgroundColor: isDark ? '#121212' : '#F0F9FF' }]}>
            <Calendar size={24} color={colors.primary} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={[styles.actionTitle, { color: colors.text, fontSize: sfs(18) }]}>Ensaio</Text>
            <Text style={[styles.actionSubtitle, { color: colors.subtitle, fontSize: sfs(14) }]}>{rehearsalInfo.day}, às {rehearsalInfo.time}</Text>
            <Text style={[styles.actionLegenda, { color: colors.subtitle, fontSize: sfs(10) }]}>Repertório confirmado para ensaio de {rehearsalInfo.day.split('-')[0].toLowerCase()}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.secondary, fontSize: sfs(10) }]}>Escala da Semana (Ciclo 7 Dias)</Text>
        </View>

        <View style={styles.daysContainer}>
          <View style={styles.dayColumn}>
            <View style={[styles.dayHeader, { backgroundColor: colors.text }]}>
              <Text style={[styles.dayLabel, { color: colors.card }]}>DOMINGO (2)</Text>
            </View>
            {weeklySelection.domingo.map(song => (
              <SongMiniCard key={song.id} song={song} />
            ))}
          </View>

          <View style={styles.dayColumn}>
            <View style={[styles.dayHeader, { backgroundColor: colors.text }]}>
              <Text style={[styles.dayLabel, { color: colors.card }]}>SEGUNDA (2)</Text>
            </View>
            {weeklySelection.segunda.map(song => (
              <SongMiniCard key={song.id} song={song} />
            ))}
          </View>
        </View>

        <View style={[styles.reflectionCard, { backgroundColor: isDark ? colors.card : colors.text, borderColor: isDark ? colors.primary : 'transparent', borderWidth: isDark ? 1 : 0 }]}>
          <View style={styles.reflectionHeader}>
            <Lightbulb size={18} color="#FFD700" />
            <Text style={[styles.reflectionLabel, { color: '#FFD700', fontSize: sfs(10) }]}>REFLEXÃO PARA O MINISTRO</Text>
          </View>
          <Text style={[styles.reflectionText, { color: isDark ? colors.text : colors.card, fontSize: sfs(14) }]}>"{reflection.text}"</Text>
          <Text style={[styles.reflectionAuthor, { color: isDark ? colors.subtitle : colors.subtitle, fontSize: sfs(10) }]}>— {reflection.author}</Text>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => onNavigate?.('favorites')}
          >
            <View style={[styles.statIconBg, { backgroundColor: isDark ? '#121212' : '#E0F2FE' }]}>
              <Music size={18} color={isDark ? colors.primary : '#0284C7'} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>{songs.length}</Text>
              <Text style={[styles.statLabel, { color: colors.subtitle }]}>LOUVORES</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setIsFavoritesOpen(true)}
          >
            <View style={[styles.statIconBg, { backgroundColor: isDark ? '#4C0519' : '#FCE7F3' }]}>
              <BarChart3 size={18} color={isDark ? '#F472B6' : '#DB2777'} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>{favoriteSongs.length}</Text>
              <Text style={[styles.statLabel, { color: colors.subtitle }]}>FAVORITOS</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.tipCard, { backgroundColor: isDark ? '#121212' : '#F0F9FF', borderColor: isDark ? colors.primary : '#BAE6FD' }]}>
          <View style={styles.tipHeader}>
            <Music size={18} color={isDark ? colors.primary : '#023E8A'} />
            <Text style={[styles.tipLabel, { color: isDark ? colors.primary : '#023E8A', fontSize: sfs(9) }]}>DICA MUSICAL DO MESTRE</Text>
          </View>
          <Text style={[styles.tipTitle, { color: colors.text, fontSize: sfs(16) }]}>{musicalTip.title}</Text>
          <Text style={[styles.tipText, { color: isDark ? colors.subtitle : '#0284C7', fontSize: sfs(12) }]}>{musicalTip.text}</Text>
        </View>
      </ScrollView>

      <Modal
        visible={isFavoritesOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsFavoritesOpen(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity 
              onPress={() => setIsFavoritesOpen(false)}
              style={[styles.backButton, { backgroundColor: colors.border }]}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Meus Favoritos</Text>
          </View>

          <FlatList
            data={favoriteSongs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 24 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.favSongCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setSelectedSong(item)}
              >
                <View style={[styles.favIconBg, { backgroundColor: isDark ? '#121212' : '#F0F9FF' }]}>
                  <Music size={20} color={isDark ? colors.primary : '#0284C7'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.favSongTitle, { color: colors.text }]}>
                    {item.title.split(' - ')[0].trim()}
                  </Text>
                  <Text style={[styles.favSongArtist, { color: colors.subtitle }]}>{item.artist || 'Artista não informado'}</Text>
                </View>
                <ChevronRight size={20} color={colors.subtitle} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Heart size={48} color={colors.border} />
                <Text style={{ marginTop: 16, color: colors.subtitle, fontWeight: '600', textAlign: 'center' }}>
                  Você ainda não tem louvores favoritos.
                </Text>
              </View>
            )}
          />
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


