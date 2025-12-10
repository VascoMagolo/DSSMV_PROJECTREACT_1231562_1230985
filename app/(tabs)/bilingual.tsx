import { styles as stylesA } from '@/constants/styles';
import { useTranslation } from "@/src/context/TranslationContext";
import { useHistory } from '@/src/context/TranslationHistoryContext';
import { languagesData } from '@/src/types/types';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent
} from 'expo-speech-recognition';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { IconButton, useTheme } from 'react-native-paper';

const TranslationCard = ({
  language,
  setLanguage,
  text,
  isRotated,
  onSpeak,
  isListening,
  theme,
  onCopy,
  onTTS
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
        {text ? (
          <>
            <IconButton 
              icon="content-copy" 
              size={20} 
              onPress={onCopy}
              style={styles.smallButton}
            />
            <IconButton 
              icon="volume-high" 
              size={20} 
              onPress={onTTS}
              style={styles.smallButton}
            />
          </>
        ) : null}
        
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
  
  const [langA, setLangA] = useState<string>('en');
  const [langB, setLangB] = useState<string>('pt');
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [listeningA, setListeningA] = useState(false);
  const [listeningB, setListeningB] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Configuração inicial simplificada - CORRIGIDO
  useEffect(() => {
    const checkVoiceRecognition = async () => {
      const isAvailable = await ExpoSpeechRecognitionModule.isRecognitionAvailable();
      if (!isAvailable) {
        Alert.alert('Aviso', 'Reconhecimento de voz não disponível');
      }
    };
    checkVoiceRecognition();
  }, []);

  // Listener único para resultados de voz
  useSpeechRecognitionEvent('result', async (event) => {
    if (event.results?.[0] && event.isFinal) {
      const text = event.results[0].transcript;
      const targetLang = listeningA ? langB : langB;
      const side = listeningA ? 'A' : 'B';
      
      const result = await performDetectionAndTranslation(text, targetLang);
      if (result) {
        if (side === 'A') {
          setTextA(text);
          setTextB(result.translatedText);
        } else {
          setTextB(text);
          setTextA(result.translatedText);
        }
        await saveTranslation(text, result.translatedText, result.detectedLanguage, targetLang);
      }
    }
  });

  // Handler para eventos de voz
  useSpeechRecognitionEvent('start', () => setIsRecording(true));
  useSpeechRecognitionEvent('end', () => {
    setIsRecording(false);
    setListeningA(false);
    setListeningB(false);
  });
  useSpeechRecognitionEvent('error', (event) => {
    Alert.alert('Erro', `Erro no microfone: ${event.message}`);
    setIsRecording(false);
    setListeningA(false);
    setListeningB(false);
  });

  // Função simplificada para iniciar gravação
  const startRecording = async (lang: string, side: 'A' | 'B') => {
    const { granted } = await ExpoSpeechRecognitionModule.getPermissionsAsync();
    if (!granted) {
      const { granted: newGranted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!newGranted) return Alert.alert('Erro', 'Precisa de permitir o microfone');
    }
    
    if (side === 'A') {
      setListeningA(true);
      setTextA("Listening...");
    } else {
      setListeningB(true);
      setTextB("A ouvir...");
    }
    
    await ExpoSpeechRecognitionModule.start({
      lang: lang === 'en' ? 'en-US' : 'pt-PT',
      interimResults: true,
      continuous: false,
    });
  };

  // Funções simplificadas para os botões
  const handleSpeakA = async () => listeningA 
    ? await ExpoSpeechRecognitionModule.stop()
    : await startRecording(langA, 'A');

  const handleSpeakB = async () => listeningB
    ? await ExpoSpeechRecognitionModule.stop()
    : await startRecording(langB, 'B');

  // TTS simplificado
  const handleTTS = (side: 'A' | 'B') => {
    const text = side === 'A' ? textA : textB;
    const lang = side === 'A' ? langA : langB;
    
    if (!text) return Alert.alert('Aviso', 'Não há texto para falar');
    
    const langMap: Record<string, string> = {
      'en': 'en-US', 'pt': 'pt-PT', 'es': 'es-ES', 
      'fr': 'fr-FR', 'de': 'de-DE'
    };
    
    Speech.speak(text, { language: langMap[lang] || 'en-US', rate: 0.9 });
  };

  // Funções auxiliares simples
  const handleSwap = () => {
    [setLangA(langB), setLangB(langA), setTextA(textB), setTextB(textA)];
  };

  const copyToClipboard = async (text: string) => {
    if (!text) return Alert.alert('Aviso', 'Não há texto para copiar');
    await Clipboard.setStringAsync(text);
    Alert.alert('Copiado', 'Texto copiado');
  };

  const stopSpeaking = () => Speech.stop();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: '#F0F2F5' }]}
    >
      <TranslationCard
        language={langA} setLanguage={setLangA} text={textA}
        isRotated={false} onSpeak={handleSpeakA} isListening={listeningA}
        theme={theme} onCopy={() => copyToClipboard(textA)} onTTS={() => handleTTS('A')}
      />
      
      <View style={styles.swapContainer}>
        <IconButton icon="swap-vertical" size={30} iconColor="white"
          containerColor={theme.colors.secondary} onPress={handleSwap}
          style={styles.swapButton}
        />
      </View>
      
      <TranslationCard
        language={langB} setLanguage={setLangB} text={textB}
        isRotated={false} onSpeak={handleSpeakB} isListening={listeningB}
        theme={theme} onCopy={() => copyToClipboard(textB)} onTTS={() => handleTTS('B')}
      />
      
      <View style={styles.stopContainer}>
        <IconButton icon="stop" size={24} onPress={stopSpeaking}
          containerColor={theme.colors.errorContainer} iconColor={theme.colors.error}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, justifyContent: 'space-between', paddingBottom: 20 },
  card: { flex: 1, borderRadius: 25, padding: 20, marginVertical: 5, elevation: 4, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, 
    shadowRadius: 8, justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  textContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  translatedText: { fontSize: 22, fontWeight: '500', textAlign: 'center' },
  actionRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
    marginTop: 10, gap: 10 },
  smallButton: { margin: 0 },
  micButton: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', 
    alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 5 },
  swapContainer: { height: 50, justifyContent: 'center', alignItems: 'center', 
    zIndex: 10, marginVertical: -25 },
  swapButton: { borderWidth: 4, borderColor: '#F0F2F5' },
  stopContainer: { alignItems: 'center', marginTop: 10, marginBottom: 20 }
});