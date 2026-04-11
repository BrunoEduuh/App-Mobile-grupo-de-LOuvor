import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet, ScrollView, Linking, Modal, FlatList } from 'react-native';
import { Anchor, Sparkles, RefreshCw, Calendar, Music, Play, ChevronRight, Unlock, Lightbulb, BarChart3, Heart, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore, Song } from '../store/useStore';
import StudyModal from '../components/StudyModal';
import { useTheme } from '../context/ThemeContext';

const REFLECTIONS = [
  { text: "A adoração não é sobre o quão bem tocamos, mas sobre para Quem tocamos.", author: "Mestre de Música" },
  { text: "O ensaio é o momento de errar; o culto é o momento de se entregar.", author: "Ministro de Louvor" },
  { text: "Mantenha seu instrumento afinado, mas sua alma ainda mais.", author: "Teólogo Musical" },
  { text: "A simplicidade muitas vezes comunica mais do que o virtuosismo.", author: "Arranjador" },
  { text: "Louvor é a Palavra de Deus cantada. Seja fiel às Escrituras.", author: "Firmados em Cristo" },
  { text: "Seu talento pode te levar ao altar, mas só a santidade te mantém lá.", author: "Ministro de Louvor" },
  { text: "Deus não procura grandes músicos, Ele procura verdadeiros adoradores.", author: "Teólogo Musical" },
  { text: "A música é o veículo, mas a mensagem é a cruz.", author: "Firmados em Cristo" },
  { text: "Antes de abrir o instrumento, abra o coração em oração.", author: "Mestre de Música" },
  { text: "O brilho do músico nunca deve ofuscar a glória de Deus.", author: "Arranjador" },
  { text: "Adorar é um estilo de vida, não um evento de domingo.", author: "Ministro de Louvor" },
  { text: "A técnica sem unção é apenas barulho; a unção sem técnica é desleixo.", author: "Mestre de Música" },
  { text: "Seja o primeiro a ser ministrado pela canção que você vai tocar.", author: "Teólogo Musical" },
  { text: "O maior solo que você pode fazer é o da rendição total.", author: "Arranjador" },
  { text: "Nossa meta é que as pessoas saiam do culto falando de Jesus, não da banda.", author: "Firmados em Cristo" }
];

const MUSICAL_TIPS = [
  { title: "Dinâmica", text: "Nem tudo precisa ser forte o tempo todo. Aprecie o piano e o forte." },
  { title: "Escuta Ativa", text: "Ouça os outros instrumentos. O louvor é um corpo unido, não um solo." },
  { title: "O Silêncio", text: "O silêncio também é música. Saiba quando não tocar para dar espaço à voz." },
  { title: "Preparação", text: "Estude seu instrumento em casa para que no ensaio possamos unir os corações." },
  { title: "Vocal: Respiração", text: "Respire pelo diafragma para sustentar as notas sem forçar as cordas vocais." },
  { title: "Vocal: Unidade", text: "No backing vocal, tente 'colar' sua voz na do líder. Não tente se destacar." },
  { title: "Violão/Guitarra", text: "Menos é mais. Deixe espaço para o teclado e não embole as frequências médias." },
  { title: "Baixo: O Alicerce", text: "Sua função é unir a harmonia ao ritmo. Seja preciso e constante com o bumbo." },
  { title: "Bateria: Intensidade", text: "Controle sua força. A bateria deve conduzir a energia, não ensurdecer a igreja." },
  { title: "Teclado: Texturas", text: "Use pads para preencher os vazios e pianos para marcar a harmonia com clareza." },
  { title: "Vocal: Dicção", text: "Pronuncie bem as palavras. A igreja precisa entender a mensagem que está sendo cantada." },
  { title: "Guitarra: Timbre", text: "Busque um timbre que se encaixe no mix da banda, sem excesso de distorção." },
  { title: "Ritmo: Metrônomo", text: "Pratique com metrônomo. A firmeza rítmica traz segurança para toda a igreja cantar." },
  { title: "Vocal: Expressão", text: "Cante com verdade. Sua expressão facial deve refletir a alegria ou a reverência da letra." },
  { title: "Instrumental: Espaço", text: "Saiba quando parar. Às vezes, o melhor arranjo é aquele onde você não toca." }
];

