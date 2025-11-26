import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Avatar, Text, Button, List, Divider, useTheme, Switch } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const { user, signOut, isGuest } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: async () => {
            await signOut();
          } 
        }
      ]
    );
  };

  const getInitials = (name: string) => {
    if (!name) return "G";
    const names = name.split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: '#F5F7FA' }]}>

      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={isGuest ? "G" : getInitials(user?.username || '')} 
          style={{ backgroundColor: theme.colors.primary }}
        />
        <Text variant="headlineSmall" style={styles.username}>
          {isGuest ? "Guest" : user?.username}
        </Text>
        <Text variant="bodyMedium" style={styles.email}>
          {isGuest ? "Guest Mode" : user?.email}
        </Text>
      </View>
      <View style={styles.section}>
        <List.Section>
          <List.Subheader>Account</List.Subheader>
          
          <List.Item
            title="Edit Profile"
            left={props => <List.Icon {...props} icon="account-edit-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => alert('Future functionality')}
            disabled={isGuest}
          />
          <Divider />
          <List.Item
            title="Native Language"
            description={user?.preferred_language ? user.preferred_language.toUpperCase() : "English"}
            left={props => <List.Icon {...props} icon="translate" />}
            onPress={() => alert('Here you would open a modal to change the language in the DB')}
            disabled={isGuest}
          />
        </List.Section>
      </View>

      <View style={styles.section}>
        <List.Section>
          <List.Subheader>App</List.Subheader>
          <List.Item
            title="About RTTC"
            left={props => <List.Icon {...props} icon="information-outline" />}
            onPress={() => alert('Version 1.0.0')}
          />
        </List.Section>
      </View>
      <View style={styles.logoutContainer}>
        <Button 
          mode="outlined" 
          onPress={() => {
            signOut();
          }}
          textColor={theme.colors.error}
          style={{ borderColor: theme.colors.error }}
          icon="logout"
        >
          Log Out
        </Button>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 100, 
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFF',
    marginBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  username: {
    marginTop: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  logoutContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  }
});