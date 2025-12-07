import { Tabs } from 'expo-router';
import React from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/src/context/UserContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { isGuest } = useAuth();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#006C67', 
        tabBarInactiveTintColor: '#757575', 
        headerShown: false, 
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
          backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background,
          borderTopColor: colorScheme === 'dark' ? Colors.dark.border : Colors.light.border,
          borderTopWidth: 1,
          left : 8,
          right: 8,
          paddingTop: 3,
          bottom: insets.bottom + 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        },
        tabBarHideOnKeyboard  : true,
      }}>
      
      <Tabs.Screen
        name="translation" 
        options={{
          title: 'Voice',
          tabBarIcon: ({ color }) => <MaterialIcons name="mic" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="bilingual"
        options={{
          title: 'Convo',
          tabBarIcon: ({ color }) => <MaterialIcons name="record-voice-over" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="image"
        options={{
          title: 'Image',
          tabBarIcon: ({ color }) => <MaterialIcons name="camera-alt" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="phrases"
        options={{
          title: 'Phrases',
          tabBarIcon: ({ color }) => <MaterialIcons name="chat" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <MaterialIcons name="account-circle" size={28} color={color} />,
          href: isGuest ? null : undefined
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}