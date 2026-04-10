import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { motion, AnimatePresence } from 'motion/react';
import HomeScreen from './screens/HomeScreen';
import Escala from './screens/Escala';
import Biblioteca from './screens/Biblioteca';
import Settings from './screens/Settings';
import BottomTabs from './components/BottomTabs';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useStore } from './store/useStore';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'favorites' | 'settings'>('home');
  const { colors, isDark } = useTheme();
  const { syncWithFirebase } = useStore();

  useEffect(() => {
    syncWithFirebase();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen />;
      case 'library': return <Escala />;
      case 'favorites': return <Biblioteca />;
      case 'settings': return <Settings />;
      default: return <HomeScreen />;
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#020617' : '#F1F5F9' }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      {/* Container Principal com Limite de Largura para Desktop */}
      <View style={[styles.appContainer, { backgroundColor: colors.card }]}>
        <SafeAreaView style={styles.safeArea}>
          {/* Conteúdo com Transição */}
          <View style={styles.content}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  height: '100%',
                  width: '100%',
                  overflow: 'hidden'
                }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </View>

          {/* Bottom Tab Navigation Profissional */}
          <BottomTabs 
            activeTab={activeTab} 
            onTabPress={(tab) => setActiveTab(tab)} 
          />
        </SafeAreaView>
      </View>
    </View>
  );
}

export default function App() {
  const initialMetrics = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  };

  return (
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    // Sombra para o container desktop
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
});
