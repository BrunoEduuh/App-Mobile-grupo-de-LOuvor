import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useStore } from '../store/useStore';

interface ThemeColors {
  background: string;
  card: string;
  text: string;
  subtitle: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  divider: string;
  input: string;
  blue: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  fontSize: number;
  fontScale: number;
  sfs: (size: number) => number; // Scaled Font Size
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const lightColors: ThemeColors = {
  background: '#F8FAFC',
  card: 'white',
  text: '#03045E',
  subtitle: '#94A3B8',
  primary: '#023E8A',
  secondary: '#0284C7',
  accent: '#FFD700',
  border: '#F1F5F9',
  divider: '#F1F5F9',
  input: '#F8FAFC',
  blue: '#023E8A',
};

export const darkColors: ThemeColors = {
  background: '#000000',
  card: '#121212',
  text: '#FFFFFF',
  subtitle: '#A1A1AA',
  primary: '#FFD700', // Gold
  secondary: '#FFD700',
  accent: '#FFD700',
  border: '#27272A',
  divider: '#27272A',
  input: '#121212',
  blue: '#0284C7',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { settings } = useStore();

  const isDark = useMemo(() => {
    // If the user hasn't explicitly set a theme, follow system.
    // We'll treat 'system' as the default and remove the button from UI.
    if (settings.theme === 'system') {
      return systemColorScheme === 'dark';
    }
    return settings.theme === 'dark';
  }, [settings.theme, systemColorScheme]);

  const colors = isDark ? darkColors : lightColors;

  // Font size logic: 16 is base.
  // We can calculate a scale factor based on settings.fontSize
  const fontScale = useMemo(() => settings.fontSize / 16, [settings.fontSize]);

  const sfs = useMemo(() => (size: number) => Math.round(size * fontScale), [fontScale]);

  const value = useMemo(() => ({
    colors,
    isDark,
    fontSize: settings.fontSize,
    fontScale,
    sfs,
  }), [colors, isDark, settings.fontSize, fontScale, sfs]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
