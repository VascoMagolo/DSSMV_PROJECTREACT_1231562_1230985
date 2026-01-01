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
      activeOpacity={0.7}
      style={[
        styles.itemContainer,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: theme.colors.secondaryContainer }]}>
         <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.colors.onSecondaryContainer} />
      </View>

      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={[styles.itemText, { color: theme.colors.onSurface }]} numberOfLines={2}>
          {item.text || item.translation}
        </Text>
        <Text style={{ fontSize: 11, color: theme.colors.outline, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {item.category || "General"}
        </Text>
      </View>

      {isUserPhrase && onDelete && (
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={[styles.deleteButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
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
    <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
      
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>Quick Phrases</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Tap to translate instantly
        </Text>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.dropdownWrapper}>
             <Dropdown
              style={[stylesA.dropdown, { borderColor: theme.colors.outline, borderRadius: 12 }]}
              placeholderStyle={stylesA.placeholderStyle}
              selectedTextStyle={stylesA.selectedTextStyle}
              data={languagesData}
              maxHeight={300}
              labelField="label"
              valueField="value"
              value={sourceLanguage}
              onChange={(item) => setSourceLanguage(item.value)}
              renderRightIcon={() => (
                <Ionicons name="chevron-down" size={18} color={theme.colors.onSurface} />
              )}
            />
        </View>
        
        <Ionicons name="arrow-forward" size={20} color={theme.colors.outline} style={{ marginHorizontal: 8 }} />

        <View style={styles.dropdownWrapper}>
            <Dropdown
              style={[stylesA.dropdown, { borderColor: theme.colors.outline, borderRadius: 12 }]}
              placeholderStyle={stylesA.placeholderStyle}
              selectedTextStyle={stylesA.selectedTextStyle}
              data={languagesData}
              maxHeight={300}
              labelField="label"
              valueField="value"
              value={targetLanguage}
              onChange={(item) => setTargetLanguage(item.value)}
              renderRightIcon={() => (
                <Ionicons name="chevron-down" size={18} color={theme.colors.onSurface} />
              )}
            />
        </View>
      </View>

      {isLoadingPhrases ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
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
            <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color={theme.colors.outlineVariant} />
                <Text style={{ textAlign: "center", marginTop: 10, color: theme.colors.outline }}>
                  No phrases found for {sourceLanguage.toUpperCase()}.
                </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Portal>
        <Modal
          visible={translationModalVisible}
          onDismiss={() => setTranslationModalVisible(false)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge" style={{ marginBottom: 20, textAlign: 'center', fontWeight: 'bold', color: theme.colors.primary }}>
            Translation
          </Text>

          {isTranslating ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ marginTop: 15, color: theme.colors.outline }}>Translating...</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.label}>ORIGINAL ({sourceLanguage.toUpperCase()})</Text>
              <View style={[styles.resultBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={{ fontSize: 16, color: theme.colors.onSurfaceVariant }}>{translatingPhrase?.text}</Text>
              </View>

              <View style={{ alignItems: 'center', marginVertical: 15 }}>
                <Ionicons name="arrow-down-circle" size={32} color={theme.colors.primary} />
              </View>

              <Text style={styles.label}>TRANSLATION ({targetLanguage.toUpperCase()})</Text>
              <View style={[styles.resultBox, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.onPrimaryContainer }}>
                  {translatedResult}
                </Text>
              </View>
            </View>
          )}

          <Button
            mode="text"
            onPress={() => setTranslationModalVisible(false)}
            style={{ marginTop: 25, alignSelf: 'flex-end' }}
            textColor={theme.colors.primary}
          >
            Close
          </Button>
        </Modal>
      </Portal>
      <Portal>
        <Modal
          visible={addModalVisible}
          onDismiss={() => setAddModalVisible(false)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="headlineSmall" style={{ marginBottom: 20, textAlign: "center", fontWeight: 'bold' }}>
            New Phrase
          </Text>

          <TextInput
            label="Phrase Text"
            value={newPhraseText}
            onChangeText={setNewPhraseText}
            mode="outlined"
            style={{ marginBottom: 15, backgroundColor: theme.colors.surface }}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
          />
          <TextInput
            label="Category (Optional)"
            value={newPhraseCategory}
            onChangeText={setNewPhraseCategory}
            mode="outlined"
            style={{ marginBottom: 25, backgroundColor: theme.colors.surface }}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
          />
          <View style={styles.modalButtons}>
            <Button
              mode="text"
              onPress={() => setAddModalVisible(false)}
              style={{ marginRight: 10 }}
              textColor={theme.colors.outline}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddPhrase}
              loading={loadingAdd}
              disabled={loadingAdd}
              style={{ paddingHorizontal: 10 }}
            >
              Save Phrase
            </Button>
          </View>
        </Modal>
      </Portal>

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
    padding: 16,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dropdownWrapper: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 12,
  },
  fab: {
    position: "absolute",
    margin: 20,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    elevation: 4,
  },
  modalContainer: {
    padding: 24,
    margin: 20,
    borderRadius: 24,
    elevation: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  resultBox: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 6,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
    opacity: 0.7,
  }
});