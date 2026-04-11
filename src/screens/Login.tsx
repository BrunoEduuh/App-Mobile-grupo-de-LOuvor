import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Alert, ActivityIndicator, ScrollView, Image, ImageBackground } from 'react-native';
import { motion } from 'motion/react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Anchor, Mail, Lock, LogIn, UserPlus, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const { colors, isDark } = useTheme();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos para prosseguir.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error(error);
      let message = 'Ocorreu um erro na autenticação. Tente novamente.';
      if (error.code === 'auth/user-not-found') message = 'Usuário não encontrado. Verifique o e-mail.';
      if (error.code === 'auth/wrong-password') message = 'Senha incorreta. Tente novamente.';
      if (error.code === 'auth/email-already-in-use') message = 'Este e-mail já está em uso por outro ministro.';
      if (error.code === 'auth/invalid-email') message = 'O formato do e-mail é inválido.';
      if (error.code === 'auth/weak-password') message = 'A senha deve ter pelo menos 6 caracteres.';
      
      Alert.alert('Falha na Autenticação', message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro de Conexão', 'Não foi possível entrar com o Google. Verifique se o domínio está autorizado no console do Firebase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80' }}
        style={styles.backgroundImage}
        blurRadius={isDark ? 10 : 5}
      >
        <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(2, 62, 138, 0.85)' : 'rgba(255, 255, 255, 0.7)' }]}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={styles.header}
              >
                <View style={[styles.logoBg, { backgroundColor: colors.primary }]}>
                  <Anchor size={48} color={isDark ? "black" : "#FFD700"} />
                </View>
                <Text style={[styles.title, { color: isDark ? 'white' : colors.text }]}>Firmados em Cristo</Text>
                <View style={styles.badge}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>MINISTÉRIO DE LOUVOR</Text>
                </View>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{ 
                  ...styles.card, 
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                  borderColor: colors.border 
                }}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {isLogin ? 'Acesso ao Altar' : 'Novo Ministro'}
                  </Text>
                  <Text style={[styles.cardSubtitle, { color: colors.subtitle }]}>
                    {isLogin ? 'Entre para gerenciar o repertório' : 'Cadastre-se para participar do louvor'}
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Mail size={14} color={colors.secondary} />
                    <Text style={[styles.label, { color: colors.secondary }]}>E-MAIL</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        color: colors.text, 
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC', 
                        borderColor: focusedInput === 'email' ? colors.primary : colors.border 
                      }
                    ]}
                    placeholder="exemplo@igreja.com"
                    placeholderTextColor={colors.subtitle}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Lock size={14} color={colors.secondary} />
                    <Text style={[styles.label, { color: colors.secondary }]}>SENHA</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        color: colors.text, 
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC', 
                        borderColor: focusedInput === 'password' ? colors.primary : colors.border 
                      }
                    ]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.subtitle}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry
                  />
                </View>

                {isLogin && (
                  <TouchableOpacity style={styles.forgotButton}>
                    <Text style={[styles.forgotText, { color: colors.secondary }]}>Esqueceu a senha?</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={handleAuth}
                  disabled={loading}
                  style={[styles.mainButton, { backgroundColor: colors.primary }]}
                >
                  {loading ? (
                    <ActivityIndicator color={isDark ? "black" : "white"} />
                  ) : (
                    <>
                      <Text style={[styles.mainButtonText, { color: isDark ? "black" : "white" }]}>
                        {isLogin ? 'ENTRAR AGORA' : 'CADASTRAR'}
                      </Text>
                      <ChevronRight size={20} color={isDark ? "black" : "white"} />
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <Text style={[styles.dividerText, { color: colors.subtitle }]}>OU ACESSE COM</Text>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                </View>

                <TouchableOpacity
                  onPress={handleGoogleLogin}
                  disabled={loading}
                  style={[styles.googleButton, { borderColor: colors.border, backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
                >
                  <Image 
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} 
                    style={styles.googleIcon}
                    referrerPolicy="no-referrer"
                  />
                  <Text style={[styles.googleButtonText, { color: colors.text }]}>Google Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsLogin(!isLogin)}
                  style={styles.switchButton}
                >
                  <Text style={[styles.switchText, { color: colors.secondary }]}>
                    {isLogin ? 'Ainda não tem conta? ' : 'Já possui cadastro? '}
                    <Text style={{ fontWeight: '900', textDecorationLine: 'underline' }}>
                      {isLogin ? 'Cadastre-se' : 'Entrar'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </motion.div>
              
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: isDark ? 'rgba(255,255,255,0.6)' : colors.subtitle }]}>
                  "Tudo o que tem fôlego louve ao Senhor."
                </Text>
                <Text style={[styles.footerRef, { color: colors.primary }]}>Salmos 150:6</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBg: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#023E8A',
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    padding: 24,
    paddingVertical: 32,
    borderRadius: 32,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.15,
    shadowRadius: 50,
    elevation: 20,
  },
  cardHeader: {
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'left',
    marginBottom: 4,
    lineHeight: 32,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'left',
    opacity: 0.7,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginLeft: 8,
  },
  input: {
    height: 64,
    borderRadius: 20,
    borderWidth: 2,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
    marginRight: 8,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.8,
  },
  mainButton: {
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  divider: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 11,
    fontWeight: '900',
    opacity: 0.5,
    letterSpacing: 1,
  },
  googleButton: {
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  googleIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  switchButton: {
    marginTop: 32,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    fontWeight: '600',
  },
  footerRef: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 1,
  },
});
