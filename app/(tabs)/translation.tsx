import { detectLanguage, useTranslation } from '@/src/api/translationAPI';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';
import { IconButton, useTheme } from 'react-native-paper';
import { languagesData } from '@/constants/values';

type Data = {
  TT: number;
  message: string;
  origin_language: string;
  target_language: string;
  wordsNotToTranslate: string;
  translation: string;
}

type DataLang = {
  message: string;
  lang: string;
  confidence: number;
}

export default function TranslationScreen() {
  const theme = useTheme();
  const [data, setData] = useState<Data | null>(null);
  const [dataLang, setDataLang] = useState<DataLang | null>(null);
  const [language, setLanguage] = useState<string>('pt');
  let text = 'Bom dia!';// for testing purposes
  const handleTranslationClick = async () => {
    const resultLang = await detectLanguage(text);
    setDataLang(resultLang);
    console.log(resultLang);
    const result = await useTranslation(resultLang.lang, language, text);
    setData(result);
    console.log(result);
  }

  return (
    <View style={styles.container}>
      <Text>Voice Translation Screen</Text>
      <Text>Test</Text>
      <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
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
      <Button mode="contained" onPress={handleTranslationClick}>
        Press me
      </Button>
      {data && <Text>{data.translation}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dropdown: {
    height: 40,
    width: 150,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999999',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#333333',
  },
});