import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import {
    IconButton,
    Text,
    useTheme,
    Surface
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { OCRHistoryProvider, OCRRecord, useOCRHistory } from "../../src/context/OCRHistoryContext";

const HistoryItem = ({
    item,
    onDelete,
}: {
    item: OCRRecord;
    onDelete: (id: string) => void;
}) => {
    const theme = useTheme();
    const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <View style={styles.cardHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.outline} />
                    <Text style={{ fontSize: 12, color: theme.colors.outline, fontWeight: '600' }}>
                        {formattedDate}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => onDelete(item.id)} hitSlop={10}>
                    <Ionicons name="trash-outline" size={18} color={theme.colors.error} style={{ opacity: 0.8 }} />
                </TouchableOpacity>
            </View>

            <View style={styles.imageContainer}>
                <Image
                    style={styles.image}
                    source={item.image_url}
                    placeholder={{ uri: 'https://picsum.photos/200/300' }}
                    contentFit="cover"
                    transition={500}
                />
                <View style={[styles.langBadge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <Text style={[styles.langText, { color: '#FFF' }]}>
                        {item.source_language.toUpperCase()} <Ionicons name="arrow-forward" size={10} /> {item.target_language.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.contentContainer}>
            
                <View style={styles.textBlock}>
                    <Text style={[styles.label, { color: theme.colors.primary }]}>DETECTED</Text>
                    <Text style={[styles.originalText, { color: theme.colors.onSurfaceVariant }]} numberOfLines={3}>
                        {item.extracted_text}
                    </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
                <View style={styles.textBlock}>
                    <Text style={[styles.label, { color: theme.colors.secondary }]}>TRANSLATION</Text>
                    <Text style={[styles.translatedText, { color: theme.colors.onSurface }]} numberOfLines={10}>
                        {item.translated_text}
                    </Text>
                </View>
            </View>
        </Surface>
    );
};

const HistoryContent = () => {
    const { ocrHistory, isLoading, fetchOCRHistory, deleteOCRRecord } = useOCRHistory();
    const theme = useTheme();
    const router = useRouter();
    
    useFocusEffect(
        useCallback(() => {
            fetchOCRHistory();
        }, [])
    );

    const handleDelete = (id: string) => {
        Alert.alert("Delete Record", "Are you sure you want to remove this scan?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteOCRRecord(id) },
        ]);
    };

    return (
        <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
            <SafeAreaView edges={['top']} style={{backgroundColor: theme.colors.background}}>
                <View style={styles.headerContainer}>
                    <IconButton
                        icon="arrow-left"
                        size={24}
                        onPress={() => router.push('/account')}
                        iconColor={theme.colors.onSurface}
                    />
                    <Text variant="titleLarge" style={{ fontWeight: "bold", color: theme.colors.onSurface }}>
                        OCR History
                    </Text>
                    <View style={{ width: 48 }} /> 
                </View>
            </SafeAreaView>

            {isLoading && ocrHistory.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={ocrHistory}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <HistoryItem
                            item={item}
                            onDelete={handleDelete}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <View style={[styles.emptyIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Ionicons name="scan-outline" size={40} color={theme.colors.outline} />
                            </View>
                            <Text style={{ textAlign: "center", marginTop: 16, color: theme.colors.outline, fontSize: 16 }}>
                                No scanned images yet.
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    onRefresh={fetchOCRHistory}
                    refreshing={isLoading}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default function TranslationHistoryScreen() {
    return (
        <OCRHistoryProvider>
            <HistoryContent />
        </OCRHistoryProvider>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingBottom: 10,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50
    },
    card: {
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    imageContainer: {
        width: '100%',
        height: 180,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    langBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    langText: {
        fontSize: 10,
        fontWeight: "bold",
    },
    contentContainer: {
        padding: 16,
    },
    textBlock: {
        gap: 4,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        opacity: 0.8
    },
    originalText: {
        fontSize: 15,
        lineHeight: 22,
        fontStyle: 'italic',
    },
    translatedText: {
        fontSize: 16,
        fontWeight: "600",
        lineHeight: 24,
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: 12,
        opacity: 0.5
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});