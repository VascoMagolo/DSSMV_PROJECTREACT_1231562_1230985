import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/UserContext';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { AppColors } from '../constants/theme';
import { ModalPortal } from 'react-native-modals';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#006C67',
    secondary: '#FFD166',
    background: '#FAFAFA',
  },
};

const InitialLayout = () => {
  const { user, isLoading, isGuest } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
  
    const isAuthenticated = user !== null || isGuest;

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/translation');
    }
  }, [user, isGuest, isLoading, segments]);
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <InitialLayout />
         <ModalPortal />
      </AuthProvider>
    </PaperProvider>
    
  );
}