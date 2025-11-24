import { View, Text, StyleSheet } from 'react-native';

export default function BilingualScreen() {
  return (
    <View style={styles.container}>
      <Text>Bilingual Conversation Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});