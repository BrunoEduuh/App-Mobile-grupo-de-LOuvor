import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { motion, AnimatePresence } from 'motion/react';
import HomeScreen from './screens/HomeScreen';
import Library from './screens/Library';
import Favorites from './screens/Favorites';
import Settings from './screens/Settings';
import BottomTabs from './components/BottomTabs';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'favorites' | 'settings'>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen />;
      case 'library': return <Library />;
      case 'favorites': return <Favorites />;
      case 'settings': return <Settings />;
      default: return <HomeScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        {/* Container Principal com Limite de Largura para Desktop */}
        <View style={styles.appContainer}>
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
                    overflow: 'hidden' // Manter o overflow hidden no div de transição, mas o conteúdo interno rola
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  appContainer: {
    flex: 1,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: 'white',
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
    paddingBottom: 80, // Espaço para a TabBar fixa
  },
});
