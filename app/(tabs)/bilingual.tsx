import { styles as stylesA } from '@/constants/styles';
import { useHistory } from '@/src/context/BilingualHistoryContext';
import { useTranslation } from "@/src/context/TranslationContext";
import { useSpeechRecognition } from '@/src/hooks/speechRecognition';
import { languagesData } from '@/src/types/types';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import React, { useReducer } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { IconButton, useTheme } from 'react-native-paper';

const localeMap: Record<string, string> = {
  pt: 'pt-PT',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
};

type BilingualState = {
  langA: string;
  langB: string;
};

type BilingualAction =
  | { type: 'SET_LANG_A'; payload: string }
  | { type: 'SET_LANG_B'; payload: string }
  | { type: 'SWAP_LANGUAGES' };

const initialState: BilingualState = {
  langA: 'en',
  langB: 'pt',
};

function bilingualReducer(state: BilingualState, action: BilingualAction): BilingualState {
  switch (action.type) {
    case 'SET_LANG_A': return { ...state, langA: action.payload };
    case 'SET_LANG_B': return { ...state, langB: action.payload };
    case 'SWAP_LANGUAGES':
      return { ...state, langA: state.langB, langB: state.langA };
    default: return state;
  }
}

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
  const { saveTranslation } = useHistory(); 
  const { performDetectionAndTranslation } = useTranslation();

  const [state, dispatch] = useReducer(bilingualReducer, initialState);

  const handleTranslate = async (
    originalText: string, 
    sourceLang: string, 
    targetLang: string, 
    speakerSide: 'A' | 'B',
    setTargetText: (t: string) => void
  ) => {
    if (!originalText.trim()) return;

    const result = await performDetectionAndTranslation(originalText, targetLang);
    if (result) {
      setTargetText(result.translatedText);
      Speech.speak(result.translatedText, { language: localeMap[targetLang] || 'en-US' });

      await saveTranslation(
        result.originalText,
        result.translatedText,
        sourceLang,
        targetLang,
        speakerSide
      );
    }
  };

  const speakerA = useSpeechRecognition((text) => {
    handleTranslate(text, state.langA, state.langB, 'A', (t) => speakerB.setSpokenText(t));
  });

  const speakerB = useSpeechRecognition((text) => {
    handleTranslate(text, state.langB, state.langA, 'B', (t) => speakerA.setSpokenText(t));
  });

  const handleSwap = () => {
    dispatch({ type: 'SWAP_LANGUAGES' });
    
    const textA = speakerA.spokenText;
    const textB = speakerB.spokenText;
    speakerA.setSpokenText(textB);
    speakerB.setSpokenText(textA);
  };

  const onPressA = () => {
    if (speakerA.isRecording) {
      speakerA.stopRecording();
    } else if (!speakerB.isRecording) {
      speakerA.startRecording();
    }
  };

  const onPressB = () => {
    if (speakerB.isRecording) {
      speakerB.stopRecording();
    } else if (!speakerA.isRecording) {
      speakerB.startRecording();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: '#F0F2F5' }]}
    >
      <TranslationCard
        language={state.langA}
        setLanguage={(val: string) => dispatch({ type: 'SET_LANG_A', payload: val })}
        text={speakerA.spokenText}
        isRotated={true}
        onSpeak={onPressA}
        isListening={speakerA.isRecording}
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
        language={state.langB}
        setLanguage={(val: string) => dispatch({ type: 'SET_LANG_B', payload: val })}
        text={speakerB.spokenText}
        isRotated={false}
        onSpeak={onPressB}
        isListening={speakerB.isRecording}
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
    paddingBottom: 50,
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