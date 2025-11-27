import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme, FAB } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';
import { PhrasesProvider, usePhrases, Phrase } from '../../src/context/PhrasesContext';
import { styles as stylesA } from '@/constants/styles';
import { languagesData } from '@/constants/values';


const PhraseItem = ({ item, onDelete, isUserPhrase }: { item: Phrase, onDelete?: (id: string) => void, isUserPhrase: boolean }) => {
  const theme = useTheme();
  return (
    <View style={[styles.itemContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={{flex: 1}}>
        <Text style={[styles.itemText, { color: theme.colors.onSurface }]}>{item.text || item.translation}</Text>
        <Text style={{fontSize: 12, color: theme.colors.onSurfaceVariant}}>{item.category}</Text>
      </View>
      
      {isUserPhrase && onDelete && (
        <TouchableOpacity onPress={() => onDelete(item.id)} style={{padding: 8}}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const PhrasesContent = () => {
  const theme = useTheme();
  const { userPhrases, genericPhrases, fetchPhrases, deletePhrase, isLoading } = usePhrases();
  
  const [sourceLanguage, setSourceLanguage] = useState<string>('pt');
  const [targetLanguage, setTargetLanguage] = useState<string>('en');

  useEffect(() => {
    fetchPhrases(sourceLanguage);
  }, [sourceLanguage]);

  const allPhrases = [...userPhrases, ...genericPhrases];

  const handleDelete = (id: string) => {
    Alert.alert("Delete Phrase", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deletePhrase(id) }
    ]);
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Quick Phrases</Text>
      </View>
      <View style={styles.rowContainer}>
        <Dropdown
          style={[stylesA.dropdown, styles.halfDropdown]}
          placeholderStyle={stylesA.placeholderStyle}
          selectedTextStyle={stylesA.selectedTextStyle}
          data={languagesData}
          maxHeight={300}
          labelField="label"
          valueField="value"
          value={sourceLanguage}
          onChange={item => setSourceLanguage(item.value)}
          renderRightIcon={() => <Ionicons name="chevron-down" size={20} color={theme.colors.onSurface} />}
        />
        <Dropdown
          style={[stylesA.dropdown, styles.halfDropdown]}
          placeholderStyle={stylesA.placeholderStyle}
          selectedTextStyle={stylesA.selectedTextStyle}
          data={languagesData}
          maxHeight={300}
          labelField="label"
          valueField="value"
          value={targetLanguage}
          onChange={item => setTargetLanguage(item.value)}
          renderRightIcon={() => <Ionicons name="chevron-down" size={20} color={theme.colors.onSurface} />}
        />
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={allPhrases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PhraseItem 
              item={item} 
              isUserPhrase={userPhrases.some(p => p.id === item.id)}
              onDelete={handleDelete}
            />
          )}
          ListEmptyComponent={
            <Text style={{textAlign: 'center', marginTop: 20, color: '#999'}}>
              No phrases available for the selected language.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => alert("Here opens the modal to add a phrase (same as Android)")}
      />
    </View>
  );
};

export default function PhrasesScreen() {
  return (
    <PhrasesProvider>
      <PhrasesContent />
    </PhrasesProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfDropdown: {
    width: '48%',
  },
  itemContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});