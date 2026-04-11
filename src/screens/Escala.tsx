import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StatusBar, Modal, ScrollView, StyleSheet, Linking, SafeAreaView } from 'react-native';
import { Search, Music, ChevronRight, X, Heart, Play, ArrowLeft, BookOpen, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, Song } from '../store/useStore';
import StudyModal from '../components/StudyModal';
import { useTheme } from '../context/ThemeContext';

export default function Escala() {
  const { weeklySelection, favorites, toggleFavorite, updateSong, settings, isAdmin, checkAndResetWeeklySetlist } = useStore();
  const { colors, isDark } = useTheme();
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const weeklySongs = useMemo(() => {
    return [...weeklySelection.domingo, ...weeklySelection.segunda];
  }, [weeklySelection]);

  const handleOpenStudy = (song: Song) => {
    setSelectedSong(song);
  };

  const SongItem = ({ item, index }: { item: Song; index: number }) => {
    const isFavorite = favorites.includes(item.id);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
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
              <motion.div
                animate={{ scale: isFavorite ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                <Heart 
                  size={18} 
                  color={isFavorite ? '#FF006E' : colors.subtitle} 
                  fill={isFavorite ? '#FF006E' : 'transparent'}
                />
              </motion.div>
            </TouchableOpacity>
            <View style={[styles.chevronBg, { backgroundColor: isDark ? '#121212' : '#F8FAFC' }]}>
              <ChevronRight size={18} color={colors.subtitle} />
            </View>
          </View>
        </TouchableOpacity>
      </motion.div>
    );
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={[styles.headerIconBg, { backgroundColor: colors.primary }]}>
              <Music size={20} color={isDark ? "black" : "#FFD700"} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Escala da Semana</Text>
          </View>
          {isAdmin && (
            <TouchableOpacity 
              onPress={() => checkAndResetWeeklySetlist(true)}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.emptyContainer}
          >
            <Music size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.subtitle }]}>
              Nenhum louvor na escala desta semana.
            </Text>
          </motion.div>
        )}
        contentContainerStyle={styles.listContent}
      />

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

const styles = StyleSheet.create({
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
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  headerIconBg: {
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
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
    fontSize: 16,
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
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dot: {
    fontSize: 10,
    marginHorizontal: 6,
  },
  playCountText: {
    fontSize: 8,
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
  },
});
