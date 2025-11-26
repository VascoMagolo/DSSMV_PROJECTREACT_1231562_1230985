import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Button, useTheme } from 'react-native-paper';
import { ocrAPI } from '@/src/api/ocrAPI';

export default function ImageScreen() {
  const theme = useTheme();
  
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null);

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

      try {
        const text = await ocrAPI.useOCR(result.assets[0].uri);
       if (typeof text === 'object') {
            setExtractedText(JSON.stringify(text));
        } else {
            setExtractedText(text);
        }
      } catch (e) {
        setExtractedText("Error reading text.");
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