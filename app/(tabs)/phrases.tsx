import { styles as stylesA } from "@/constants/styles";
import {
  Phrase,
  PhrasesProvider,
  usePhrases,
} from "@/src/context/PhrasesContext";
import { useTranslation } from "@/src/context/TranslationContext";
import { useAuth } from "@/src/context/UserContext";
import { languagesData } from "@/src/types/types";
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

const PhraseItem = ({
  item,
  onDelete,
  onPress,
  isUserPhrase,
}: {
  item: Phrase;
  onDelete?: (id: string) => void;
  onPress?: (phrase: Phrase) => void;
  isUserPhrase: boolean;
}) => {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(item)}
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
    </TouchableOpacity>
  );
};

const PhrasesContent = () => {
  const theme = useTheme();
  const {
    state, 
    fetchPhrases,
    deletePhrase,
    addPhrase,
  } = usePhrases();

  const { userPhrases, genericPhrases, isLoading: isLoadingPhrases } = state;

  const { performTranslation, isLoading: isTranslating } = useTranslation();

  const [translationModalVisible, setTranslationModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<string>("pt");
  const [targetLanguage, setTargetLanguage] = useState<string>("en");
  const [newPhraseText, setNewPhraseText] = useState<string>("");
  const [newPhraseCategory, setNewPhraseCategory] = useState<string>("General");
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [translatingPhrase, setTranslatingPhrase] = useState<Phrase | null>(null);
  const [translatedResult, setTranslatedResult] = useState<string>("");
  
  const { user } = useAuth();

  useEffect(() => {
    if (user?.preferred_language) {
      setSourceLanguage(user.preferred_language);
    }
  }, [user]);

  useEffect(() => {
    fetchPhrases(sourceLanguage);
  }, [sourceLanguage]);

  const allPhrases = [...(userPhrases || []), ...(genericPhrases || [])];

  const handleDelete = (id: string) => {
    Alert.alert("Delete Phrase", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deletePhrase(id) },
    ]);
  };

  const handlePhraseClick = async (phrase: Phrase) => {
    setTranslatingPhrase(phrase);
    setTranslationModalVisible(true);
    setTranslatedResult("");

    const result = await performTranslation(
      sourceLanguage,
      targetLanguage,
      phrase.text
    );
    
    if (result) {
      setTranslatedResult(result);
    } else {
      setTranslatedResult("Could not translate.");
    }
  };

  const handleAddPhrase = async () => {
    if (!newPhraseText.trim()) {
      alert("Phrase cannot be empty");
      return;
    }

    setLoadingAdd(true);
    const result = await addPhrase({
      text: newPhraseText,
      category: newPhraseCategory,
    });
    setLoadingAdd(false);

    if (result.error) {
      alert("Error: " + result.error);
    } else {
      setAddModalVisible(false);
      if (result.detectedLanguage && result.detectedLanguage !== sourceLanguage) {
        setSourceLanguage(result.detectedLanguage);
        Alert.alert("Language Detected", `The phrase was identified as "${result.detectedLanguage}" and the list has been updated.`);
      }
      setNewPhraseText("");
      setNewPhraseCategory("");
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Quick Phrases</Text>
      </View>
      
      <Portal>
        <Modal
          visible={translationModalVisible}
          onDismiss={() => setTranslationModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text variant="titleLarge" style={{ marginBottom: 15, textAlign: 'center', fontWeight: 'bold' }}>
            Translation
          </Text>

          {isTranslating ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ marginTop: 10 }}>Translating...</Text>
            </View>
          ) : (
            <View>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Original ({sourceLanguage}):</Text>
              <View style={[styles.resultBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={{ fontSize: 16 }}>{translatingPhrase?.text}</Text>
              </View>

              <View style={{ alignItems: 'center', marginVertical: 10 }}>
                <Ionicons name="arrow-down" size={24} color={theme.colors.primary} />
              </View>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Translation ({targetLanguage}):</Text>
              <View style={[styles.resultBox, { backgroundColor: theme.colors.secondaryContainer }]}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.onSecondaryContainer }}>
                  {translatedResult}
                </Text>
              </View>
            </View>
          )}

          <Button
            mode="contained"
            onPress={() => setTranslationModalVisible(false)}
            style={{ marginTop: 20 }}
          >
            Close
          </Button>
        </Modal>
      </Portal>
      <Portal>
        <Modal
          visible={addModalVisible}
          onDismiss={() => setAddModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text variant="headlineSmall" style={{ marginBottom: 20, textAlign: "center" }}>
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
            value={newPhraseCategory}
            onChangeText={setNewPhraseCategory}
            mode="outlined"
            style={{ marginBottom: 20 }}
          />
          <View style={styles.modalButtons}>
            <Button
              mode="text"
              onPress={() => setAddModalVisible(false)}
              style={{ marginRight: 10 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddPhrase}
              loading={loadingAdd}
              disabled={loadingAdd}
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
            <Ionicons name="chevron-down" size={20} color={theme.colors.onSurface} />
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
            <Ionicons name="chevron-down" size={20} color={theme.colors.onSurface} />
          )}
        />
      </View>

      <Text style={{ marginBottom: 10, fontStyle: 'italic', color: '#666', textAlign: 'center' }}>
        Tap a phrase to translate to {targetLanguage.toUpperCase()}
      </Text>

      {isLoadingPhrases ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={allPhrases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PhraseItem
              item={item}
              isUserPhrase={userPhrases?.some((p) => p.id === item.id) ?? false}
              onDelete={handleDelete}
              onPress={handlePhraseClick}
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
        onPress={() => setAddModalVisible(true)}
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
  resultBox: {
    padding: 15,
    borderRadius: 10,
    width: '100%',
  }
});