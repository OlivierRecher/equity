import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2, Pencil } from 'lucide-react-native';
import { deleteTask } from '../../services/api';
import type { TaskHistoryItemDTO } from '../../types/dashboard';

interface TaskDetailsSheetProps {
    groupId: string;
    task: TaskHistoryItemDTO | null;
    onClose: () => void;
    onEdit: (task: TaskHistoryItemDTO) => void;
}

function formatFullDate(iso: string): string {
    const date = new Date(iso);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} à ${hours}:${mins}`;
}

const TaskDetailsSheet = forwardRef<BottomSheet, TaskDetailsSheetProps>(
    ({ groupId, task, onClose, onEdit }, ref) => {
        const queryClient = useQueryClient();
        const snapPoints = useMemo(() => ['45%'], []);

        const handleDelete = useCallback(() => {
            if (!task) return;

            Alert.alert(
                'Supprimer cette tâche ?',
                'Les soldes de l\u2019espace seront recalculés.',
                [
                    { text: 'Annuler', style: 'cancel' },
                    {
                        text: 'Supprimer',
                        style: 'destructive',
                        onPress: () => {
                            void (async () => {
                                try {
                                    await deleteTask(groupId, task.id);
                                    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                                    onClose();
                                } catch (e) {
                                    Alert.alert('Erreur', (e as Error).message);
                                }
                            })();
                        },
                    },
                ],
            );
        }, [task, groupId, queryClient, onClose]);

        const handleEdit = useCallback(() => {
            if (!task) return;
            onClose();
            setTimeout(() => onEdit(task), 200);
        }, [task, onClose, onEdit]);

        return (
            <BottomSheet
                ref={ref}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose
                onClose={onClose}
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
            >
                <BottomSheetView style={styles.content}>
                    {task && (
                        <>
                            {/* Header with edit icon */}
                            <View style={styles.header}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {task.doerNames.length > 1
                                            ? '+'
                                            : task.doerNames[0]?.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.headerInfo}>
                                    <Text style={styles.taskName}>{task.taskName}</Text>
                                    <Text style={styles.doerName}>par {task.doerNames.join(' & ')}</Text>
                                </View>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.editIcon,
                                        pressed && styles.editIconPressed,
                                    ]}
                                    onPress={handleEdit}
                                >
                                    <Pencil size={20} color="#007AFF" strokeWidth={2.2} />
                                </Pressable>
                            </View>

                            {/* Details */}
                            <View style={styles.detailsCard}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Réalisée le</Text>
                                    <Text style={styles.detailValue}>
                                        {formatFullDate(task.date)}
                                    </Text>
                                </View>
                                <View style={styles.separator} />
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Valeur</Text>
                                    <Text style={styles.detailValueBold}>{task.value} pts</Text>
                                </View>
                            </View>

                            {/* Delete button — visible for everyone */}
                            <Pressable
                                style={({ pressed }) => [
                                    styles.deleteButton,
                                    pressed && styles.deleteButtonPressed,
                                ]}
                                onPress={handleDelete}
                            >
                                <Trash2 size={18} color="#FFFFFF" strokeWidth={2.5} />
                                <Text style={styles.deleteButtonText}>
                                    Supprimer cette tâche
                                </Text>
                            </Pressable>
                        </>
                    )}
                </BottomSheetView>
            </BottomSheet>
        );
    },
);

TaskDetailsSheet.displayName = 'TaskDetailsSheet';
export default TaskDetailsSheet;

const styles = StyleSheet.create({
    sheetBackground: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handleIndicator: {
        backgroundColor: '#D1D1D6',
        width: 36,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 34,
        gap: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    headerInfo: {
        flex: 1,
    },
    taskName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1C1C1E',
    },
    doerName: {
        fontSize: 15,
        color: '#8E8E93',
        marginTop: 2,
    },
    editIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIconPressed: {
        opacity: 0.6,
    },
    detailsCard: {
        backgroundColor: '#F9F9FB',
        borderRadius: 14,
        padding: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    separator: {
        height: 1,
        backgroundColor: '#E5E5EA',
        marginVertical: 8,
    },
    detailLabel: {
        fontSize: 15,
        color: '#8E8E93',
    },
    detailValue: {
        fontSize: 15,
        color: '#1C1C1E',
    },
    detailValueBold: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#FF3B30',
        borderRadius: 14,
        paddingVertical: 16,
    },
    deleteButtonPressed: {
        opacity: 0.85,
    },
    deleteButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
