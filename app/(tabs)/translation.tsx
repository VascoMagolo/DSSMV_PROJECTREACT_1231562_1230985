import { styles as stylesA } from "@/constants/styles";
import { languagesData } from "@/constants/values";
import { useHistory } from "@/src/context/HistoryContext";
import { useTranslation } from "@/src/context/TranslationContext";
import { useAuth } from "@/src/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Button, IconButton, useTheme } from "react-native-paper";

export default function TranslationScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { saveTranslation } = useHistory();
  const { performDetectionAndTranslation, isLoading } = useTranslation(); 

  const [translatedText, setTranslatedText] = useState("");
  const [language, setLanguage] = useState<string>(
    user?.preferred_language || "pt"
  );

  // Sample text to translate, in a real app this would come from voice input
  let text = "Bom dia, como voce esta neste belo dia meu caro senhor!"; 

  const handleTranslationClick = async () => {
    const result = await performDetectionAndTranslation(text, language);
    
    if (result) {
      setTranslatedText(result.translatedText);
      await saveTranslation(
        result.originalText,
        result.translatedText,
        result.detectedLanguage,
        result.targetLang
      );
    }
  };
  const copyToClipboard = () => {
    Clipboard.setStringAsync(translatedText);
  }
  return (
    <View style={styles.container}>
      <Text>Voice Translation Screen</Text>
      <Text>Test</Text>
      <Dropdown
        style={stylesA.dropdown}
        placeholderStyle={stylesA.placeholderStyle}
        selectedTextStyle={stylesA.selectedTextStyle}
        data={languagesData}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder="Select Language"
        value={language}
        onChange={(item) => setLanguage(item.value)}
        renderRightIcon={() => (
          <Ionicons
            name="chevron-down"
            size={20}
            color={theme.colors.onSurface}
          />
        )}
      />
      <Button mode="contained" onPress={handleTranslationClick}>
        Press me
      </Button>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.primaryContainer },
        ]}
      >
        <Text
          style={[styles.label, { color: theme.colors.onPrimaryContainer }]}
        >
          Translation
        </Text>
        <Text
          style={[
            styles.resultText,
            { color: theme.colors.onPrimaryContainer },
          ]}
        >
          {translatedText}
        </Text>
        <View style={styles.actionRow}>
          <IconButton icon="content-copy" size={20} onPress={copyToClipboard} />
          <IconButton icon="volume-high" size={20} onPress={() => {}} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    color: "#666",
    fontWeight: "bold",
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  resultText: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 10,
  },
});
