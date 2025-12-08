import { styles as stylesA } from '@/constants/styles';
import { useTranslation } from "@/src/context/TranslationContext";
import { languagesData } from '@/src/types/types';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { IconButton, useTheme } from 'react-native-paper';
const TranslationCard = ({
  language,
  setLanguage,
  text,
  isRotated,
  onSpeak,
  isListening,
  theme
}: any) => {
  return (
    <View style={[
      styles.card,
      { backgroundColor: theme.colors.surface },
      isRotated && { transform: [{ rotate: '180deg' }] }
    ]}>
      <View style={styles.headerRow}>
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
          onChange={item => setLanguage(item.value)}
          renderRightIcon={() => (
            <Ionicons name="chevron-down" size={20} color={theme.colors.onSurface} />
          )}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.translatedText, { color: text ? theme.colors.onSurface : '#999' }]}>
          {text || "Tap microphone to speak..."}
        </Text>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.micButton,
            { backgroundColor: isListening ? theme.colors.error : theme.colors.primary }
          ]}
          onPress={onSpeak}
        >
          <Ionicons name={isListening ? "stop" : "mic"} size={25} color="#FFF" />
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default function BilingualScreen() {
  const theme = useTheme();
  const [langA, setLangA] = useState<string>('en');
  const [langB, setLangB] = useState<string>('pt');

  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [listeningA, setListeningA] = useState(false);
  const [listeningB, setListeningB] = useState(false);
  const { performDetectionAndTranslation, isLoading } = useTranslation();
  const [translatedText, setTranslatedText] = useState("");

  const handleTTS = async (text: string, language: string) => {
      Speech.speak(text, { language: language });
    };

  const handleSwap = () => {
    const tempLang = langA;
    const tempText = textA;

    setLangA(langB);
    setTextA(textB);

    setLangB(tempLang);
    setTextB(tempText);
  };

  const handleSpeakA = async () => {
    setListeningA(!listeningA);
    if (!listeningA) setTextA("Listening...");
    let text = "Bom dia, como voce esta neste belo dia meu caro senhor!"; // Sample text
    const result = await performDetectionAndTranslation(text, langB);

    if (result) {
      setTranslatedText(result.translatedText);
      setTextB(result.translatedText);
    }
    handleTTS(textB, langB);
  };

  const handleSpeakB = async () => {
    setListeningB(!listeningB);
    if (!listeningB) setTextB("Listening...");
    let text = "Good Morning, how are you on this beautiful day my dear sir!"; // Sample text
    const result = await performDetectionAndTranslation(text, langA);

    if (result) {
      setTranslatedText(result.translatedText);
      setTextA(result.translatedText);
    }
    handleTTS(textA,langA);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: '#F0F2F5' }]}
    >
      <TranslationCard
        language={langA}
        setLanguage={setLangA}
        text={textA}
        isRotated={true}
        onSpeak={handleSpeakA}
        isListening={listeningA}
        theme={theme}
      />
      <View style={styles.swapContainer}>
        <IconButton
          icon="swap-vertical"
          size={30}
          iconColor="white"
          containerColor={theme.colors.secondary}
          onPress={handleSwap}
          style={styles.swapButton}
        />
      </View>
      <TranslationCard
        language={langB}
        setLanguage={setLangB}
        text={textB}
        isRotated={false}
        onSpeak={handleSpeakB}
        isListening={listeningB}
        theme={theme}
      />

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  card: {
    flex: 1,
    borderRadius: 25,
    padding: 20,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  translatedText: {
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  swapContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    marginVertical: -25,
  },
  swapButton: {
    borderWidth: 4,
    borderColor: '#F0F2F5',
  }
});