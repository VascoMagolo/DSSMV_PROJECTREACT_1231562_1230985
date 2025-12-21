import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Divider,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import {
  BilingualHistoryProvider,
  BilingualRecord,
  useBilingualHistory,
} from "../../src/context/BilingualHistoryContext";

const HistoryItem = ({
  item,
  onDelete,
  onToggleFavorite,
}: {
  item: BilingualRecord;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, currentStatus: boolean) => void;
}) => {
  const theme = useTheme();
  const formattedDate = new Date(item.created_at).toLocaleString();
  const isA = item.speaker_side === "A";

  return (
    <View
      style={[
        styles.itemRow,
        { justifyContent: isA ? "flex-start" : "flex-end" },
      ]}
    >
      <View
        style={[
          styles.itemContainer,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <View style={styles.headerRow}>
          <View
            style={[
              styles.langBadge,
              { backgroundColor: theme.colors.secondaryContainer },
            ]}
          >
            <Text
              style={[
                styles.langText,
                { color: theme.colors.onSecondaryContainer },
              ]}
            >
              {item.source_lang.toUpperCase()} →{" "}
              {item.target_lang.toUpperCase()}
            </Text>
          </View>
          <Text
            style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}
          >
            {formattedDate}
          </Text>
        </View>

        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.originalText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {item.original_text}
          </Text>
          <Ionicons
            name="arrow-down"
            size={16}
            color={theme.colors.outline}
            style={{ marginVertical: 4 }}
          />
          <Text
            style={[styles.translatedText, { color: theme.colors.primary }]}
          >
            {item.translated_text}
          </Text>
        </View>

        <Divider style={{ marginVertical: 8 }} />
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => onToggleFavorite(item.id, item.is_favorite)}
            style={styles.actionButton}
          >
            <Ionicons
              name={item.is_favorite ? "star" : "star-outline"}
              size={22}
              color={item.is_favorite ? "#FFD700" : theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDelete(item.id)}
            style={styles.actionButton}
          >
            <Ionicons
              name="trash-outline"
              size={22}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const HistoryContent = () => {
  const {
    bilingualHistory,
    isLoading,
    refreshHistory,
    deleteTranslation,
    toggleFavorite,
  } = useBilingualHistory();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refreshHistory();
    }, [refreshHistory])
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete",
      "Do you want to delete this translation from the conversation history?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteTranslation(id) },
      ]
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <IconButton
          icon="arrow-left"
          size={25}
          onPress={() => router.push("/(tabs)/bilingual")}
        />
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          Conversation History
        </Text>
      </View>

      {isLoading && bilingualHistory.length === 0 ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={bilingualHistory}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <HistoryItem
              item={item}
              onDelete={handleDelete}
              onToggleFavorite={toggleFavorite}
            />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Ionicons name="chatbubbles-outline" size={50} color="#ccc" />
              <Text
                style={{ textAlign: "center", marginTop: 10, color: "#999" }}
              >
                No conversation yet. Start speaking in the bilingual screen!
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 8 }}
          onRefresh={refreshHistory}
          refreshing={isLoading}
        />
      )}
    </View>
  );
};

export default function BilingualHistoryScreen() {
  return <HistoryContent />;
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 12,
    gap: 10,
  },
  itemRow: {
    flexDirection: "row",
    marginVertical: 4,
  },
  itemContainer: {
    borderRadius: 16,
    marginBottom: 4,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    maxWidth: "85%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  langBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  langText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  contentContainer: {
    marginBottom: 5,
  },
  originalText: {
    fontSize: 16,
    fontWeight: "500",
  },
  translatedText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15,
  },
  actionButton: {
    padding: 4,
  },
});
