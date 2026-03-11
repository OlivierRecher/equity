import React, { forwardRef } from 'react';
import {
    Text,
    StyleSheet,
    Pressable,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
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

                    {/* Add button at end of list */}
                    <Pressable
                        style={({ pressed }) => [styles.addRow, pressed && styles.addRowPressed]}
                        onPress={onAddPress}
                    >
                        <Plus size={20} color="#007AFF" strokeWidth={2.5} />
                        <Text style={styles.addRowText}>Ajouter une tâche</Text>
                    </Pressable>
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
    addRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderRadius: 14,
        padding: 16,
        gap: 8,
        borderWidth: 1.5,
        borderColor: '#C7C7CC',
        borderStyle: 'dashed',
    },
    addRowPressed: {
        backgroundColor: '#F2F2F7',
    },
    addRowText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#007AFF',
    },
});
