import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { Heart, Music, ChevronRight } from 'lucide-react';
import { useStore, Song } from '../store/useStore';

export default function Favorites() {
  const { songs, favorites, toggleFavorite } = useStore();

  const favoriteSongs = useMemo(() => {
    return songs.filter(song => favorites.includes(song.id));
  }, [songs, favorites]);

  const SongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity 
      style={styles.songCard}
      activeOpacity={0.7}
    >
      <View style={styles.songInfoContainer}>
        <View style={styles.musicIconBg}>
          <Music size={24} color="#0077B6" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.songMeta}>
            <View style={styles.themeBadge}>
              <Text style={styles.themeText}>
                {item.theme}
              </Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.playCountText}>
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
            size={20} 
            color="#FF006E" 
            fill="#FF006E"
          />
        </TouchableOpacity>
        <View style={styles.chevronBg}>
          <ChevronRight size={20} color="#CBD5E1" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconBg}>
            <Heart size={20} color="#FFD700" fill="#FFD700" />
          </View>
          <Text style={styles.headerTitle}>Favoritos</Text>
        </View>
        <Text style={styles.subtitle}>Seus louvores mais amados</Text>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={favoriteSongs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SongItem item={item} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Heart size={48} color="#E2E8F0" />
            <Text style={styles.emptyText}>
              Você ainda não favoritou nenhum louvor.
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#023E8A',
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#03045E',
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: 120,
  },
  songCard: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 20,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  songTitle: {
    color: '#03045E',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  themeBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  themeText: {
    color: '#0284C7',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dot: {
    color: '#CBD5E1',
    fontSize: 10,
    marginHorizontal: 8,
  },
  playCountText: {
    color: '#94A3B8',
    fontSize: 10,
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
  chevronBg: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 20,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
});
