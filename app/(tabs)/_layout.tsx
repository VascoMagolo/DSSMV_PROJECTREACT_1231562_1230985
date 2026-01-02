import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/src/context/UserContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isGuest } = useAuth();
  
  const backgroundColor = colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF';
  const inactiveColor = colorScheme === 'dark' ? '#888888' : '#9E9E9E';
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#006C67',
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: -5,
          marginBottom: 5,
        },
        tabBarStyle: {
          bottom: insets.bottom,          
          left: 16,           
          right: 16,         
          height: 65,          
          elevation: 10,     
          backgroundColor: backgroundColor,
          borderRadius: 20,   
          borderTopWidth: 0,   
          paddingTop: 10,
          paddingBottom: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
        },
        tabBarHideOnKeyboard: true, 
      }}>
      
      <Tabs.Screen
        name="translation" 
        options={{
          title: 'Voice',
          tabBarIcon: ({ color }) => <MaterialIcons name="mic" size={30} color={color} />,
        }}
      />

      <Tabs.Screen
        name="bilingual"
        options={{
          title: 'Convo',
          tabBarIcon: ({ color }) => <MaterialIcons name="record-voice-over" size={30} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="image"
        options={{
          title: 'Image',
          tabBarIcon: ({ color }) => <MaterialIcons name="camera-alt" size={30} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="phrases"
        options={{
          title: 'Phrases',
          tabBarIcon: ({ color }) => <MaterialIcons name="chat-bubble" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={30} color={color} />,
          href: isGuest ? null : undefined
        }}
      />
      
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}