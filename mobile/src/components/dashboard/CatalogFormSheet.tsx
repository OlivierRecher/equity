import React, { forwardRef, useCallback, useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TextInput,
    ActivityIndicator,
    ScrollView,
    Modal,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCatalogItem, updateCatalogItem } from '../../services/api';
import type { CatalogItemDTO } from '../../types/dashboard';
import { Minus, Plus } from 'lucide-react-native';

/** Predefined icons for MVP icon picker */
const ICON_OPTIONS = [
    '🧹', '🗑️', '🍽️', '🛒', '🧽', '🍳', '🌿', '🧺', '🚿', '🐕',
    '🧼', '🛏️', '🪣', '🚗', '📦', '✂️', '🧲', '💡', '🔧', '🪴',
];

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
        const [showIconPicker, setShowIconPicker] = useState(false);

        // Reset form when editItem changes
        useEffect(() => {
            if (editItem) {
                setName(editItem.name);
                setPoints(editItem.defaultValue);
                setIcon(editItem.icon);
            } else {
                setName('');
                setPoints(10);
                setIcon(ICON_OPTIONS[Math.floor(Math.random() * ICON_OPTIONS.length)]);
            }
            setShowIconPicker(false);
        }, [editItem]);

        const snapPoints = useMemo(() => ['70%'], []);

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

        const selectIcon = useCallback((emoji: string) => {
            setIcon(emoji);
            setShowIconPicker(false);
        }, []);

        return (
            <>
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

                        {/* Name row: emoji button + text input */}
                        <Text style={styles.label}>Nom</Text>
                        <View style={styles.nameRow}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.iconButton,
                                    pressed && styles.iconButtonPressed,
                                ]}
                                onPress={() => setShowIconPicker(true)}
                            >
                                <Text style={styles.iconButtonEmoji}>{icon}</Text>
                            </Pressable>
                            <TextInput
                                style={styles.nameInput}
                                value={name}
                                onChangeText={setName}
                                placeholder="Ex: Jardinage"
                                placeholderTextColor="#C7C7CC"
                                autoCapitalize="sentences"
                            />
                        </View>

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

                {/* Emoji Picker Modal */}
                <Modal
                    visible={showIconPicker}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowIconPicker(false)}
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setShowIconPicker(false)}
                    >
                        <Pressable style={styles.pickerCard}>
                            <Text style={styles.pickerTitle}>Choisir une icône</Text>
                            <View style={styles.pickerGrid}>
                                {ICON_OPTIONS.map((emoji) => {
                                    const isSelected = icon === emoji;
                                    return (
                                        <Pressable
                                            key={emoji}
                                            style={[
                                                styles.pickerItem,
                                                isSelected && styles.pickerItemSelected,
                                            ]}
                                            onPress={() => selectIcon(emoji)}
                                        >
                                            <Text style={styles.pickerEmoji}>{emoji}</Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>
            </>
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

    // Name row (emoji button + input on same line)
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    iconButton: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E5EA',
    },
    iconButtonPressed: {
        backgroundColor: '#E5E5EA',
        borderColor: '#007AFF',
    },
    iconButtonEmoji: {
        fontSize: 26,
    },
    nameInput: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        borderRadius: 14,
        padding: 16,
        fontSize: 17,
        fontWeight: '500',
        color: '#1C1C1E',
    },

    // Stepper
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 32,
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

    // Emoji picker modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    },
    pickerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1C1C1E',
        textAlign: 'center',
        marginBottom: 20,
    },
    pickerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    pickerItem: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    pickerItemSelected: {
        backgroundColor: '#E8F0FE',
        borderColor: '#007AFF',
    },
    pickerEmoji: {
        fontSize: 24,
    },
});
