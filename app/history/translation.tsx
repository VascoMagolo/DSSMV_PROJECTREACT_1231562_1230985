import { Ionicons } from "@expo/vector-icons";
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
import { TranslationHistoryProvider, TranslationRecord, useHistory } from "../../src/context/TranslationHistoryContext";

const HistoryItem = ({
    item,
    onDelete,
    onToggleFavorite,
}: {
    item: TranslationRecord;
    onDelete: (id: string) => void;
    onToggleFavorite: (id: string, currentStatus: boolean) => void;
}) => {
    const theme = useTheme();
    const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short'
    });

    return (
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <View style={styles.cardHeader}>
                <View style={[styles.langBadge, { backgroundColor: theme.colors.secondaryContainer }]}>
                    <Text style={[styles.langText, { color: theme.colors.onSecondaryContainer }]}>
                        {item.source_language.toUpperCase()}
                    </Text>
                    <Ionicons name="arrow-forward" size={12} color={theme.colors.onSecondaryContainer} style={{marginHorizontal: 4}} />
                    <Text style={[styles.langText, { color: theme.colors.onSecondaryContainer }]}>
                        {item.target_language.toUpperCase()}
                    </Text>
                </View>
                <Text style={{ fontSize: 11, color: theme.colors.outline, fontWeight: '600' }}>
                    {formattedDate}
                </Text>
            </View>

            <View style={styles.contentContainer}>
                <Text style={[styles.originalText, { color: theme.colors.onSurfaceVariant }]}>
                    {item.original_text}
                </Text>
                
                <View style={styles.arrowContainer}>
                    <Ionicons name="arrow-down-circle-outline" size={20} color={theme.colors.outlineVariant} />
                </View>

                <Text style={[styles.translatedText, { color: theme.colors.primary }]}>
                    {item.translated_text}
                </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />

            <View style={styles.cardFooter}>
                <TouchableOpacity
                    onPress={() => onToggleFavorite(item.id, item.is_favorite)}
                    style={styles.actionButton}
                    hitSlop={10}
                >
                    <Ionicons
                        name={item.is_favorite ? "star" : "star-outline"}
                        size={20}
                        color={item.is_favorite ? "#FFC107" : theme.colors.outline}
                    />
                    <Text style={{ marginLeft: 6, fontSize: 12, color: item.is_favorite ? "#FFC107" : theme.colors.outline }}>
                        {item.is_favorite ? "Favorite" : "Save"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onDelete(item.id)}
                    style={styles.actionButton}
                    hitSlop={10}
                >
                    <Ionicons name="trash-outline" size={18} color={theme.colors.error} style={{ opacity: 0.8 }} />
                    <Text style={{ marginLeft: 6, fontSize: 12, color: theme.colors.error, opacity: 0.8 }}>
                        Delete
                    </Text>
                </TouchableOpacity>
            </View>
        </Surface>
    );
};

const HistoryContent = () => {
    const { translationHistory, isLoading, refreshHistory, deleteTranslation, toggleFavorite } = useHistory();
    const theme = useTheme();
    const router = useRouter();
    
    useFocusEffect(
        useCallback(() => {
            refreshHistory();
        }, [])
    );

    const handleDelete = (id: string) => {
        Alert.alert("Delete Record", "Are you sure you want to remove this translation?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteTranslation(id) },
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
                        Voice History
                    </Text>
                    <View style={{ width: 48 }} /> 
                </View>
            </SafeAreaView>

            {isLoading && translationHistory.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={translationHistory}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <HistoryItem
                            item={item}
                            onDelete={handleDelete}
                            onToggleFavorite={toggleFavorite}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <View style={[styles.emptyIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Ionicons name="mic-outline" size={40} color={theme.colors.outline} />
                            </View>
                            <Text style={{ textAlign: "center", marginTop: 16, color: theme.colors.outline, fontSize: 16 }}>
                                No voice translations yet.
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    onRefresh={refreshHistory}
                    refreshing={isLoading}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default function TranslationHistoryScreen() {
    return (
        <TranslationHistoryProvider>
            <HistoryContent />
        </TranslationHistoryProvider>
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
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    langBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    langText: {
        fontSize: 11,
        fontWeight: "bold",
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    arrowContainer: {
        alignItems: 'center',
        marginVertical: 6,
    },
    originalText: {
        fontSize: 15,
        lineHeight: 22,
    },
    translatedText: {
        fontSize: 18,
        fontWeight: "600",
        lineHeight: 26,
    },
    divider: {
        height: 1,
        width: '100%',
        opacity: 0.6,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});