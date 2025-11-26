import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Button, useTheme } from 'react-native-paper';
import { ocrAPI } from '@/src/api/ocrAPI';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';
import { languagesData } from '@/constants/values';
import { styles as stylesA } from '@/constants/styles';
import { translationAPI } from '@/src/api/translationAPI';

export default function ImageScreen() {
  const theme = useTheme();
  
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('pt');
  const [translatedText, setTranslatedText] = useState<string>('');
  const handleImagePicked = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permissions required!");
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8, 
    });

    if (!result.canceled) {
      setLoading(true);
      setImage(result.assets[0].uri);
      setExtractedText('Processing...');
      setTranslatedText('Translating...');

      try {
        const text = await ocrAPI.useOCR(result.assets[0].uri);
        const translationResult = await translationAPI.detectAndTranslate(language, JSON.stringify(text));
        setExtractedText(text);
        setTranslatedText(translationResult.translatedText);
      } catch (e) {
        setExtractedText("Error reading text.");
        setTranslatedText("Error translating text.");
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Image Reading (OCR)</Text>
      
      {image && (
        <Image source={{ uri: image }} style={styles.previewImage} />
      )}
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
      <Button 
        mode="contained" 
        onPress={handleImagePicked}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        {loading ? 'Reading...' : 'Take a Picture'}
      </Button>

        <View style={[styles.resultCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={{fontWeight: 'bold', marginBottom: 5, color: theme.colors.onSurface}}>Detected Text:</Text>
          <Text style={{fontSize: 16, color: theme.colors.onSurface}}>{extractedText}</Text>
        </View>
        <View style={[styles.resultCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={{fontWeight: 'bold', marginBottom: 5, color: theme.colors.onSurface}}>Translated Text:</Text>
          <Text style={{fontSize: 16, color: theme.colors.onSurface}}>{translatedText}</Text>
        </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    alignItems: 'center', 
    padding: 20,
    paddingTop: 60
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  previewImage: {
    width: 300,
    height: 300,
    borderRadius: 15,
    marginBottom: 20,
    resizeMode: 'contain',
    backgroundColor: '#E0E0E0'
  },
  button: {
    width: '80%',
    marginBottom: 20,
  },
  resultCard: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  }
});