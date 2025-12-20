import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Speech from "expo-speech";
import { IconButton, useTheme } from "react-native-paper";
import { styles as stylesA } from "@/constants/styles";
import { useTranslation } from "@/src/context/TranslationContext";
import { useHistory } from "@/src/context/TranslationHistoryContext";
import { useAuth } from "@/src/context/UserContext";
import { languagesData } from "@/src/types/types";

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

const localeMap: Record<string, string> = {
  pt: "pt-PT",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
};

export default function TranslationScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { saveTranslation } = useHistory();
  const { performDetectionAndTranslation } = useTranslation();

  const userDefaultLang = user?.preferred_language || "pt";

  const [inputLang] = useState(userDefaultLang);

  const [targetLang, setTargetLang] = useState(userDefaultLang);

  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [hasPermission, setHasPermission] = useState(false);

  useSpeechRecognitionEvent("result", (event) => {
    if (event.results && event.results.length > 0) {
      const newText = event.results[0].transcript;
      setSpokenText(newText);
    }
  });

  useSpeechRecognitionEvent("end", () => {
    setIsRecording(false);
    if (spokenText) {
      processTranslation(spokenText);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.log("Erro:", event.error, event.message);
    setIsRecording(false);
    Alert.alert("Erro no reconhecimento", event.message || "Erro desconhecido");
  });

  useEffect(() => {
    const requestPermissions = async () => {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      setHasPermission(granted);
      if (!granted) {
        Alert.alert("Permissão necessária", "É necessário permitir o acesso ao microfone.");
      }
    };
    requestPermissions();
  }, []);

  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert("Sem permissão", "Permita o acesso ao microfone nas configurações.");
      return;
    }

    setSpokenText("");
    setTranslatedText("");
    setIsRecording(true);

    const locale = localeMap[inputLang] || "pt-PT";

    try {
      await ExpoSpeechRecognitionModule.start({
        lang: locale,          
        interimResults: true,
        continuous: false,
      });
    } catch (error) {
      console.error("Erro ao iniciar:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      console.error("Erro ao parar:", error);
    }
  };

  const processTranslation = async (text: string) => {
    if (!text.trim()) return;
    const result = await performDetectionAndTranslation(text, targetLang);
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

  const handleTTS = () => {
    if (!translatedText) return;
    const locale = localeMap[targetLang] || "pt-PT";
    Speech.speak(translatedText, {
      language: locale,
      rate: 0.9,
    });
  };

  const copyToClipboard = () => {
    if (translatedText) {
      Clipboard.setStringAsync(translatedText);
      Alert.alert("Copiado", "Texto copiado para a área de transferência");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tradutor por Voz</Text>

      <View style={styles.micWrapper}>
        <TouchableOpacity
          style={[
            styles.micButton,
            {
              backgroundColor: isRecording
                ? theme.colors.error
                : hasPermission
                ? theme.colors.primary
                : "#ccc",
            },
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={!hasPermission}
        >
          <Ionicons name={isRecording ? "stop" : "mic"} size={28} color="#fff" />
        </TouchableOpacity>

        <Dropdown
          style={[stylesA.dropdown, { marginTop: 15 }]}
          placeholderStyle={stylesA.placeholderStyle}
          selectedTextStyle={stylesA.selectedTextStyle}
          data={languagesData}
          labelField="label"
          valueField="value"
          value={targetLang}
          placeholder="Selecionar idioma de saída"
          onChange={(item) => setTargetLang(item.value)}
          renderRightIcon={() => (
            <Ionicons
              name="chevron-down"
              size={20}
              color={theme.colors.onSurface}
            />
          )}
        />
      </View>

      <View style={[styles.card, { backgroundColor: "#e8f5e9", width: "100%" }]}>
        <Text style={styles.label}>Texto Falado</Text>
        <Text style={styles.spokenText}>
          {spokenText || (isRecording ? "A ouvir..." : "Fale algo...")}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: "#e3f2fd", width: "100%" }]}>
        <Text style={styles.label}>Tradução</Text>
        <Text style={styles.resultText}>
          {translatedText || "A tradução aparece aqui"}
        </Text>
        <View style={styles.actionRow}>
          <IconButton icon="content-copy" onPress={copyToClipboard} />
          <IconButton icon="volume-high" onPress={handleTTS} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  resultText: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 10,
  },
  spokenText: {
    fontSize: 16,
    minHeight: 40,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  micWrapper: {
    alignItems: "center",
    marginBottom: 25,
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 6,
  },
  warningText: {
    color: "orange",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
});
