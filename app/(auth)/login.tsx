import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/UserContext';
import { supabase } from '../../src/services/supabase';
import { Dropdown } from 'react-native-element-dropdown';
import { useTheme } from 'react-native-paper';
import { languagesData } from '@/src/types/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signInAsGuest } = useAuth();
  const theme = useTheme();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [preferred_language, setPreferredLanguage] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.error) {
      alert(result.error);
    } else {
      router.replace('/(tabs)/translation');
    }
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password || !preferred_language) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        alert('This email is already registered.');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('users')
        .insert({
          name: fullName,
          email: email,
          password: password,
          preferred_language: preferred_language || 'en', 
        });

      if (error) throw error;

      alert('Account created successfully! You are now logged in.');
      await handleLogin();

    } catch (error: any) {
      alert('Error: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          
            <View style={styles.headerSection}>
              <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="chatbubbles" size={32} color="white" />
              </View>
              <Text style={[styles.appTitle, { color: theme.colors.primary }]}>RTTC</Text>
              <Text style={[styles.subtitle, { color: theme.colors.secondary }]}>Real Time Translation Chat</Text>
            </View>

            <View style={[styles.card, { shadowColor: theme.colors.shadow }]}>
              
              <View style={[styles.toggleContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <TouchableOpacity 
                  style={[styles.toggleBtn, isLogin && styles.activeBtn]} 
                  onPress={() => setIsLogin(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.toggleText, isLogin ? styles.activeText : { color: theme.colors.onSurfaceVariant }]}>
                    Log In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.toggleBtn, !isLogin && styles.activeBtn]} 
                  onPress={() => setIsLogin(false)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.toggleText, !isLogin ? styles.activeText : { color: theme.colors.onSurfaceVariant }]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                
                {!isLogin && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.onSurface }]}>Full Name</Text>
                    <View style={[styles.inputWrapper, { borderColor: theme.colors.outline }]}>
                      <Ionicons name="person-outline" size={20} color={theme.colors.onSurfaceVariant} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: theme.colors.onSurface }]}
                        placeholder="John Doe"
                        value={fullName}
                        onChangeText={setFullName}
                        placeholderTextColor={theme.colors.outline}
                      />
                    </View>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.colors.onSurface }]}>Email Address</Text>
                  <View style={[styles.inputWrapper, { borderColor: theme.colors.outline }]}>
                    <Ionicons name="mail-outline" size={20} color={theme.colors.onSurfaceVariant} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.colors.onSurface }]}
                      placeholder="you@example.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor={theme.colors.outline}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.colors.onSurface }]}>Password</Text>
                  <View style={[styles.inputWrapper, { borderColor: theme.colors.outline }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={theme.colors.onSurfaceVariant} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.colors.onSurface }]}
                      placeholder="••••••••"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholderTextColor={theme.colors.outline}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={theme.colors.onSurfaceVariant} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {!isLogin && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.onSurface }]}>Preferred Language</Text>
                    <View style={[styles.inputWrapper, { borderColor: theme.colors.outline }]}>
                      <Ionicons name="language-outline" size={20} color={theme.colors.onSurfaceVariant} style={styles.inputIcon} />
                      <Dropdown
                        style={styles.dropdown}
                        placeholderStyle={{ color: theme.colors.outline, fontSize: 16 }}
                        selectedTextStyle={{ color: theme.colors.onSurface, fontSize: 16 }}
                        data={languagesData}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Language"
                        value={preferred_language}
                        onChange={item => setPreferredLanguage(item.value)}
                        renderRightIcon={() => (
                          <Ionicons name="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
                        )}
                      />
                    </View>
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.mainButton, { backgroundColor: theme.colors.primary }]} 
                  onPress={isLogin ? handleLogin : handleRegister}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.mainButtonText}>
                      {isLogin ? 'Log In' : 'Create Account'}
                    </Text>
                  )}
                </TouchableOpacity>

                {isLogin && (
                  <TouchableOpacity 
                    onPress={() => { signInAsGuest(); router.replace('/(tabs)/translation'); }} 
                    style={styles.guestButton}
                  >
                    <Text style={[styles.guestText, { color: theme.colors.secondary }]}>
                      Continue as Guest
                    </Text>
                  </TouchableOpacity>
                )}

              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 5,
    fontWeight: '500',
    opacity: 0.8
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeBtn: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  activeText: {
    color: '#000',
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    backgroundColor: 'transparent',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  dropdown: {
    flex: 1,
    height: '100%',
  },
  mainButton: {
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  guestButton: {
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
  },
  guestText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  }
});