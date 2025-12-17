import { BilingualHistoryProvider, BilingualRecord, useHistory } from "@/src/context/BilingualHistoryContext"; // Ajuste o import conforme necessário
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import {
    IconButton,
    Text,
    useTheme
} from "react-native-paper";

const DaySummaryItem = ({ date, count, onPress }: { date: string, count: number, onPress: () => void }) => {
    const theme = useTheme();
    return (
        <TouchableOpacity 
            style={[styles.dayItemContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]} 
            onPress={onPress}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.calendarIcon, { backgroundColor: theme.colors.secondaryContainer }]}>
                    <Ionicons name="calendar" size={20} color={theme.colors.onSecondaryContainer} />
                </View>
                <View style={{ marginLeft: 15 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.onSurface }}>
                        {date}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                        {count} {count === 1 ? 'Interaction' : 'Interactions'}
                    </Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurfaceVariant} />
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
    const bubbleColor = isSideA ? theme.colors.primaryContainer : theme.colors.surfaceVariant;
    const textColor = isSideA ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant;

    return (
        <View style={[styles.chatBubbleContainer, alignStyle]}>
            <Text style={[styles.speakerLabel, { color: theme.colors.outline, textAlign: isSideA ? 'right' : 'left' }]}>
                {isSideA ? `${item.source_lang.toUpperCase()}` : `${item.source_lang.toUpperCase()}`}
            </Text>

            <View style={[styles.messageBubble, { backgroundColor: bubbleColor, borderBottomRightRadius: isSideA ? 4 : 16, borderTopLeftRadius: isSideA ? 16 : 4 }]}>
            
                <Text style={{ fontSize: 16, color: textColor, fontWeight: '400' }}>
                    {item.original_text}
                </Text>
                <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginVertical: 6 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 15, color: textColor, fontWeight: 'bold', flex: 1 }}>
                        {item.translated_text}
                    </Text>
                </View>
            
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                    <Text style={[styles.timestamp, { color: textColor, opacity: 0.6 }]}>{time}</Text>
                    
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity onPress={() => onToggleFavorite(item.id, item.is_favorite)}>
                             <Ionicons name={item.is_favorite ? "heart" : "heart-outline"} size={16} color={item.is_favorite ? theme.colors.error : textColor} style={{opacity: 0.7}} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDelete(item.id)}>
                             <Ionicons name="trash-outline" size={16} color={textColor} style={{opacity: 0.7}} />
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

    useFocusEffect(
        useCallback(() => {
            refreshHistory();
        }, [])
    );

    const groupedHistory = useMemo(() => {
        const groups: { [key: string]: BilingualRecord[] } = {};
        
        bilingualHistory.forEach(item => {
            const dateKey = new Date(item.created_at).toLocaleDateString();
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
                data: groups[date].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) // Ordena as mensagens dentro do chat (antigas -> novas)
            }));
    }, [bilingualHistory]);
    const handleDayPress = (date: string, records: BilingualRecord[]) => {
        setSelectedDate(date);
        setSelectedRecords(records);
        setModalVisible(true);
    };
    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Confirmation",
            "Are you sure you want to delete this translation?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteConversation(id);
                        setSelectedRecords(prev => prev.filter(item => item.id !== id));
                        if (selectedRecords.length <= 1) setModalVisible(false);
                    },
                },
            ]
        );
    }

    return (
        <View style={[styles.mainContainer, { backgroundColor: '#F2F2F7' }]}>
            <View style={styles.headerContainer}>
                <IconButton
                    icon="arrow-left"
                    size={25}
                    onPress={() => router.back()}
                />
                <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
                    History
                </Text>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={{ color: theme.colors.error }}>Error: {error}</Text>
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
                    contentContainerStyle={{ padding: 10 }}
                    ListEmptyComponent={
                        <Text style={{textAlign: 'center', marginTop: 50, color: '#999'}}>Nenhum histórico encontrado.</Text>
                    }
                />
            )}

            <Modal
                animationType="slide"
                presentationStyle="pageSheet"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
                    <View style={styles.modalHeader}>
                        <IconButton icon="close" onPress={() => setModalVisible(false)} />
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{selectedDate}</Text>
                        <IconButton icon="dots-horizontal" disabled /> 
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
                        contentContainerStyle={{ padding: 15, paddingBottom: 50 }}
                    />
                </SafeAreaView>
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
        paddingTop: 10,
        paddingHorizontal: 5,
        backgroundColor: '#fff',
        paddingBottom: 10,
        elevation: 2
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    dayItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        elevation: 1,
    },
    calendarIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    chatBubbleContainer: {
        marginBottom: 15,
        width: '85%',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sentBubble: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4, 
    },
    receivedBubble: {
        alignSelf: 'flex-start',
        borderTopLeftRadius: 4,
    },
    langLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
        opacity: 0.7
    },
    timestamp: {
        fontSize: 10,
    },
    speakerLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
        marginHorizontal: 5
    },
});