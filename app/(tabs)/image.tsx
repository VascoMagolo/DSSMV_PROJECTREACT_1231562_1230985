import { styles as stylesA } from '@/constants/styles';
import { ocrAPI } from '@/src/api/ocrAPI';
import { translationAPI } from '@/src/api/translationAPI';
import { useOCRHistory } from '@/src/context/OCRHistoryContext';
import { useAuth } from "@/src/context/UserContext";
import { languagesData } from '@/src/types/types';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useTheme, Text as PaperText, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ImageScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>(user?.preferred_language || 'en');
  const [translatedText, setTranslatedText] = useState<string>('');
  const { saveOCRRecord } = useOCRHistory();

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
      setExtractedText('');
      setTranslatedText('');

      try {
        const text = await ocrAPI.useOCR(result.assets[0].uri);
        console.log("Image URI:", result.assets[0].uri);
        console.log("Detected Text:", text);
        
        const translationResult = await translationAPI.detectAndTranslate(language, JSON.stringify(text));
        
        setExtractedText(text);
        setTranslatedText(translationResult.translatedText);
        
        await saveOCRRecord(
          result.assets[0].uri,
          text,
          translationResult.translatedText,
          language,
          translationResult.detectedLanguage
        );
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : (typeof e === 'string' ? e : JSON.stringify(e));
        setExtractedText("Error reading text. " + errorMessage);
        setTranslatedText("Error translating text.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <PaperText variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
            Photo Translator
          </PaperText>
          <PaperText variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Capture text from images instantly
          </PaperText>
        </View>

        <View style={styles.imageContainer}>
          {image ? (
            <Surface style={styles.imageSurface} elevation={4}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              {loading && (
                 <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                    <ActivityIndicator size="large" color="#FFF" />
                    <PaperText style={{ color: '#FFF', marginTop: 10, fontWeight: 'bold' }}>Processing...</PaperText>
                 </View>
              )}
            </Surface>
          ) : (
             <TouchableOpacity 
               style={[styles.placeholderImage, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surfaceVariant }]}
               onPress={handleImagePicked}
               activeOpacity={0.7}
             >
                <Ionicons name="camera-outline" size={60} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.5 }} />
                <PaperText style={{ marginTop: 10, color: theme.colors.onSurfaceVariant }}>Tap to take a photo</PaperText>
             </TouchableOpacity>
          )}
        </View>

        <View style={styles.controlsContainer}>
          <View style={styles.dropdownWrapper}>
            <Dropdown
              style={[stylesA.dropdown, { borderColor: theme.colors.outline, borderWidth: 1, borderRadius: 12 }]}
              placeholderStyle={stylesA.placeholderStyle}
              selectedTextStyle={stylesA.selectedTextStyle}
              data={languagesData}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Target Language"
              value={language}
              onChange={item => setLanguage(item.value)}
              renderRightIcon={() => (
                <Ionicons name="chevron-down" size={20} color={theme.colors.onSurface} />
              )}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.cameraButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleImagePicked}
            disabled={loading}
          >
             <Ionicons name="camera" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        {(extractedText || translatedText) && (
          <View style={styles.resultsContainer}>
            
            {extractedText ? (
              <Surface style={[styles.resultCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                 <View style={styles.cardHeader}>
                    <Ionicons name="scan-outline" size={20} color={theme.colors.primary} />
                    <PaperText variant="labelLarge" style={{ marginLeft: 8, color: theme.colors.primary }}>
                      Detected Text
                    </PaperText>
                 </View>
                 <PaperText variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                   {extractedText}
                 </PaperText>
              </Surface>
            ) : null}

            {translatedText ? (
              <Surface style={[styles.resultCard, { backgroundColor: theme.colors.surface }]} elevation={4}>
                 <View style={styles.cardHeader}>
                    <Ionicons name="language" size={20} color={theme.colors.secondary} />
                    <PaperText variant="labelLarge" style={{ marginLeft: 8, color: theme.colors.secondary }}>
                      Translated ({language.toUpperCase()})
                    </PaperText>
                 </View>
                 <PaperText variant="bodyLarge" style={{ fontWeight: '500', color: theme.colors.onSurface, lineHeight: 24 }}>
                   {translatedText}
                 </PaperText>
              </Surface>
            ) : null}

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
    marginBottom: 20,
    marginTop: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageSurface: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    aspectRatio: 4/3,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 15,
  },
  dropdownWrapper: {
    flex: 1,
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resultsContainer: {
    gap: 15,
  },
  resultCard: {
    padding: 16,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    opacity: 0.8
  },
});