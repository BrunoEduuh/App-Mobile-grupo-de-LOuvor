import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Modal, ScrollView, StyleSheet } from 'react-native';
import { Search, Music, ChevronRight, Plus, X, Link as LinkIcon, Heart, Trash2 } from 'lucide-react';
import { useStore, Song } from '../store/useStore';
import { Alert } from 'react-native';

export default function Library() {
  const { songs, addSong, favorites, toggleFavorite, deleteSong, clearAllSongs } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSong, setNewSong] = useState({ title: '', url: '', theme: 'Adoração' });

  const filteredSongs = useMemo(() => {
    return songs.filter(song => 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.theme.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [songs, searchQuery]);

  const handleAddSong = () => {
    if (newSong.title && newSong.url) {
      addSong(newSong);
      setNewSong({ title: '', url: '', theme: 'Adoração' });
      setIsModalOpen(false);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      "Limpar Repertório",
      "Tem certeza que deseja remover TODOS os louvores? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Limpar Tudo", style: "destructive", onPress: () => clearAllSongs() }
      ]
    );
  };

  const handleDeleteSong = (id: string, title: string) => {
    Alert.alert(
      "Remover Louvor",
      `Deseja remover "${title}" do repertório?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => deleteSong(id) }
      ]
    );
  };

  const SongItem = ({ item }: { item: Song }) => {
    const isFavorite = favorites.includes(item.id);
    
    return (
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
              color={isFavorite ? '#FF006E' : '#CBD5E1'} 
              fill={isFavorite ? '#FF006E' : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDeleteSong(item.id, item.title)}
            style={styles.deleteButton}
          >
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={styles.headerIconBg}>
              <Music size={20} color="#FFD700" />
            </View>
            <Text style={styles.headerTitle}>Repertório</Text>
          </View>
          {songs.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearAllBtn}>
              <Trash2 size={16} color="#EF4444" />
              <Text style={styles.clearAllText}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.searchContainer}>
          <Search size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título ou tema..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={filteredSongs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SongItem item={item} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Music size={48} color="#E2E8F0" />
            <Text style={styles.emptyText}>
              Nenhum louvor encontrado.
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity 
        onPress={() => setIsModalOpen(true)}
        style={styles.fab}
        activeOpacity={0.8}
      >
        <Plus size={32} color="#FFD700" strokeWidth={3} />
      </TouchableOpacity>

      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Novo Louvor</Text>
                <Text style={styles.modalSubtitle}>Adicionar ao Repertório</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setIsModalOpen(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Título do Louvor</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: Bondade de Deus"
                  placeholderTextColor="#CBD5E1"
                  value={newSong.title}
                  onChangeText={(text) => setNewSong({ ...newSong, title: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Link do YouTube</Text>
                <View style={styles.urlInputContainer}>
                  <LinkIcon size={20} color="#94A3B8" />
                  <TextInput
                    style={styles.urlInput}
                    placeholder="https://youtube.com/..."
                    placeholderTextColor="#CBD5E1"
                    value={newSong.url}
                    onChangeText={(text) => setNewSong({ ...newSong, url: text })}
                  />
                </View>
              </View>

              <View style={styles.themeGroup}>
                <Text style={styles.inputLabel}>Temática / Estilo</Text>
                <View style={styles.themeOptions}>
                  {['Adoração', 'Celebração', 'Entrega', 'Guerra'].map((theme) => (
                    <TouchableOpacity
                      key={theme}
                      onPress={() => setNewSong({ ...newSong, theme })}
                      style={[
                        styles.themeOption,
                        newSong.theme === theme && styles.themeOptionActive
                      ]}
                    >
                      <Text style={[
                        styles.themeOptionText,
                        newSong.theme === theme && styles.themeOptionTextActive
                      ]}>
                        {theme}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleAddSong}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>Consagrar Louvor</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    marginBottom: 24,
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
  searchContainer: {
    backgroundColor: 'white',
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
    borderColor: '#F1F5F9',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#03045E',
    fontWeight: '700',
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
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  clearAllText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  chevronBg: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    backgroundColor: '#023E8A',
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#023E8A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 4, 94, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 56,
    borderTopRightRadius: 56,
    padding: 40,
    paddingBottom: 64,
  },
  modalHandle: {
    width: 48,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#03045E',
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  modalSubtitle: {
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  closeButton: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
  },
  inputGroup: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0284C7',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 12,
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    padding: 24,
    borderRadius: 24,
    color: '#03045E',
    fontWeight: '900',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  urlInputContainer: {
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  urlInput: {
    flex: 1,
    padding: 24,
    color: '#03045E',
    fontWeight: '700',
  },
  themeGroup: {
    marginBottom: 48,
  },
  themeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeOption: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    backgroundColor: 'white',
  },
  themeOptionActive: {
    backgroundColor: '#03045E',
    borderColor: '#03045E',
  },
  themeOptionText: {
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#0284C7',
  },
  themeOptionTextActive: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#03045E',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#03045E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 4,
    fontSize: 12,
  },
});
