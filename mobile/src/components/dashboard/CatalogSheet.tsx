import React, { forwardRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Plus, ChevronRight } from 'lucide-react-native';
import type { CatalogItemDTO } from '../../types/dashboard';

interface CatalogSheetProps {
    catalog: CatalogItemDTO[];
    onAddPress: () => void;
    onItemPress: (item: CatalogItemDTO) => void;
}

const CatalogSheet = forwardRef<BottomSheet, CatalogSheetProps>(
    ({ catalog, onAddPress, onItemPress }, ref) => {
        return (
            <BottomSheet
                ref={ref}
                index={-1}
                snapPoints={['50%']}
                enablePanDownToClose
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
            >
                <BottomSheetView style={styles.header}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>Catalogue</Text>
                        <Pressable
                            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
                            onPress={onAddPress}
                        >
                            <Plus size={16} color="#007AFF" strokeWidth={3} />
                            <Text style={styles.addButtonText}>Ajouter</Text>
                        </Pressable>
                    </View>
                </BottomSheetView>

                <BottomSheetScrollView contentContainerStyle={styles.list}>
                    {catalog.map((item) => (
                        <Pressable
                            key={item.id}
                            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                            onPress={() => onItemPress(item)}
                        >
                            <Text style={styles.icon}>{item.icon}</Text>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.value}>{item.defaultValue} pts</Text>
                            <ChevronRight size={16} color="#C7C7CC" strokeWidth={2.5} />
                        </Pressable>
                    ))}

                    {catalog.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                Aucune tâche dans le catalogue
                            </Text>
                        </View>
                    )}
                </BottomSheetScrollView>
            </BottomSheet>
        );
    },
);

CatalogSheet.displayName = 'CatalogSheet';
export default CatalogSheet;

const styles = StyleSheet.create({
    sheetBackground: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 8,
    },
    handleIndicator: {
        backgroundColor: '#D1D1D6',
        width: 36,
        height: 4,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#EBF3FF',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    addButtonPressed: {
        backgroundColor: '#D6E6FF',
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 14,
        padding: 16,
        gap: 12,
    },
    rowPressed: {
        backgroundColor: '#E5E5EA',
    },
    icon: {
        fontSize: 24,
    },
    name: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    value: {
        fontSize: 15,
        fontWeight: '600',
        color: '#8E8E93',
        fontVariant: ['tabular-nums'],
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#AEAEB2',
    },
});
