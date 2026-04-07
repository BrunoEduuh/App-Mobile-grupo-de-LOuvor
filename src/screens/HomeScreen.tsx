import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { Anchor, Sparkles, RefreshCw, Calendar, Music, Play, ChevronRight, Unlock } from 'lucide-react';
import { useStore, Song } from '../store/useStore';

export default function HomeScreen() {
  const { 
    currentVerse, 
    setRandomVerse, 
    checkAndResetWeeklySetlist, 
    songs, 
    favorites, 
    weeklySelection,
    lastSelectionDate
  } = useStore();

  useEffect(() => {
    // Tenta resetar automaticamente se o ciclo de 7 dias expirou
    checkAndResetWeeklySetlist();
  }, []);


  const SongMiniCard = ({ song }: { song: Song }) => (
    <View style={styles.miniSongCard}>
      <View style={styles.miniSongIcon}>
        <Music size={14} color="#0284C7" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.miniSongTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.miniSongTheme}>{song.theme}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => song.url ? Linking.openURL(song.url) : Alert.alert("Link indisponível")}
        style={styles.playButton}
      >
        <Play size={14} color="#EF4444" fill="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        // @ts-ignore - className is supported in react-native-web
        className="scrollbar-hide"
      >
        {/* Header de Boas-vindas */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Paz do Senhor,</Text>
            <Text style={styles.brandText}>Firmados em Cristo</Text>
          </View>
          <TouchableOpacity style={styles.profileIcon}>
            <Anchor size={24} color="#023E8A" />
          </TouchableOpacity>
        </View>

        {/* Card do Versículo */}
        <View style={styles.verseCard}>
          <View style={styles.verseHeader}>
            <Sparkles size={16} color="#FFD700" />
            <Text style={styles.verseLabel}>PALAVRA DO DIA</Text>
          </View>
          <Text style={styles.verseText}>"{currentVerse.text}"</Text>
          <View style={styles.verseFooter}>
            <Text style={styles.reference}>{currentVerse.reference}</Text>
            <TouchableOpacity onPress={setRandomVerse} style={styles.miniRefresh}>
              <RefreshCw size={16} color="#023E8A" />
            </TouchableOpacity>
          </View>
        </View>


        {/* Repertório Segmentado */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Escala da Semana (Ciclo 7 Dias)</Text>
        </View>

        <View style={styles.daysContainer}>
          {/* Domingo */}
          <View style={styles.dayColumn}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>DOMINGO (2)</Text>
            </View>
            {weeklySelection.domingo.map(song => (
              <SongMiniCard key={song.id} song={song} />
            ))}
          </View>

          {/* Segunda */}
          <View style={styles.dayColumn}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>SEGUNDA (2)</Text>
            </View>
            {weeklySelection.segunda.map(song => (
              <SongMiniCard key={song.id} song={song} />
            ))}
          </View>
        </View>

        {/* Card de Próximo Ensaio */}
        <View style={styles.actionCard}>
          <View style={styles.actionIconBg}>
            <Calendar size={24} color="#023E8A" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Ensaio Geral</Text>
            <Text style={styles.actionSubtitle}>Sexta-feira, às 19:00</Text>
            <Text style={styles.actionLegenda}>Repertório confirmado para ensaio de sexta</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>FIXO</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
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
  selectionStatus: {
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statusTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
    color: '#023E8A',
  },
  autoBadge: {
    backgroundColor: '#DCFCE7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  autoBadgeText: {
    color: '#16A34A',
    fontSize: 8,
    fontWeight: '900',
    marginLeft: 4,
  },
  shuffleBtn: {
    backgroundColor: '#023E8A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  shuffleBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  shuffleBtnText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 6,
  },
  sectionHeader: {
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
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    fontSize: 10,
    color: '#0284C7',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#0284C7',
    fontSize: 9,
    fontWeight: '900',
  },
});

