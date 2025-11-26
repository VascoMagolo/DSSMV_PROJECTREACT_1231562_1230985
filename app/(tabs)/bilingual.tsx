import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { IconButton, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { languagesData } from '@/constants/values';
import { styles as stylesA } from '@/constants/styles';

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
  const [langA, setLangA] = useState<string | null>('en');
  const [langB, setLangB] = useState<string | null>('pt');

  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');

  const [listeningA, setListeningA] = useState(false);
  const [listeningB, setListeningB] = useState(false);
  const handleSwap = () => {
    const tempLang = langA;
    const tempText = textA;

    setLangA(langB);
    setTextA(textB);

    setLangB(tempLang);
    setTextB(tempText);
  };

  const handleSpeakA = () => {
    setListeningA(!listeningA);
    if (!listeningA) setTextA("Listening...");
  };

  const handleSpeakB = () => {
    setListeningB(!listeningB);
    if (!listeningB) setTextB("Listening...");
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