import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Music, Heart, Settings } from 'lucide-react';

interface BottomTabsProps {
  activeTab: 'home' | 'library' | 'favorites' | 'settings';
  onTabPress: (tab: 'home' | 'library' | 'favorites' | 'settings') => void;
}

export default function BottomTabs({ activeTab, onTabPress }: BottomTabsProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.tabBar, 
      { 
        paddingBottom: Math.max(insets.bottom, 16),
        height: 64 + Math.max(insets.bottom, 16)
      }
    ]}>
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('home')}
        activeOpacity={0.7}
      >
        <Home 
          size={24} 
          color={activeTab === 'home' ? '#023E8A' : '#94A3B8'} 
          strokeWidth={activeTab === 'home' ? 3 : 2}
        />
        <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>
          INÍCIO
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('library')}
        activeOpacity={0.7}
      >
        <Music 
          size={24} 
          color={activeTab === 'library' ? '#023E8A' : '#94A3B8'} 
          strokeWidth={activeTab === 'library' ? 3 : 2}
        />
        <Text style={[styles.tabText, activeTab === 'library' && styles.activeTabText]}>
          LOUVORES
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('favorites')}
        activeOpacity={0.7}
      >
        <Heart 
          size={24} 
          color={activeTab === 'favorites' ? '#FF006E' : '#94A3B8'} 
          fill={activeTab === 'favorites' ? '#FF006E' : 'transparent'}
          strokeWidth={activeTab === 'favorites' ? 3 : 2}
        />
        <Text style={[styles.tabText, activeTab === 'favorites' && { color: '#FF006E' }]}>
          FAVORITOS
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('settings')}
        activeOpacity={0.7}
      >
        <Settings 
          size={24} 
          color={activeTab === 'settings' ? '#023E8A' : '#94A3B8'} 
          strokeWidth={activeTab === 'settings' ? 3 : 2}
        />
        <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
          AJUSTES
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC', // Branco Perolado
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    // Sombra no topo (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    // Sombra no topo (Android)
    elevation: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // Garantir que a sombra apareça acima do conteúdo
    zIndex: 1000,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
    color: '#94A3B8',
    letterSpacing: 1,
  },
  activeTabText: {
    color: '#023E8A',
  },
});