export default function HomeScreen() {
  const { 
    currentVerse, 
    setRandomVerse, 
    checkAndResetWeeklySetlist, 
    songs, 
    favorites, 
    weeklySelection,
    lastSelectionDate,
    updateSong,
    settings
  } = useStore();

  const { colors, isDark } = useTheme();
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
  }, []);

  const SongMiniCard = ({ song }: { song: Song }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
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
    </motion.div>
  );

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
            <Text style={[styles.welcomeText, { color: colors.subtitle }]}>Paz do Senhor,</Text>
            <Text style={[styles.brandText, { color: colors.text }]}>Firmados em Cristo</Text>
          </View>
          <TouchableOpacity style={[styles.profileIcon, { backgroundColor: colors.card }]}>
            <Anchor size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <View style={[styles.verseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.verseHeader}>
            <Sparkles size={16} color={isDark ? colors.blue : "#FFD700"} />
            <Text style={[styles.verseLabel, { color: isDark ? "#FFD700" : colors.secondary }]}>PALAVRA DO DIA</Text>
          </View>
          <Text style={[styles.verseText, { color: colors.text, fontSize: settings.fontSize }]}>"{currentVerse.text}"</Text>
          <View style={[styles.verseFooter, { borderTopColor: colors.divider }]}>
            <Text style={[styles.reference, { color: colors.subtitle }]}>{currentVerse.reference}</Text>
            <TouchableOpacity onPress={setRandomVerse} style={[styles.miniRefresh, { backgroundColor: isDark ? '#121212' : '#F0F9FF' }]}>
              <RefreshCw size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <View style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.actionIconBg, { backgroundColor: isDark ? '#121212' : '#F0F9FF' }]}>
            <Calendar size={24} color={colors.primary} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Ensaio</Text>
            <Text style={[styles.actionSubtitle, { color: colors.subtitle }]}>Sexta-feira, às 19:00</Text>
            <Text style={[styles.actionLegenda, { color: colors.subtitle }]}>Repertório confirmado para ensaio de sexta</Text>
          </View>
        </View>
        </motion.div>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Escala da Semana (Ciclo 7 Dias)</Text>
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
            <Text style={[styles.reflectionLabel, { color: '#FFD700' }]}>REFLEXÃO PARA O MINISTRO</Text>
          </View>
          <Text style={[styles.reflectionText, { color: isDark ? colors.text : colors.card }]}>"{reflection.text}"</Text>
          <Text style={[styles.reflectionAuthor, { color: isDark ? colors.subtitle : colors.subtitle }]}>— {reflection.author}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIconBg, { backgroundColor: isDark ? '#121212' : '#E0F2FE' }]}>
              <Music size={18} color={isDark ? colors.primary : '#0284C7'} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>{songs.length}</Text>
              <Text style={[styles.statLabel, { color: colors.subtitle }]}>LOUVORES</Text>
            </View>
          </View>
          
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
            <Text style={[styles.tipLabel, { color: isDark ? colors.primary : '#023E8A' }]}>DICA MUSICAL DO MESTRE</Text>
          </View>
          <Text style={[styles.tipTitle, { color: colors.text }]}>{musicalTip.title}</Text>
          <Text style={[styles.tipText, { color: isDark ? colors.subtitle : '#0284C7' }]}>{musicalTip.text}</Text>
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

const styles = StyleSheet.create({
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
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
  },
  brandText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#03045E',
    letterSpacing: -0.5,
  },
  profileIcon: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginLeft: 8,
  },
  verseText: {
    color: '#03045E',
    fontSize: 18,
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
    fontSize: 12,
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
    fontSize: 10,
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
    fontSize: 9,
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
    fontSize: 12,
    fontWeight: '800',
    color: '#03045E',
  },
  miniSongTheme: {
    fontSize: 9,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#03045E',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  actionLegenda: {
    fontSize: 9,
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
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginLeft: 8,
  },
  reflectionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  reflectionAuthor: {
    color: '#94A3B8',
    fontSize: 10,
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
    fontSize: 18,
    fontWeight: '900',
    color: '#03045E',
  },
  statLabel: {
    fontSize: 8,
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
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#03045E',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
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
    fontSize: 20,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#03045E',
  },
  favSongArtist: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
