import React, { forwardRef, useCallback, useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TextInput,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCatalogItem, updateCatalogItem } from '../../services/api';
import type { CatalogItemDTO } from '../../types/dashboard';
import { Minus, Plus } from 'lucide-react-native';

/** Predefined icons for MVP icon picker */
const ICON_OPTIONS = ['🧹', '🗑️', '🍽️', '🛒', '🧽', '🍳', '🌿', '🧺', '🚿', '🐕'];

interface CatalogFormSheetProps {
    groupId: string;
    /** If set → edit mode; null → create mode */
    editItem: CatalogItemDTO | null;
    onClose: () => void;
}

const CatalogFormSheet = forwardRef<BottomSheet, CatalogFormSheetProps>(
    ({ groupId, editItem, onClose }, ref) => {
        const queryClient = useQueryClient();
        const isEditMode = editItem !== null;

        const [name, setName] = useState('');
        const [points, setPoints] = useState(10);
        const [icon, setIcon] = useState('🧹');

        // Reset form when editItem changes
        useEffect(() => {
            if (editItem) {
                setName(editItem.name);
                setPoints(editItem.defaultValue);
                setIcon(editItem.icon);
            } else {
                setName('');
                setPoints(10);
                setIcon('🧹');
            }
        }, [editItem]);

        const snapPoints = useMemo(() => ['75%'], []);

        const createMutation = useMutation({
            mutationFn: () =>
                createCatalogItem(groupId, { name: name.trim(), defaultValue: points, icon }),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['dashboard', groupId] });
                onClose();
            },
        });

        const updateMutation = useMutation({
            mutationFn: () => {
                if (!editItem) throw new Error('No item to update');
                return updateCatalogItem(groupId, editItem.id, {
                    name: name.trim(),
                    defaultValue: points,
                    icon,
                });
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['dashboard', groupId] });
                onClose();
            },
        });

        const mutation = isEditMode ? updateMutation : createMutation;
        const canSubmit = name.trim().length > 0 && points > 0 && !mutation.isPending;

        const incrementPoints = useCallback(() => setPoints((p) => p + 5), []);
        const decrementPoints = useCallback(() => setPoints((p) => Math.max(5, p - 5)), []);

        return (
            <BottomSheet
                ref={ref}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
            >
                <BottomSheetScrollView contentContainerStyle={styles.content}>
                    {/* Title */}
                    <Text style={styles.title}>
                        {isEditMode ? 'Modifier la tâche' : 'Nouvelle tâche'}
                    </Text>

                    {/* Name Input */}
                    <Text style={styles.label}>Nom</Text>
                    <TextInput
                        style={styles.nameInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ex: Jardinage"
                        placeholderTextColor="#C7C7CC"
                        autoCapitalize="sentences"
                    />

                    {/* Points Stepper */}
                    <Text style={styles.label}>Points</Text>
                    <View style={styles.stepperContainer}>
                        <Pressable
                            style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperPressed]}
                            onPress={decrementPoints}
                        >
                            <Minus size={20} color="#1C1C1E" strokeWidth={3} />
                        </Pressable>

                        <View style={styles.stepperValue}>
                            <Text style={styles.stepperValueText}>{points}</Text>
                            <Text style={styles.stepperSuffix}>pts</Text>
                        </View>

                        <Pressable
                            style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperPressed]}
                            onPress={incrementPoints}
                        >
                            <Plus size={20} color="#1C1C1E" strokeWidth={3} />
                        </Pressable>
                    </View>

                    {/* Icon Picker */}
                    <Text style={styles.label}>Icône</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.iconRow}
                    >
                        {ICON_OPTIONS.map((emoji) => {
                            const isSelected = icon === emoji;
                            return (
                                <Pressable
                                    key={emoji}
                                    style={[styles.iconOption, isSelected && styles.iconOptionSelected]}
                                    onPress={() => setIcon(emoji)}
                                >
                                    <Text style={styles.iconEmoji}>{emoji}</Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    {/* Submit Button */}
                    <Pressable
                        style={[
                            styles.submitButton,
                            isEditMode && styles.submitButtonEdit,
                            !canSubmit && styles.submitButtonDisabled,
                        ]}
                        onPress={() => mutation.mutate()}
                        disabled={!canSubmit}
                    >
                        {mutation.isPending ? (
                            <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                            <Text style={styles.submitText}>Enregistrer</Text>
                        )}
                    </Pressable>

                    {mutation.isError && (
                        <Text style={styles.errorText}>
                            Erreur : {mutation.error?.message ?? 'Réessayez'}
                        </Text>
                    )}
                </BottomSheetScrollView>
            </BottomSheet>
        );
    },
);

CatalogFormSheet.displayName = 'CatalogFormSheet';
export default CatalogFormSheet;

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
    content: {
        padding: 24,
        paddingTop: 8,
        paddingBottom: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 28,
    },

    // Labels
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
    },

    // Name input
    nameInput: {
        backgroundColor: '#F2F2F7',
        borderRadius: 14,
        padding: 16,
        fontSize: 17,
        fontWeight: '500',
        color: '#1C1C1E',
        marginBottom: 24,
    },

    // Stepper
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 28,
    },
    stepperButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepperPressed: {
        backgroundColor: '#E5E5EA',
    },
    stepperValue: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    stepperValueText: {
        fontSize: 40,
        fontWeight: '800',
        color: '#1C1C1E',
        fontVariant: ['tabular-nums'],
    },
    stepperSuffix: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8E8E93',
    },

    // Icon picker
    iconRow: {
        gap: 10,
        paddingBottom: 4,
        marginBottom: 32,
    },
    iconOption: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    iconOptionSelected: {
        backgroundColor: '#E8F0FE',
        borderColor: '#007AFF',
    },
    iconEmoji: {
        fontSize: 26,
    },

    // Submit
    submitButton: {
        backgroundColor: '#1C1C1E',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
    },
    submitButtonEdit: {
        backgroundColor: '#34C759',
    },
    submitButtonDisabled: {
        backgroundColor: '#D1D1D6',
    },
    submitText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    errorText: {
        fontSize: 13,
        color: '#FF3B30',
        textAlign: 'center',
        marginTop: 12,
    },
});
