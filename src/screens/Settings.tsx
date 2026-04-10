import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView } from 'react-native';
import { Settings as SettingsIcon, Bell, Moon, Type, Info, ChevronRight, LogOut, Sun, Monitor } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { settings, updateSettings } = useStore();
  const { colors, isDark } = useTheme();

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    isSwitch = false,
    children
  }: any) => (
    <View style={styles.settingItem}>
      <View style={[styles.settingIconBg, { backgroundColor: isDark ? '#121212' : '#F0F9FF', borderColor: isDark ? colors.primary : 'transparent', borderWidth: isDark ? 1 : 0 }]}>
        <Icon size={20} color={isDark ? colors.primary : '#023E8A'} />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={[styles.settingTitle, { color: colors.text, fontSize: settings.fontSize }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: colors.subtitle, fontSize: Math.max(10, settings.fontSize * 0.75) }]}>{subtitle}</Text>}
        {children}
      </View>
      {isSwitch && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E2E8F0', true: isDark ? colors.primary : '#023E8A' }}
          thumbColor="white"
        />
      )}
      {!isSwitch && !children && (
        <ChevronRight size={20} color="#CBD5E1" />
      )}
    </View>
  );

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={[styles.headerIconBg, { backgroundColor: colors.primary }]}>
            <SettingsIcon size={20} color={isDark ? "black" : "#FFD700"} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: Math.max(20, settings.fontSize * 1.3) }]}>Ajustes</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.subtitle, fontSize: Math.max(10, settings.fontSize * 0.65) }]}>Personalize sua experiência</Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.secondary, fontSize: Math.max(9, settings.fontSize * 0.55) }]}>Preferências</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingItem
              icon={Bell}
              title="Notificações"
              subtitle="Lembretes de ensaio e versículos"
              isSwitch
              value={settings.notifications}
              onValueChange={(val: boolean) => updateSettings({ notifications: val })}
            />
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <SettingItem
              icon={isDark ? Moon : Sun}
              title="Modo Escuro"
              subtitle="Visual Preto e Dourado"
              isSwitch
              value={settings.theme === 'dark'}
              onValueChange={(val: boolean) => updateSettings({ theme: val ? 'dark' : 'light' })}
            />
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            
            <View style={styles.fontSizeContainer}>
              <View style={styles.themeHeader}>
                <View style={[styles.settingIconBg, { backgroundColor: isDark ? '#121212' : '#F0F9FF', borderColor: isDark ? colors.primary : 'transparent', borderWidth: isDark ? 1 : 0 }]}>
                  <Type size={20} color={isDark ? colors.primary : '#023E8A'} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: colors.text, fontSize: settings.fontSize }]}>Tamanho da Fonte</Text>
                  <Text style={[styles.settingSubtitle, { color: colors.subtitle, fontSize: Math.max(10, settings.fontSize * 0.75) }]}>Arraste para ajustar a leitura ({settings.fontSize}px)</Text>
                </View>
              </View>
              
              <View style={styles.sliderWrapper}>
                <Text style={[styles.sliderLabel, { color: colors.subtitle }]}>A</Text>
                <View style={styles.sliderContainer}>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    step="1"
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      height: 6,
                      borderRadius: 3,
                      appearance: 'none',
                      backgroundColor: colors.border,
                      outline: 'none',
                      cursor: 'pointer',
                      // @ts-ignore
                      '--thumb-color': colors.primary,
                    }}
                  />
                  <style>
                    {`
                      input[type='range']::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 20px;
                        height: 20px;
                        border-radius: 10px;
                        background: ${colors.primary};
                        cursor: pointer;
                        border: 2px solid ${isDark ? '#000' : '#fff'};
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                      }
                      input[type='range']::-moz-range-thumb {
                        width: 20px;
                        height: 20px;
                        border-radius: 10px;
                        background: ${colors.primary};
                        cursor: pointer;
                        border: 2px solid ${isDark ? '#000' : '#fff'};
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                      }
                    `}
                  </style>
                </View>
                <Text style={[styles.sliderLabel, { color: colors.subtitle, fontSize: 20 }]}>A</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.secondary, fontSize: Math.max(9, settings.fontSize * 0.55) }]}>Sobre</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingItem
              icon={Info}
              title="Versão do App"
              subtitle="v1.0.5 - Firmados em Cristo"
            />
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <TouchableOpacity style={styles.logoutButton}>
              <LogOut size={20} color="#FF006E" />
              <Text style={[styles.logoutText, { fontSize: settings.fontSize }]}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.subtitle, fontSize: Math.max(10, settings.fontSize * 0.65) }]}>Desenvolvido com ❤️ para o Reino</Text>
          <Text style={[styles.footerSubtext, { color: colors.subtitle, opacity: 0.6, fontSize: Math.max(8, settings.fontSize * 0.55) }]}>© 2026 Firmados em Cristo</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerIconBg: {
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 16,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 32,
    padding: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIconBg: {
    padding: 12,
    borderRadius: 16,
    marginRight: 16,
  },
  sliderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  sliderContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '900',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  settingSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  fontSizeContainer: {
    padding: 16,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF006E',
    marginLeft: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
    paddingBottom: 40,
  },
  footerText: {
    fontWeight: '700',
    fontSize: 12,
  },
  footerSubtext: {
    fontWeight: '600',
    fontSize: 10,
    marginTop: 4,
  },
});
