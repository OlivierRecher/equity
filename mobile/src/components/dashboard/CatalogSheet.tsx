import React, { forwardRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCatalogItem } from '../../services/api';
import type { CatalogItemDTO } from '../../types/dashboard';

interface CatalogSheetProps {
    groupId: string;
    catalog: CatalogItemDTO[];
}

const CatalogSheet = forwardRef<BottomSheet, CatalogSheetProps>(
    ({ groupId, catalog }, ref) => {
        const queryClient = useQueryClient();
        const [editingId, setEditingId] = useState<string | null>(null);
        const [editValue, setEditValue] = useState('');

        const mutation = useMutation({
            mutationFn: ({ catalogId, value }: { catalogId: string; value: number }) =>
                updateCatalogItem(groupId, catalogId, { defaultValue: value }),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['dashboard', groupId] });
                setEditingId(null);
                setEditValue('');
            },
        });

        const startEditing = (item: CatalogItemDTO) => {
            setEditingId(item.id);
            setEditValue(item.defaultValue.toString());
        };

        const saveEdit = (catalogId: string) => {
            const numValue = Number.parseInt(editValue, 10);
            if (Number.isNaN(numValue) || numValue < 0) return;
            mutation.mutate({ catalogId, value: numValue });
        };

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
                    <Text style={styles.title}>Catalogue</Text>
                    <Text style={styles.subtitle}>
                        Modifier les points n'affecte que les futures tâches
                    </Text>
                </BottomSheetView>

                <BottomSheetScrollView contentContainerStyle={styles.list}>
                    {catalog.map((item) => {
                        const isEditing = editingId === item.id;

                        return (
                            <Pressable
                                key={item.id}
                                style={styles.row}
                                onPress={() => !isEditing && startEditing(item)}
                            >
                                <Text style={styles.icon}>{item.icon}</Text>
                                <Text style={styles.name}>{item.name}</Text>

                                {isEditing ? (
                                    <View style={styles.editRow}>
                                        <TextInput
                                            style={styles.input}
                                            value={editValue}
                                            onChangeText={setEditValue}
                                            keyboardType="number-pad"
                                            autoFocus
                                            selectTextOnFocus
                                        />
                                        <Pressable
                                            style={styles.saveButton}
                                            onPress={() => saveEdit(item.id)}
                                            disabled={mutation.isPending}
                                        >
                                            {mutation.isPending ? (
                                                <ActivityIndicator color="#FFF" size="small" />
                                            ) : (
                                                <Text style={styles.saveText}>OK</Text>
                                            )}
                                        </Pressable>
                                    </View>
                                ) : (
                                    <Text style={styles.value}>{item.defaultValue} pts</Text>
                                )}
                            </Pressable>
                        );
                    })}
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
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: '#8E8E93',
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
    editRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        fontWeight: '700',
        width: 60,
        textAlign: 'center',
        color: '#1C1C1E',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    saveText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
