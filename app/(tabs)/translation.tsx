import { styles as stylesA } from "@/constants/styles";
import { useTranslation } from "@/src/context/TranslationContext";
import { useHistory } from "@/src/context/TranslationHistoryContext";
import { useAuth } from "@/src/context/UserContext";
import { languagesData } from "@/src/types/types";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Speech from "expo-speech";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import {
  IconButton,
  useTheme,
  Text as PaperText,
  Surface,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

/* -------- locale map STT / TTS -------- */
const localeMap: Record<string, string> = {
  pt: "pt-PT",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
};

export default function TranslationScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { saveTranslation } = useHistory();
  const { performDetectionAndTranslation, isLoading } = useTranslation();

  const [language, setLanguage] = useState(
    user?.preferred_language || "pt"
  );

  const [spokenText, setSpokenText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  /* -------- STT EVENTS -------- */
  useSpeechRecognitionEvent("result", (event) => {
    if (event.results?.length) {
      setSpokenText(event.results[0].transcript);
    }
  });

  useSpeechRecognitionEvent("end", () => {
    setIsRecording(false);
    if (spokenText) {
      handleTranslation(spokenText);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    setIsRecording(false);
    Alert.alert(
      "Erro no reconhecimento",
      event.message || "Erro desconhecido"
    );
  });

  /* -------- Permissions -------- */
  useEffect(() => {
    (async () => {
      const { granted } =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      setHasPermission(granted);
      if (!granted) {
        Alert.alert(
          "Permissão necessária",
          "É necessário permitir o acesso ao microfone."
        );
      }
    })();
  }, []);

  /* -------- STT Controls -------- */
  const startRecording = async () => {
    if (!hasPermission) return;

    setSpokenText("");
    setTranslatedText("");
    setIsRecording(true);

    await ExpoSpeechRecognitionModule.start({
      lang: localeMap[language] || "pt-PT",
      interimResults: true,
      continuous: false,
    });
  };

  const stopRecording = async () => {
    await ExpoSpeechRecognitionModule.stop();
  };

  /* -------- Translation -------- */
  const handleTranslation = async (text: string) => {
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

  /* -------- Actions -------- */
  const handleTTS = () => {
    if (!translatedText) return;
    Speech.speak(translatedText, {
      language: localeMap[language] || "pt-PT",
    });
  };

  const copyToClipboard = () => {
    Clipboard.setStringAsync(translatedText);
  };

  /* -------- UI -------- */
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <PaperText
            variant="headlineMedium"
            style={{ fontWeight: "bold", color: theme.colors.primary }}
          >
            Voice Translator
          </PaperText>
          <PaperText
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Tap the mic to translate instantly
          </PaperText>
        </View>

        <View style={styles.selectorContainer}>
          <PaperText
            variant="labelLarge"
            style={{ marginBottom: 5, color: theme.colors.outline }}
          >
            Translate to:
          </PaperText>
          <Dropdown
            style={[
              stylesA.dropdown,
              { borderColor: theme.colors.outline, borderWidth: 1 },
            ]}
            placeholderStyle={stylesA.placeholderStyle}
            selectedTextStyle={stylesA.selectedTextStyle}
            data={languagesData}
            labelField="label"
            valueField="value"
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
        </View>

        <Surface style={styles.inputCard} elevation={1}>
          <PaperText variant="labelMedium" style={{ marginBottom: 5 }}>
            Original
          </PaperText>
          <PaperText variant="bodyLarge" style={{ fontStyle: "italic" }}>
            {spokenText || "Tap the mic and speak"}
          </PaperText>
        </Surface>

        <View style={styles.micContainer}>
          <TouchableOpacity
            style={[
              styles.micButton,
              {
                backgroundColor: isRecording
                  ? theme.colors.error
                  : theme.colors.primary,
              },
            ]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
          >
            {isRecording ? (
              <Ionicons name="stop" size={40} color="#fff" />
            ) : (
              <Ionicons name="mic" size={40} color="#fff" />
            )}
          </TouchableOpacity>
          <PaperText style={{ marginTop: 10 }}>
            {isRecording ? "Listening..." : "Tap to Speak"}
          </PaperText>
        </View>

        {translatedText && (
          <Surface style={styles.resultCard} elevation={4}>
            <PaperText variant="headlineSmall">
              {translatedText}
            </PaperText>
            <View style={styles.actionRow}>
              <IconButton icon="volume-high" onPress={handleTTS} />
              <IconButton icon="content-copy" onPress={copyToClipboard} />
            </View>
          </Surface>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------- Styles -------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  header: { marginBottom: 25 },
  selectorContainer: { marginBottom: 25 },
  inputCard: { padding: 16, borderRadius: 16, marginBottom: 30 },
  micContainer: { alignItems: "center", marginBottom: 30 },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  resultCard: { padding: 20, borderRadius: 20 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
