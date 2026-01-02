import { styles as stylesA } from "@/constants/styles";
import { useTranslation } from "@/src/context/TranslationContext";
import { useHistory } from "@/src/context/TranslationHistoryContext";
import { useAuth } from "@/src/context/UserContext";
import { languagesData } from "@/src/types/types";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { IconButton, useTheme, Text as PaperText, Surface } from "react-native-paper";
import { SafeAreaView } from 'react-native-safe-area-context';
export default function TranslationScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { saveTranslation } = useHistory();
  const { performDetectionAndTranslation, isLoading } = useTranslation();

  const [translatedText, setTranslatedText] = useState("");
  const [language, setLanguage] = useState<string>(
    user?.preferred_language || "pt"
  );

  // Mock input text for translation
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

  const handleTTS = async () => {
    Speech.speak(translatedText, { language: language });
  };

  const copyToClipboard = () => {
    Clipboard.setStringAsync(translatedText);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
    
        <View style={styles.header}>
          <PaperText variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
            Voice Translator
          </PaperText>
          <PaperText variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Tap the mic to translate instantly
          </PaperText>
        </View>

  
        <View style={styles.selectorContainer}>
          <PaperText variant="labelLarge" style={{ marginBottom: 5, color: theme.colors.outline }}>
            Translate to:
          </PaperText>
          <Dropdown
            style={[stylesA.dropdown, { borderColor: theme.colors.outline, borderWidth: 1, borderRadius: 12 }]}
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
        </View>

        <Surface style={[styles.inputCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
          <View style={styles.cardHeader}>
             <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.primary} />
             <PaperText variant="labelMedium" style={{ marginLeft: 8, color: theme.colors.primary }}>
               Original
             </PaperText>
          </View>
          <PaperText variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic' }}>
            "{text}"
          </PaperText>
        </Surface>

        <View style={styles.micContainer}>
          <TouchableOpacity
            style={[
              styles.micButton,
              { 
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
              }
            ]}
            onPress={handleTranslationClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#FFF" />
            ) : (
              <Ionicons name="mic" size={40} color="#FFF" />
            )}
          </TouchableOpacity>
          <PaperText variant="labelMedium" style={{ marginTop: 10, color: theme.colors.onSurfaceVariant }}>
            {isLoading ? "Translating..." : "Tap to Speak"}
          </PaperText>
        </View>

        {translatedText ? (
          <Surface style={[styles.resultCard, { backgroundColor: theme.colors.surface }]} elevation={4}>
            <View style={styles.cardHeader}>
              <Ionicons name="language" size={18} color={theme.colors.secondary} />
              <PaperText variant="labelMedium" style={{ marginLeft: 8, color: theme.colors.secondary }}>
                Translation ({language.toUpperCase()})
              </PaperText>
            </View>
            
            <PaperText variant="headlineSmall" style={{ fontWeight: '500', color: theme.colors.onSurface, marginVertical: 10 }}>
              {translatedText}
            </PaperText>

            <View style={styles.divider} />

            <View style={styles.actionRow}>
              <View style={{ flexDirection: 'row' }}>
                <IconButton 
                  icon="volume-high" 
                  size={24} 
                  iconColor={theme.colors.primary} 
                  onPress={handleTTS} 
                />
                <IconButton 
                  icon="content-copy" 
                  size={24} 
                  iconColor={theme.colors.primary} 
                  onPress={copyToClipboard} 
                />
              </View>
              <IconButton 
                icon="share-variant" 
                size={24} 
                iconColor={theme.colors.outline} 
                onPress={() => {}} 
              />
            </View>
          </Surface>
        ) : (
          <View style={styles.placeholderContainer}>
             <PaperText variant="bodyMedium" style={{ color: theme.colors.outline, textAlign: 'center' }}>
               The translation will appear here.
             </PaperText>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  header: {
    marginBottom: 25,
    marginTop: 10,
  },
  selectorContainer: {
    marginBottom: 25,
  },
  inputCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  micContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  resultCard: {
    padding: 20,
    borderRadius: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0', 
    marginVertical: 10,
    opacity: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: -10, 
    marginRight: -10
  },
  placeholderContainer: {
    marginTop: 20,
    padding: 20,
    opacity: 0.6,
    justifyContent: 'center',
    alignItems: 'center'
  }
});