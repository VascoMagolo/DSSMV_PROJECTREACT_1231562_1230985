import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { signIn, signInAsGuest } = useAuth(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const theme = useTheme();

  const handlePressLogin = async () => {
    setLoading(true);
    
    const result = await signIn(email, password);
    
    setLoading(false); 

    if (result.error) {
      alert(result.error);
    } else {
      router.replace('/(tabs)/translation');
    }
  };

  const handleGuestLogin = () => {
    signInAsGuest();
    router.replace('/(tabs)/translation'); 
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.logoContainer}>
        <Text variant="displayMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>RTTC</Text>
        <Text variant="headlineSmall">Bem-vindo 👋</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
        />

        <Button 
          mode="contained" 
          onPress={handlePressLogin}
          loading={loading} 
          disabled={loading} 
          style={styles.button}
        >
          Entrar
        </Button>

        <Button 
          mode="outlined" 
          onPress={() => router.push('/(auth)/register')} 
          style={styles.button}
        >
          Criar Conta
        </Button>

        <Button 
          mode="text" 
          onPress={handleGuestLogin}
          style={styles.guestButton}
        >
          Continuar como Convidado
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  form: { width: '100%' },
  input: { marginBottom: 12 },
  button: { marginTop: 10, paddingVertical: 6 },
  guestButton: { marginTop: 20 },
});