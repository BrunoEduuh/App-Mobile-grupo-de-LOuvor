import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Calendar, Library, Settings } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface BottomTabsProps {
  activeTab: 'home' | 'library' | 'favorites' | 'settings';
  onTabPress: (tab: 'home' | 'library' | 'favorites' | 'settings') => void;
}

export default function BottomTabs({ activeTab, onTabPress }: BottomTabsProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, sfs } = useTheme();

  const styles = React.useMemo(() => StyleSheet.create({
    tabBar: {
      flexDirection: 'row',
      borderTopWidth: 1,
      paddingTop: 8,
      justifyContent: 'space-around',
      alignItems: 'center',
      // Sombra no topo (iOS)
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      // Sombra no topo (Android)
      elevation: 24,
      // Garantir que a sombra apareça acima do conteúdo
      zIndex: 1000,
    },
    tabItem: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    tabText: {
      fontSize: sfs(10),
      fontWeight: '900',
      marginTop: 4,
      color: '#94A3B8',
      letterSpacing: 1,
    },
    activeTabText: {
      color: '#023E8A',
    },
  }), [sfs]);
  
  return (
    <View style={[
      styles.tabBar, 
      { 
        paddingBottom: Math.max(insets.bottom, 8),
        height: 56 + Math.max(insets.bottom, 8),
        backgroundColor: colors.card,
        borderTopColor: colors.border
      }
    ]}>
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('home')}
        activeOpacity={0.7}
      >
        <Home 
          size={24} 
          color={activeTab === 'home' ? colors.blue : colors.subtitle} 
          strokeWidth={activeTab === 'home' ? 3 : 2}
        />
        <Text style={[styles.tabText, { color: colors.subtitle }, activeTab === 'home' && { color: colors.blue }]}>
          INÍCIO
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('library')}
        activeOpacity={0.7}
      >
        <Calendar 
          size={24} 
          color={activeTab === 'library' ? colors.blue : colors.subtitle} 
          strokeWidth={activeTab === 'library' ? 3 : 2}
        />
        <Text style={[styles.tabText, { color: colors.subtitle }, activeTab === 'library' && { color: colors.blue }]}>
          ESCALA
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('favorites')}
        activeOpacity={0.7}
      >
        <Library 
          size={24} 
          color={activeTab === 'favorites' ? colors.blue : colors.subtitle} 
          strokeWidth={activeTab === 'favorites' ? 3 : 2}
        />
        <Text style={[styles.tabText, { color: colors.subtitle }, activeTab === 'favorites' && { color: colors.blue }]}>
          BIBLIOTECA
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('settings')}
        activeOpacity={0.7}
      >
        <Settings 
          size={24} 
          color={activeTab === 'settings' ? colors.blue : colors.subtitle} 
          strokeWidth={activeTab === 'settings' ? 3 : 2}
        />
        <Text style={[styles.tabText, { color: colors.subtitle }, activeTab === 'settings' && { color: colors.blue }]}>
          AJUSTES
        </Text>
      </TouchableOpacity>
    </View>
  );
}
