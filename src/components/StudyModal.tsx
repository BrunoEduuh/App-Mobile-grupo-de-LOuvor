import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, TextInput, Linking, StyleSheet, SafeAreaView } from 'react-native';
import { ArrowLeft, Play, BookOpen, Edit3, X } from 'lucide-react';
import { Song, useStore } from '../store/useStore';
import { useTheme } from '../context/ThemeContext';

interface StudyModalProps {
  song: Song | null;
  visible: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Song>) => void;
}

export default function StudyModal({ song, visible, onClose, onUpdate }: StudyModalProps) {
  const { settings } = useStore();
  const { colors, isDark } = useTheme();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
// ... (keep rest of state)
  const [isEditingLyrics, setIsEditingLyrics] = useState(false);
  const [isEditingArtist, setIsEditingArtist] = useState(false);
  const [tempNotes, setTempNotes] = useState('');
  const [tempLyrics, setTempLyrics] = useState('');
  const [tempArtist, setTempArtist] = useState('');

  useEffect(() => {
    if (song) {
      setTempNotes(song.rehearsalNotes || '');
      setTempLyrics(song.lyrics || '');
      setTempArtist(song.artist || '');
    }
  }, [song]);

  const handleSaveNotes = () => {
    if (song) {
      onUpdate(song.id, { rehearsalNotes: tempNotes });
      setIsEditingNotes(false);
    }
  };

  const handleSaveLyrics = () => {
    if (song) {
      onUpdate(song.id, { lyrics: tempLyrics });
      setIsEditingLyrics(false);
    }
  };

  const handleSaveArtist = () => {
    if (song) {
      onUpdate(song.id, { artist: tempArtist });
      setIsEditingArtist(false);
    }
  };

  if (!song) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.studyContainer, { backgroundColor: colors.background }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={[styles.studyHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={[styles.backButton, { backgroundColor: colors.border }]}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.studyHeaderInfo}>
              <Text style={[styles.studyTitle, { color: colors.text }]}>
                {song.title.split(' - ')[0].trim()}
              </Text>
              {isEditingArtist ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <TextInput
                    style={[styles.artistInput, { color: colors.text, borderBottomColor: colors.primary }]}
                    value={tempArtist}
                    onChangeText={setTempArtist}
                    placeholder="Nome do Artista..."
                    placeholderTextColor={colors.subtitle}
                    autoFocus
                  />
                  <TouchableOpacity onPress={handleSaveArtist}>
                    <Text style={[styles.saveMiniText, { color: colors.primary }]}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={() => setIsEditingArtist(true)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <Text style={[styles.studyArtist, { color: colors.subtitle }]}>
                    {song.artist || (song.title.includes(' - ') ? song.title.split(' - ')[1].trim() : 'Artista não informado')}
                  </Text>
                  <Edit3 size={10} color={colors.subtitle} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity 
              onPress={() => {
                if (song.url) {
                  Linking.openURL(song.url);
                }
              }}
              style={[styles.studyPlayBtn, { backgroundColor: isDark ? colors.primary : '#EF4444' }]}
            >
              <Play size={20} color={isDark ? 'black' : 'white'} fill={isDark ? 'black' : 'white'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.studyContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.studyStats, { backgroundColor: isDark ? '#121212' : '#F0F9FF', borderColor: isDark ? colors.blue : 'transparent', borderWidth: isDark ? 1 : 0 }]}>
              <Text style={[styles.studyStatsText, { color: isDark ? colors.blue : colors.secondary, fontSize: Math.max(10, settings.fontSize * 0.6) }]}>
                Tocada {song.playCount} vezes este ano
              </Text>
            </View>

            <View style={styles.studySection}>
              <View style={styles.sectionHeader}>
                <BookOpen size={16} color={colors.primary} />
                <Text style={[styles.sectionLabel, { color: colors.text }]}>Letra da Música</Text>
                {!isEditingLyrics && (
                  <TouchableOpacity onPress={() => setIsEditingLyrics(true)}>
                    <Text style={[styles.editBtnText, { color: colors.primary }]}>Editar</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {isEditingLyrics ? (
                <View style={[styles.notesEditContainer, { backgroundColor: colors.card, borderColor: isDark ? colors.blue : colors.primary }]}>
                  <TextInput
                    style={[styles.notesInput, { color: colors.text, height: 200, fontFamily: 'serif', fontSize: settings.fontSize }]}
                    multiline
                    value={tempLyrics}
                    onChangeText={setTempLyrics}
                    placeholder="Cole a letra completa aqui..."
                    placeholderTextColor={colors.subtitle}
                  />
                  <View style={styles.notesActions}>
                    <TouchableOpacity onPress={() => setIsEditingLyrics(false)} style={styles.notesCancelBtn}>
                      <Text style={[styles.notesCancelText, { color: colors.subtitle, fontSize: Math.max(12, settings.fontSize * 0.7) }]}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSaveLyrics} style={[styles.notesSaveBtn, { backgroundColor: isDark ? colors.blue : colors.primary }]}>
                      <Text style={[styles.notesSaveText, { color: 'white', fontSize: Math.max(12, settings.fontSize * 0.7) }]}>Salvar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={[styles.lyricsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.lyricsText, { color: isDark ? '#CBD5E1' : '#334155', fontSize: settings.fontSize }]}>
                    {song.lyrics || 'Letra não cadastrada para este louvor.'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.studySection}>
              <View style={styles.sectionHeader}>
                <Edit3 size={16} color={colors.primary} />
                <Text style={[styles.sectionLabel, { color: colors.text }]}>Direções para o Ensaio</Text>
                {!isEditingNotes && (
                  <TouchableOpacity onPress={() => setIsEditingNotes(true)}>
                    <Text style={[styles.editBtnText, { color: colors.primary }]}>Editar</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {isEditingNotes ? (
                <View style={[styles.notesEditContainer, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                  <TextInput
                    style={[styles.notesInput, { color: colors.text }]}
                    multiline
                    value={tempNotes}
                    onChangeText={setTempNotes}
                    placeholder="Anote aqui as dinâmicas..."
                    placeholderTextColor={colors.subtitle}
                  />
                  <View style={styles.notesActions}>
                    <TouchableOpacity onPress={() => setIsEditingNotes(false)} style={styles.notesCancelBtn}>
                      <Text style={[styles.notesCancelText, { color: colors.subtitle }]}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSaveNotes} style={[styles.notesSaveBtn, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.notesSaveText, { color: isDark ? 'black' : 'white' }]}>Salvar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={[styles.notesCard, { backgroundColor: isDark ? '#121212' : '#FFFAF0', borderColor: isDark ? colors.primary : '#FFD700', borderWidth: 1 }]}>
                  <Text style={[styles.notesText, { color: isDark ? colors.primary : '#854D0E' }]}>
                    {song.rehearsalNotes || 'Nenhuma anotação para este louvor ainda.'}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  studyContainer: {
    flex: 1,
  },
  studyHeader: {
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
  studyHeaderInfo: {
    flex: 1,
  },
  studyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#03045E',
  },
  studyArtist: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
    marginTop: 2,
  },
  artistInput: {
    fontSize: 12,
    color: '#03045E',
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: '#0284C7',
    padding: 0,
    minWidth: 120,
  },
  saveMiniText: {
    fontSize: 10,
    color: '#0284C7',
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  studyPlayBtn: {
    backgroundColor: '#EF4444',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studyContent: {
    flex: 1,
    padding: 24,
  },
  studyStats: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 32,
  },
  studyStatsText: {
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  studySection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#03045E',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginLeft: 8,
    flex: 1,
  },
  editBtnText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '800',
  },
  lyricsCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  lyricsText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#334155',
    fontFamily: 'serif',
    textAlign: 'center',
  },
  notesCard: {
    backgroundColor: '#FFFAF0',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#854D0E',
    fontStyle: 'italic',
  },
  notesEditContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  notesInput: {
    height: 120,
    textAlignVertical: 'top',
    color: '#03045E',
    fontSize: 14,
    padding: 8,
  },
  notesActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  notesCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  notesCancelText: {
    color: '#94A3B8',
    fontWeight: '700',
  },
  notesSaveBtn: {
    backgroundColor: '#03045E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  notesSaveText: {
    color: 'white',
    fontWeight: '800',
  },
});
