import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#006C67', 
        tabBarInactiveTintColor: '#757575', 
        headerShown: false, 
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        }
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
      if (!isGuest) {
        <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <MaterialIcons name="account-circle" size={28} color={color} />,
        }}
      />
      }
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}