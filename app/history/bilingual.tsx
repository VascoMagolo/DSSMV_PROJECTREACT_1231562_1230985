import {
  BilingualHistoryProvider,
  BilingualRecord,
  useHistory,
} from "@/src/context/BilingualHistoryContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";

/* ---------------- DAY ITEM ---------------- */

const DaySummaryItem = ({ date, count, onPress }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[styles.dayItemContainer, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.dayRow}>
        <View style={[styles.calendarIcon, { backgroundColor: theme.colors.primaryContainer }]}>
          <Ionicons name="calendar-outline" size={22} color={theme.colors.onPrimaryContainer} />
        </View>

        <View style={styles.dayInfo}>
          <Text style={styles.dayDate}>{date}</Text>
          <Text style={styles.dayCount}>
            {count} {count === 1 ? "Conversation" : "Conversations"}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={theme.colors.outline} />
      </View>
    </TouchableOpacity>
  );
};

/* ---------------- CHAT BUBBLE ---------------- */

const ChatBubble = ({ item, onDelete, onToggleFavorite }) => {
  const theme = useTheme();
  const isA = item.speaker_side === "A";

  return (
    <View style={[styles.chatBubbleContainer, { alignSelf: isA ? "flex-end" : "flex-start" }]}>
      <Text style={styles.speakerLabel}>
        {isA ? "Speaker A" : "Speaker B"} ({item.source_lang.toUpperCase()})
      </Text>

      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isA ? theme.colors.primary : theme.colors.surfaceVariant,
          },
        ]}
      >
        <Text style={{ color: isA ? "white" : theme.colors.onSurface }}>
          {item.original_text}
        </Text>

        <View style={styles.divider} />

        <Text style={{ fontWeight: "600", color: isA ? "white" : theme.colors.primary }}>
          {item.translated_text}
        </Text>

        <View style={styles.bubbleFooter}>
          <TouchableOpacity onPress={() => onToggleFavorite(item.id, item.is_favorite)}>
            <Ionicons
              name={item.is_favorite ? "heart" : "heart-outline"}
              size={16}
              color={item.is_favorite ? theme.colors.error : "gray"}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onDelete(item.id)}>
            <Ionicons name="trash-outline" size={16} color="gray" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

/* ---------------- MAIN SCREEN ---------------- */

const BilingualHistoryScreen = () => {
  const { bilingualHistory, isLoading, refreshHistory, deleteConversation, setConversationFavorite } =
    useHistory();

  const theme = useTheme();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState([]);

  /** 🔥 NOVO: refresh automático ao voltar */
  useFocusEffect(
    useCallback(() => {
      refreshHistory();
    }, [refreshHistory])
  );

  const groupedHistory = useMemo(() => {
    const groups = {};
    bilingualHistory.forEach(item => {
      const date = new Date(item.created_at).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return Object.entries(groups).map(([date, data]) => ({ date, data }));
  }, [bilingualHistory]);

  const handleDelete = (id) => {
    Alert.alert("Delete", "Delete this message?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteConversation(id) },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView>
        <View style={styles.header}>
          <IconButton icon="arrow-left" onPress={() => router.back()} />
          <Text variant="titleLarge">Conversation History</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={groupedHistory}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <DaySummaryItem
              date={item.date}
              count={item.data.length}
              onPress={() => {
                setSelectedDate(item.date);
                setSelectedRecords(item.data);
                setModalVisible(true);
              }}
            />
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <IconButton icon="close" onPress={() => setModalVisible(false)} />
          <FlatList
            data={selectedRecords}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble
                item={item}
                onDelete={handleDelete}
                onToggleFavorite={setConversationFavorite}
              />
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

/* ---------------- PROVIDER ---------------- */

export default function BilingualHistoryPage() {
  return (
    <BilingualHistoryProvider>
      <BilingualHistoryScreen />
    </BilingualHistoryProvider>
  );
}
