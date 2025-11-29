import { styles as stylesA } from "@/constants/styles";
import { languagesData } from "@/constants/values";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import {
  Button,
  FAB,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import {
  Phrase,
  PhrasesProvider,
  usePhrases,
} from "../../src/context/PhrasesContext";

const PhraseItem = ({
  item,
  onDelete,
  isUserPhrase,
}: {
  item: Phrase;
  onDelete?: (id: string) => void;
  isUserPhrase: boolean;
}) => {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.itemContainer,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemText, { color: theme.colors.onSurface }]}>
          {item.text || item.translation}
        </Text>
        <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
          {item.category}
        </Text>
      </View>

      {isUserPhrase && onDelete && (
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={{ padding: 8 }}
        >
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const PhrasesContent = () => {
  const theme = useTheme();
  const {
    userPhrases,
    genericPhrases,
    fetchPhrases,
    deletePhrase,
    isLoading,
    addPhrase,
  } = usePhrases();
  const [modalVisible, setModalVisible] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<string>("pt");
  const [targetLanguage, setTargetLanguage] = useState<string>("en");
  const [newPhraseText, setNewPhraseText] = useState<string>("");
  const [newPhraseCategory, setNewPhraseCategory] = useState<string>("General");
  const [newPhraseLanguage, setNewPhraseLanguage] =
    useState<string>(sourceLanguage);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchPhrases(sourceLanguage);
  }, [sourceLanguage]);

  const allPhrases = [...userPhrases, ...genericPhrases];

  const handleDelete = (id: string) => {
    Alert.alert("Delete Phrase", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deletePhrase(id) },
    ]);
  };

  const handleAddPhrase = async () => {
    if (!newPhraseText.trim()) {
      alert("Phrase cannot be empty");
      return;
    }

    setLoading(true);
    const result = await addPhrase({
      text: newPhraseText,
      language: newPhraseLanguage,
      category: newPhraseCategory,
    });
    setLoading(false);

    if (result.error) {
      alert("Error updating: " + result.error);
    } else {
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Quick Phrases</Text>
      </View>
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text
            variant="headlineSmall"
            style={{ marginBottom: 20, textAlign: "center" }}
          >
            Add New Phrase
          </Text>

          <TextInput
            label="Phrase"
            value={newPhraseText}
            onChangeText={setNewPhraseText}
            mode="outlined"
            style={{ marginBottom: 20 }}
          />
          <TextInput
            label="Category"
            value={newPhraseText}
            onChangeText={setNewPhraseCategory}
            mode="outlined"
            style={{ marginBottom: 20 }}
          />
          <TextInput //later going to be change to an API call to auto detect the language
            label="Phrase"
            value={newPhraseText}
            onChangeText={setNewPhraseLanguage}
            mode="outlined"
            style={{ marginBottom: 20 }}
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
              onPress={handleAddPhrase}
              loading={loading}
              disabled={loading}
            >
              Save
            </Button>
          </View>
        </Modal>
      </Portal>
      <View style={styles.rowContainer}>
        <Dropdown
          style={[stylesA.dropdown, styles.halfDropdown]}
          placeholderStyle={stylesA.placeholderStyle}
          selectedTextStyle={stylesA.selectedTextStyle}
          data={languagesData}
          maxHeight={300}
          labelField="label"
          valueField="value"
          value={sourceLanguage}
          onChange={(item) => setSourceLanguage(item.value)}
          renderRightIcon={() => (
            <Ionicons
              name="chevron-down"
              size={20}
              color={theme.colors.onSurface}
            />
          )}
        />
        <Dropdown
          style={[stylesA.dropdown, styles.halfDropdown]}
          placeholderStyle={stylesA.placeholderStyle}
          selectedTextStyle={stylesA.selectedTextStyle}
          data={languagesData}
          maxHeight={300}
          labelField="label"
          valueField="value"
          value={targetLanguage}
          onChange={(item) => setTargetLanguage(item.value)}
          renderRightIcon={() => (
            <Ionicons
              name="chevron-down"
              size={20}
              color={theme.colors.onSurface}
            />
          )}
        />
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={allPhrases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PhraseItem
              item={item}
              isUserPhrase={userPhrases.some((p) => p.id === item.id)}
              onDelete={handleDelete}
            />
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20, color: "#999" }}>
              No phrases available for the selected language.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => setModalVisible(true)}
      />
    </View>
  );
};

export default function PhrasesScreen() {
  return (
    <PhrasesProvider>
      <PhrasesContent />
    </PhrasesProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 60,
    backgroundColor: "#fff",
  },
  headerContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  halfDropdown: {
    width: "48%",
  },
  itemContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 60,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
});
