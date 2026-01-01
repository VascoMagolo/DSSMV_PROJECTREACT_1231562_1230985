import { BilingualHistoryProvider, BilingualRecord, useHistory } from "@/src/context/BilingualHistoryContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
    StatusBar
} from "react-native";
import {
    IconButton,
    Text,
    useTheme,
    Surface
} from "react-native-paper";

const DaySummaryItem = ({ date, count, onPress }: { date: string, count: number, onPress: () => void }) => {
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
                    <Text style={[styles.dayDate, { color: theme.colors.onSurface }]}>
                        {date}
                    </Text>
                    <Text style={[styles.dayCount, { color: theme.colors.outline }]}>
                        {count} {count === 1 ? 'Conversation' : 'Conversations'}
                    </Text>
                </View>
                <View style={[styles.arrowContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.onSurfaceVariant} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const ChatBubble = ({
    item,
    onDelete,
    onToggleFavorite
}: {
    item: BilingualRecord,
    onDelete: (id: string) => void,
    onToggleFavorite: (id: string, status: boolean) => void
}) => {
    const theme = useTheme();
    const time = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isSideA = item.speaker_side === 'A';
    const alignStyle = isSideA ? { alignSelf: 'flex-end' as const } : { alignSelf: 'flex-start' as const };
    const bubbleColor = isSideA ? theme.colors.primary : theme.colors.surfaceVariant;
    const textColor = isSideA ? theme.colors.onPrimary : theme.colors.onSurfaceVariant;
    const subTextColor = isSideA ? 'rgba(255,255,255,0.7)' : theme.colors.outline;

    return (
        <View style={[styles.chatBubbleContainer, alignStyle]}>
            <Text style={[styles.speakerLabel, { color: theme.colors.outline, textAlign: isSideA ? 'right' : 'left' }]}>
                {isSideA ? `Speaker A (${item.source_lang.toUpperCase()})` : `Speaker B (${item.source_lang.toUpperCase()})`}
            </Text>

            <View style={[
                styles.messageBubble, 
                { 
                    backgroundColor: bubbleColor,
                    borderBottomRightRadius: isSideA ? 2 : 18,
                    borderBottomLeftRadius: isSideA ? 18 : 2
                }
            ]}>
                
                <Text style={{ fontSize: 16, color: textColor, marginBottom: 4 }}>
                    {item.original_text}
                </Text>
            
                <View style={{ height: 1, backgroundColor: isSideA ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', marginVertical: 6 }} />
            
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    <Ionicons name="language" size={14} color={subTextColor} />
                    <Text style={{ fontSize: 15, color: textColor, fontWeight: '600', flex: 1 }}>
                        {item.translated_text}
                    </Text>
                </View>
                <View style={styles.bubbleFooter}>
                    <Text style={{ fontSize: 10, color: subTextColor }}>{time}</Text>
                    
                    <View style={styles.bubbleActions}>
                        <TouchableOpacity onPress={() => onToggleFavorite(item.id, item.is_favorite)} hitSlop={{top: 10, bottom: 10, left: 10, right: 5}}>
                             <Ionicons name={item.is_favorite ? "heart" : "heart-outline"} size={16} color={item.is_favorite && !isSideA ? theme.colors.error : (isSideA ? 'white' : theme.colors.onSurfaceVariant)} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDelete(item.id)} hitSlop={{top: 10, bottom: 10, left: 5, right: 10}}>
                             <Ionicons name="trash-outline" size={16} color={subTextColor} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};


const BilingualHistoryScreen = () => {
    const { bilingualHistory, isLoading, error, refreshHistory, deleteConversation, setConversationFavorite } = useHistory();
    const router = useRouter();
    const theme = useTheme();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<BilingualRecord[]>([]);

    useEffect(() => {
        refreshHistory();
    }, []);

    const groupedHistory = useMemo(() => {
        const groups: { [key: string]: BilingualRecord[] } = {};

        bilingualHistory.forEach(item => {
            const dateKey = new Date(item.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(item);
        });
        
        return Object.keys(groups)
            .sort((a, b) => {
                const timeA = new Date(groups[a][0].created_at).getTime();
                const timeB = new Date(groups[b][0].created_at).getTime();
                return timeB - timeA;
            })
            .map(date => ({
                date,
                data: groups[date].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            }));
    }, [bilingualHistory]);

    const handleDayPress = (date: string, records: BilingualRecord[]) => {
        setSelectedDate(date);
        setSelectedRecords(records);
        setModalVisible(true);
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Message",
            "Are you sure you want to remove this message?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteConversation(id);
                        setSelectedRecords(prev => {
                            const updated = prev.filter(item => item.id !== id);
                            if (updated.length === 0) setModalVisible(false);
                            return updated;
                        });
                    },
                },
            ]
        );
    }

    return (
        <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
            <SafeAreaView>
                <View style={styles.headerContainer}>
                    <IconButton
                        icon="arrow-left"
                        size={24}
                        onPress={() => router.push('/account')}
                        iconColor={theme.colors.onSurface}
                    />
                    <Text variant="titleLarge" style={{ fontWeight: "bold", color: theme.colors.onSurface }}>
                        Conversation History
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                    <Text style={{ color: theme.colors.error, marginTop: 10 }}>{error}</Text>
                </View>
            ) : (
                <FlatList
                    data={groupedHistory}
                    keyExtractor={(item) => item.date}
                    renderItem={({ item }) => (
                        <DaySummaryItem
                            date={item.date}
                            count={item.data.length}
                            onPress={() => handleDayPress(item.date, item.data)}
                        />
                    )}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.outlineVariant} />
                            <Text style={{ textAlign: 'center', marginTop: 16, color: theme.colors.outline }}>
                                No conversations yet. Start talking!
                            </Text>
                        </View>
                    }
                />
            )}

            <Modal
                animationType="slide"
                presentationStyle="pageSheet"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                    <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
                        <IconButton icon="close" onPress={() => setModalVisible(false)} />
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{selectedDate}</Text>
                        <IconButton icon="dots-horizontal" disabled style={{opacity: 0}} />
                    </View>

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
                        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    />
                </View>
            </Modal>
        </View>
    );
}

export default function BilingualHistoryPage() {
    return (
        <BilingualHistoryProvider>
            <BilingualHistoryScreen />
        </BilingualHistoryProvider>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 10,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 100,
        opacity: 0.8,
    },
    dayItemContainer: {
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    dayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    calendarIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayInfo: {
        marginLeft: 16,
        flex: 1,
    },
    dayDate: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    dayCount: {
        fontSize: 13,
    },
    arrowContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    chatBubbleContainer: {
        marginBottom: 20,
        width: '85%',
    },
    speakerLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
        marginHorizontal: 8,
        opacity: 0.8
    },
    messageBubble: {
        padding: 14,
        borderRadius: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 1,
    },
    bubbleFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    bubbleActions: {
        flexDirection: 'row',
        gap: 12,
    }
});