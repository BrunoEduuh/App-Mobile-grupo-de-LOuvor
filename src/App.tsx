import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import Escala from './screens/Escala';
import Biblioteca from './screens/Biblioteca';
import Settings from './screens/Settings';
import Login from './screens/Login';
import BottomTabs from './components/BottomTabs';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useStore } from './store/useStore';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';

async function testFirestoreConnection() {
  try {
    // Test connection by trying to fetch a doc from server that we allowed in rules
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("✅ Firestore connection verified.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("❌ Firestore connection failed: Client is offline or configuration is incorrect.");
    } else {
      // Other errors (like permission denied) actually mean we ARE connected to the server
      console.log("✅ Firestore server reached (Response: " + (error instanceof Error ? error.message : 'Unknown') + ")");
    }
  }
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'favorites' | 'settings'>('home');
  const [isInitializing, setIsInitializing] = useState(true);
  const { colors, isDark } = useTheme();
  const { syncWithFirebase, setUser, user } = useStore();

  useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
      } else {
        setUser(null);
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      const unsubscribe = syncWithFirebase();
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [isInitializing, user?.uid]);

  if (isInitializing) {
    return (
      <View style={[styles.root, { backgroundColor: isDark ? '#020617' : '#F1F5F9', justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#03045E" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.root, { backgroundColor: isDark ? '#020617' : '#F1F5F9' }]}>
        <View style={styles.appContainer}>
          <Login />
        </View>
      </View>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen onNavigate={setActiveTab} />;
      case 'library': return <Escala />;
      case 'favorites': return <Biblioteca />;
      case 'settings': return <Settings />;
      default: return <HomeScreen onNavigate={setActiveTab} />;
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#020617' : '#F1F5F9' }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      {/* Container Principal com Limite de Largura para Desktop */}
      <View style={[styles.appContainer, { backgroundColor: colors.card }]}>
        <SafeAreaView style={styles.safeArea}>
          {/* Conteúdo */}
          <View style={styles.content}>
            {renderContent()}
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
