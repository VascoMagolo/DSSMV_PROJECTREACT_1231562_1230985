import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Avatar, 
  Text, 
  Button, 
  List, 
  Divider, 
  useTheme, 
  Portal, 
  Modal, 
  TextInput 
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/UserContext';
import { Dropdown } from 'react-native-element-dropdown';
import { styles as stylesA } from '@/constants/styles';
import { languagesData } from '@/constants/values';
import Ionicons from '@expo/vector-icons/build/Ionicons';

export default function AccountScreen() {
  const { user, signOut, isGuest, updateUserProfile } = useAuth();
  const theme = useTheme();
  const router = useRouter(); 
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [newLanguage, setNewLanguage] = useState<string>(user?.preferred_language || 'en');

  useEffect(() => {
    if (modalVisible && user?.username) {
      setNewName(user.username);
    }
  }, [modalVisible, user]);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: () => {
             signOut();
          } 
        }
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!newName.trim()) {
      alert("Username cannot be empty");
      return;
    }

    setLoading(true);
    const result = await updateUserProfile({ username: newName, preferred_language: newLanguage });
    setLoading(false);

    if (result.error) {
      alert("Error updating: " + result.error);
    } else {
      setModalVisible(false);
    }
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
            onPress={() => setModalVisible(true)}
            disabled={isGuest}
          />

          <Divider />
          
          <List.Item
            title="Native Language"
            description={user?.preferred_language ? user.preferred_language.toUpperCase() : "ENGLISH"}
            left={props => <List.Icon {...props} icon="translate" />}
            disabled={isGuest}
          />
        </List.Section>
      </View>
      <Portal>
        <Modal 
          visible={modalVisible} 
          onDismiss={() => setModalVisible(false)} 
          contentContainerStyle={styles.modalContainer}
        >
          <Text variant="headlineSmall" style={{marginBottom: 20, textAlign: 'center'}}>
            Edit Profile
          </Text>
          
          <TextInput
            label="Username"
            value={newName}
            onChangeText={setNewName}
            mode="outlined"
            style={{ marginBottom: 20 }}
          />
          <Dropdown
            style={[stylesA.dropdown]} 
            placeholderStyle={stylesA.placeholderStyle}
            selectedTextStyle={stylesA.selectedTextStyle}
            data={languagesData}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="To"
            value={newLanguage}
            onChange={item => setNewLanguage(item.value)}
            renderRightIcon={() => (
              <Ionicons name="chevron-down" size={20} color={theme.colors.onSurface} />
            )}
          />
          <View style={styles.modalButtons}>
            <Button 
              mode="text" 
              onPress={() => setModalVisible(false)} 
              style={{ marginRight: 10 }}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleUpdateProfile}
              loading={loading}
              disabled={loading}
            >
              Save
            </Button>
          </View>
        </Modal>
      </Portal>

      <View style={styles.section}>
        <List.Section>
          <List.Subheader>History</List.Subheader>
           <List.Item
            title="Image Translation History"
            left={props => <List.Icon {...props} icon="image" />}
            onPress={() => alert('Future functionality')}
            disabled={isGuest}
          />
          <Divider />
          <List.Item
            title="Conversation History"
            left={props => <List.Icon {...props} icon="account-voice" />}
            onPress={() => alert('Future functionality')}
            disabled={isGuest}
          />
          <Divider />
          <List.Item
            title="Voice History"
            left={props => <List.Icon {...props} icon="microphone" />}
            onPress={() => alert('Future functionality')}
            disabled={isGuest}
          />
        </List.Section>
      </View>

      <View style={styles.logoutContainer}>
        <Button 
          mode="outlined" 
          onPress={handleLogout}
          textColor={theme.colors.error}
          style={{ borderColor: theme.colors.error }}
          icon="logout"
        >
          Logout
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
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10
  }
});