  import { TranslationProvider } from '@/src/context/TranslationContext';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ModalPortal } from 'react-native-modals';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { PhrasesProvider } from '../src/context/PhrasesContext';
import { TranslationHistoryProvider } from '../src/context/TranslationHistoryContext';
import { useAuth, UserProvider } from '../src/context/UserContext';

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
      <UserProvider>
        <TranslationProvider>
          <TranslationHistoryProvider>
            <PhrasesProvider>
            <InitialLayout />
            <ModalPortal />
            </PhrasesProvider>
          </TranslationHistoryProvider>
        </TranslationProvider>
      </UserProvider>
    </PaperProvider>
  );
}