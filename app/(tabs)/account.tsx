import { styles as stylesA } from "@/constants/styles";
import { useAuth } from "@/src/context/UserContext";
import { languagesData } from "@/src/types/types";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import {
  Avatar,
  Button,
  Divider,
  List,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

export default function AccountScreen() {
  const { user, signOut, isGuest, updateUserProfile } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [newLanguage, setNewLanguage] = useState<string>(
    user?.preferred_language || "en"
  );

  useEffect(() => {
    if (modalVisible && user?.username) {
      setNewName(user.username);
    }
  }, [modalVisible, user]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          signOut();
        },
      },
    ]);
  };

  const handleUpdateProfile = async () => {
    if (!newName.trim()) {
      alert("Username cannot be empty");
      return;
    }

    setLoading(true);
    const result = await updateUserProfile({
      username: newName,
      preferred_language: newLanguage,
    });
    setLoading(false);

    if (result.error) {
      alert("Error updating: " + result.error);
    } else {
      setModalVisible(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "G";
    const names = name.split(" ");
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={[styles.avatarContainer, { borderColor: theme.colors.surface }]}>
          <Avatar.Text
            size={90}
            label={isGuest ? "G" : getInitials(user?.username || "")}
            style={{ backgroundColor: theme.colors.primary }}
            color={theme.colors.onPrimary}
          />
        </View>
        <Text variant="headlineSmall" style={[styles.username, { color: theme.colors.onSurface }]}>
          {isGuest ? "Guest User" : user?.username}
        </Text>
        <Text variant="bodyMedium" style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>
          {isGuest ? "Sign in to save your history" : user?.email}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            Account Settings
          </List.Subheader>

          <List.Item
            title="Edit Profile"
            description="Change name & language"
            left={(props) => (
              <List.Icon {...props} icon="account-edit-outline" color={theme.colors.onSurfaceVariant} />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" color={theme.colors.outline} />}
            onPress={() => setModalVisible(true)}
            disabled={isGuest}
            titleStyle={isGuest && { color: theme.colors.outline }}
          />

          <Divider style={{ marginVertical: 4, backgroundColor: theme.colors.surfaceVariant }} />

          <List.Item
            title="Preferred Language"
            description={
              user?.preferred_language
                ? languagesData.find(l => l.value === user.preferred_language)?.label || user.preferred_language.toUpperCase()
                : "English"
            }
            left={(props) => <List.Icon {...props} icon="translate" color={theme.colors.onSurfaceVariant} />}
            disabled={isGuest}
            titleStyle={isGuest && { color: theme.colors.outline }}
          />
        </List.Section>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            Activity History
          </List.Subheader>
          
          <List.Item
            title="Image Translations"
            left={(props) => <List.Icon {...props} icon="image-text" color={theme.colors.onSurfaceVariant} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color={theme.colors.outline} />}
            onPress={() => router.push('/history/ocr')}
            disabled={isGuest}
            titleStyle={isGuest && { color: theme.colors.outline }}
          />
          
          <Divider style={{ marginLeft: 56, backgroundColor: theme.colors.surfaceVariant }} />
          
          <List.Item
            title="Conversation History"
            left={(props) => <List.Icon {...props} icon="chat-processing-outline" color={theme.colors.onSurfaceVariant} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color={theme.colors.outline} />}
            onPress={() => router.push('/history/bilingual')}
            disabled={isGuest}
            titleStyle={isGuest && { color: theme.colors.outline }}
          />
          
          <Divider style={{ marginLeft: 56, backgroundColor: theme.colors.surfaceVariant }} />
          
          <List.Item
            title="Voice Translations"
            left={(props) => <List.Icon {...props} icon="microphone-outline" color={theme.colors.onSurfaceVariant} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color={theme.colors.outline} />}
            onPress={() => router.push('/history/translation')}
            disabled={isGuest}
            titleStyle={isGuest && { color: theme.colors.outline }}
          />
        </List.Section>
      </View>

      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          textColor={theme.colors.error}
          style={{ borderColor: theme.colors.error, borderRadius: 12 }}
          contentStyle={{ paddingVertical: 6 }}
          icon="logout"
        >
          Log Out
        </Button>
      </View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <Text
            variant="headlineSmall"
            style={{ marginBottom: 20, textAlign: "center", fontWeight: 'bold', color: theme.colors.primary }}
          >
            Edit Profile
          </Text>

          <TextInput
            label="Username"
            value={newName}
            onChangeText={setNewName}
            mode="outlined"
            style={{ marginBottom: 20, backgroundColor: theme.colors.surface }}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
          />
          
          <Text variant="labelLarge" style={{ marginBottom: 5, color: theme.colors.onSurfaceVariant }}>
            Native Language
          </Text>
          <Dropdown
            style={[stylesA.dropdown, { borderColor: theme.colors.outline, borderWidth: 1, borderRadius: 4 }]}
            placeholderStyle={stylesA.placeholderStyle}
            selectedTextStyle={[stylesA.selectedTextStyle, { color: theme.colors.onSurface }]}
            data={languagesData}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select language"
            value={newLanguage}
            onChange={(item) => setNewLanguage(item.value)}
            renderRightIcon={() => (
              <Ionicons
                name="chevron-down"
                size={20}
                color={theme.colors.onSurface}
              />
            )}
          />

          <View style={styles.modalButtons}>
            <Button
              mode="text"
              onPress={() => setModalVisible(false)}
              style={{ marginRight: 10 }}
              textColor={theme.colors.onSurfaceVariant}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleUpdateProfile}
              loading={loading}
              disabled={loading}
              style={{ borderRadius: 8 }}
            >
              Save Changes
            </Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    borderWidth: 4,
    borderRadius: 50,
    padding: 2,
    marginBottom: 10,
  },
  username: {
    marginTop: 8,
    fontWeight: "bold",
  },
  email: {
    marginTop: 4,
    opacity: 0.8,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden", 
  },
  logoutContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  modalContainer: {
    padding: 24,
    margin: 20,
    borderRadius: 20,
    elevation: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 25,
  },
});