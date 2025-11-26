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
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/services/supabase';
import { Dropdown } from 'react-native-element-dropdown';
import { useTheme } from 'react-native-paper';
import { languagesData } from '@/constants/values';

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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.card}>

          <View style={styles.headerContainer}>
            <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="language" size={32} color="white" />
            </View>
            <Text style={[styles.appName, { color: theme.colors.primary }]}>RTTC</Text>
            <Text style={styles.welcomeText}>Welcome 👋</Text>
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleBtn, isLogin && styles.activeBtn]} 
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.toggleText, isLogin && styles.activeText]}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toggleBtn, !isLogin && styles.activeBtn]} 
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.toggleText, !isLogin && styles.activeText]}>Register</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.formContainer}>
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            )}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Preferred Language</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="language-outline" size={20} color="#666" style={styles.icon} />
                  <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={{ color: '#999', fontSize: 16 }}
                    selectedTextStyle={{ color: '#333', fontSize: 16 }}
                    containerStyle={{ borderRadius: 12, marginTop: 5 }}
                    data={languagesData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Language"
                    value={preferred_language}
                    onChange={item => setPreferredLanguage(item.value)}
                    renderRightIcon={() => (
                      <Ionicons name="chevron-down" size={20} color="#666" />
                    )}
                  />
                </View>
              </View>
            )}
            <TouchableOpacity 
              style={[styles.mainButton, { backgroundColor: theme.colors.primary }]} 
              onPress={isLogin ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.mainButtonText}>
                  {isLogin ? 'Login' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>
            {isLogin && (
              <TouchableOpacity onPress={() => { signInAsGuest(); router.replace('/(tabs)/translation'); }} style={{marginTop: 15}}>
                 <Text style={{textAlign: 'center', color: '#666'}}>Enter as Guest</Text>
              </TouchableOpacity>
            )}

          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', 
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EDEFF2',
    borderRadius: 30,
    padding: 4,
    marginBottom: 30,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  activeBtn: {
    backgroundColor: '#006C67',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  activeText: {
    color: '#FFFFFF',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0', 
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  dropdown: {
    flex: 1,
    height: '100%',
  },
  mainButton: {
    backgroundColor: '#006C67',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#006C67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});