import { styles as stylesA } from '@/constants/styles';
import { useTranslation } from '@/src/context/TranslationContext';
import { useHistory } from '@/src/context/TranslationHistoryContext';
import { useAuth } from '@/src/context/UserContext';
import { languagesData } from '@/src/types/types';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent
} from 'expo-speech-recognition';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { IconButton, useTheme } from 'react-native-paper';

export default function TranslationScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { saveTranslation } = useHistory();
  const { performDetectionAndTranslation, isLoading } = useTranslation();
  
  const [translatedText, setTranslatedText] = useState('');
  const [language, setLanguage] = useState<string>(user?.preferred_language || 'pt');
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');

  // Configurar reconhecimento de voz ao iniciar
  useEffect(() => {
    const setupVoiceRecognition = async () => {
      const isAvailable = await ExpoSpeechRecognitionModule.isRecognitionAvailable();
      if (!isAvailable) {
        Alert.alert('Aviso', 'Reconhecimento de voz não disponível');
      }
    };
    setupVoiceRecognition();
  }, []);

  // Listeners para eventos de reconhecimento
  useSpeechRecognitionEvent('start', () => {
    setIsRecording(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsRecording(false);
  });

  useSpeechRecognitionEvent('result', async (event) => {
    if (event.results && event.results[0]) {
      const text = event.results[0].transcript;
      setSpokenText(text);
      
      // Traduzir automaticamente quando tiver resultado final
      if (event.isFinal) {
        await handleTranslation(text);
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Erro no reconhecimento:', event.error, event.message);
    setIsRecording(false);
    Alert.alert('Erro', `Erro no microfone: ${event.message}`);
  });

  // 1. FUNÇÃO Speech-to-Text: Gravar voz
  const startVoiceRecording = async () => {
    try {
      // Verificar permissões
      const { granted } = await ExpoSpeechRecognitionModule.getPermissionsAsync();
      
      if (!granted) {
        const { granted: newGranted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!newGranted) {
          Alert.alert('Erro', 'Precisa de permitir o microfone');
          return;
        }
      }
      
      // Começar a ouvir
      await ExpoSpeechRecognitionModule.start({
        lang: 'pt-PT',
        interimResults: true,
        continuous: false,
      });
      
    } catch (error) {
      console.error('Erro ao gravar:', error);
      setIsRecording(false);
    }
  };

  // 2. FUNÇÃO: Parar gravação
  const stopVoiceRecording = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      console.error('Erro ao parar:', error);
    }
  };

  // 3. FUNÇÃO: Traduzir
  const handleTranslation = async (textToTranslate?: string) => {
    const text = textToTranslate || spokenText;
    
    if (!text) {
      Alert.alert('Aviso', 'Não há texto para traduzir');
      return;
    }
    
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

  // 4. FUNÇÃO Text-to-Speech: Falar a tradução
  const handleTTS = () => {
    if (!translatedText) {
      Alert.alert('Aviso', 'Não há texto para falar');
      return;
    }
    
    let speakLanguage = 'pt-PT';
    if (language === 'en') speakLanguage = 'en-US';
    if (language === 'es') speakLanguage = 'es-ES';
    if (language === 'fr') speakLanguage = 'fr-FR';
    if (language === 'de') speakLanguage = 'de-DE';
    
    Speech.speak(translatedText, {
      language: speakLanguage,
      rate: 0.9,
    });
  };

  // 5. FUNÇÃO: Parar de falar
  const stopSpeaking = () => {
    Speech.stop();
  };

  // 6. FUNÇÃO: Copiar para clipboard
  const copyToClipboard = async () => {
    if (!translatedText) {
      Alert.alert('Aviso', 'Não há texto para copiar');
      return;
    }
    
    await Clipboard.setStringAsync(translatedText);
    Alert.alert('Copiado', 'Texto copiado para a área de transferência');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Translation Screen</Text>
      
      {/* Mostrar texto falado */}
      {spokenText ? (
        <View style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            Texto Falado:
          </Text>
          <Text style={[styles.resultText, { color: theme.colors.onSurfaceVariant }]}>
            {spokenText}
          </Text>
        </View>
      ) : null}

      {/* Selecionar idioma */}
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

      {/* Botão para gravar voz - REDONDO */}
      <View style={styles.micButtonContainer}>
        <TouchableOpacity
          style={[
            styles.micButton,
            { 
              backgroundColor: isRecording ? 
                theme.colors.error : 
                theme.colors.primary 
            }
          ]}
          onPress={isRecording ? stopVoiceRecording : startVoiceRecording}
          disabled={isLoading}
        >
          <Ionicons 
            name={isRecording ? "stop" : "mic"} 
            size={25} 
            color="#FFF" 
          />
        </TouchableOpacity>
        
        <Text style={styles.micButtonLabel}>
          {isRecording ? 'A Gravar...' : 'Toque para falar'}
        </Text>
      </View>

      {/* Tradução */}
      <View style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}>
        <Text style={[styles.label, { color: theme.colors.onPrimaryContainer }]}>
          Translation
        </Text>
        <Text style={[styles.resultText, { color: theme.colors.onPrimaryContainer }]}>
          {translatedText || 'A tradução aparecerá aqui...'}
        </Text>
        <View style={styles.actionRow}>
          <IconButton 
            icon="content-copy" 
            size={20} 
            onPress={copyToClipboard}
            disabled={!translatedText}
          />
          <IconButton 
            icon="volume-high" 
            size={20} 
            onPress={handleTTS}
            disabled={!translatedText}
          />
          <IconButton 
            icon="stop" 
            size={20} 
            onPress={stopSpeaking}
          />
        </View>
      </View>

      {/* Instrução */}
      <Text style={styles.instruction}>
        {isRecording 
          ? 'Fale agora...' 
          : 'Toque no microfone para começar a falar'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  resultText: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 10,
    minHeight: 30,
  },
  // ESTILOS PARA O BOTÃO REDONDO
  micButtonContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  micButtonLabel: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  instruction: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic'
  }
});