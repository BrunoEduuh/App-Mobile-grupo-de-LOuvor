import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet, Switch, ScrollView } from 'react-native';
import { Settings as SettingsIcon, Bell, Moon, Type, Info, ChevronRight, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Settings() {
  const { settings, updateSettings } = useStore();

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    isSwitch = false 
  }: any) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIconBg}>
        <Icon size={20} color="#023E8A" />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E2E8F0', true: '#023E8A' }}
          thumbColor="white"
        />
      ) : (
        <ChevronRight size={20} color="#CBD5E1" />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconBg}>
            <SettingsIcon size={20} color="#FFD700" />
          </View>
          <Text style={styles.headerTitle}>Ajustes</Text>
        </View>
        <Text style={styles.subtitle}>Personalize sua experiência</Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon={Bell}
              title="Notificações"
              subtitle="Lembretes de ensaio e versículos"
              isSwitch
              value={settings.notifications}
              onValueChange={(val: boolean) => updateSettings({ notifications: val })}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={Moon}
              title="Modo Escuro"
              subtitle="Tema visual do aplicativo"
              isSwitch
              value={settings.darkMode}
              onValueChange={(val: boolean) => updateSettings({ darkMode: val })}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={Type}
              title="Tamanho da Fonte"
              subtitle="Ajuste a leitura dos versículos"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon={Info}
              title="Versão do App"
              subtitle="v1.0.4 - Firmados em Cristo"
            />
            <View style={styles.divider} />
            <TouchableOpacity style={styles.logoutButton}>
              <LogOut size={20} color="#FF006E" />
              <Text style={styles.logoutText}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Desenvolvido com ❤️ para o Reino</Text>
          <Text style={styles.footerSubtext}>© 2026 Firmados em Cristo</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#023E8A',
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#03045E',
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0284C7',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 16,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 16,
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#03045E',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
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
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 12,
  },
  footerSubtext: {
    color: '#CBD5E1',
    fontWeight: '600',
    fontSize: 10,
    marginTop: 4,
  },
});
