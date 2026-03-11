import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, updateTask } from '../../services/api';
import type { UserBalanceDTO, CatalogItemDTO } from '../../types/dashboard';

interface SelectedTask {
    id: string;
    icon: string;
    label: string;
    value: number;
}

export interface EditTaskData {
    taskId: string;
    catalogId?: string;
    value: number;
    beneficiaryIds?: string[];
    doerIds?: string[];
}

interface AddTaskSheetProps {
    groupId: string;
    members: UserBalanceDTO[];
    catalog: CatalogItemDTO[];
    currentUserId: string;
    editTask?: EditTaskData | null;
    onClose: () => void;
}

const AddTaskSheet = forwardRef<BottomSheet, AddTaskSheetProps>(
    ({ groupId, members, catalog, currentUserId, editTask, onClose }, ref) => {
        const queryClient = useQueryClient();

        const [selectedTask, setSelectedTask] = useState<SelectedTask | null>(null);
        const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
        const [selectedDoerIds, setSelectedDoerIds] = useState<Set<string>>(new Set([currentUserId]));

        const snapPoints = useMemo(() => ['85%'], []);

        const isEditing = !!editTask;

        // Pre-fill form when editTask changes
        useEffect(() => {
            if (editTask) {
                const catalogItem = catalog.find((c) => c.id === editTask.catalogId);
                if (catalogItem) {
                    setSelectedTask({
                        id: catalogItem.id,
                        icon: catalogItem.icon,
                        label: catalogItem.name,
                        value: editTask.value,
                    });
                } else {
                    setSelectedTask(null);
                }

                // Pre-fill excluded members based on beneficiaryIds
                if (editTask.beneficiaryIds) {
                    const allMemberIds = new Set(members.map((m) => m.userId));
                    const beneficiarySet = new Set(editTask.beneficiaryIds);
                    const excluded = new Set<string>();
                    for (const id of allMemberIds) {
                        if (!beneficiarySet.has(id)) {
                            excluded.add(id);
                        }
                    }
                    setExcludedIds(excluded);
                } else {
                    setExcludedIds(new Set());
                }

                // Pre-fill doers
                if (editTask.doerIds) {
                    setSelectedDoerIds(new Set(editTask.doerIds));
                } else {
                    setSelectedDoerIds(new Set([currentUserId]));
                }
            }
        }, [editTask, catalog, members, currentUserId]);

        const mutation = useMutation({
            mutationFn: async () => {
                if (!selectedTask) throw new Error('No task selected');

                const beneficiaryIds = members
                    .map((m) => m.userId)
                    .filter((id) => !excludedIds.has(id));

                const taskInput = {
                    catalogId: selectedTask.id,
                    value: selectedTask.value,
                    beneficiaryIds,
                    doerIds: Array.from(selectedDoerIds),
                };

                if (isEditing && editTask) {
                    await updateTask(groupId, editTask.taskId, taskInput);
                } else {
                    await createTask(groupId, taskInput);
                }
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['dashboard', groupId] });
                setSelectedTask(null);
                setExcludedIds(new Set());
                setSelectedDoerIds(new Set([currentUserId]));
                onClose();
            },
        });

        const toggleMember = useCallback((userId: string) => {
            setExcludedIds((prev) => {
                const next = new Set(prev);
                if (next.has(userId)) {
                    next.delete(userId);
                } else {
                    next.add(userId);
                }
                return next;
            });
        }, []);

        const toggleDoer = useCallback((userId: string) => {
            setSelectedDoerIds((prev) => {
                const next = new Set(prev);
                if (next.has(userId)) {
                    next.delete(userId);
                } else {
                    next.add(userId);
                }
                return next;
            });
        }, []);

        const activeBeneficiaryCount = members.length - excludedIds.size;
        const canSubmit = selectedTask !== null && activeBeneficiaryCount >= 1 && selectedDoerIds.size >= 1 && !mutation.isPending;

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
                        {isEditing ? 'Modifier la tâche' : 'Ajouter une tâche'}
                    </Text>

                    {/* Task Grid */}
                    <Text style={styles.sectionLabel}>Quelle tâche ?</Text>
                    <View style={styles.taskGrid}>
                        {catalog.map((item) => {
                            const isSelected = selectedTask?.id === item.id;
                            return (
                                <Pressable
                                    key={item.id}
                                    style={[styles.taskCard, isSelected && styles.taskCardSelected]}
                                    onPress={() =>
                                        setSelectedTask({
                                            id: item.id,
                                            icon: item.icon,
                                            label: item.name,
                                            value: item.defaultValue,
                                        })
                                    }
                                >
                                    <Text style={styles.taskEmoji}>{item.icon}</Text>
                                    <Text style={[styles.taskLabel, isSelected && styles.taskLabelSelected]}>
                                        {item.name}
                                    </Text>
                                    <Text style={[styles.taskValue, isSelected && styles.taskValueSelected]}>
                                        {item.defaultValue} pts
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Doers */}
                    <Text style={styles.sectionLabel}>Fait par ?</Text>
                    <Text style={styles.sectionHint}>Sélectionne le(s) réalisateur(s)</Text>
                    <View style={styles.membersRow}>
                        {members.map((member) => {
                            const isSelected = selectedDoerIds.has(member.userId);
                            return (
                                <Pressable
                                    key={`doer-${member.userId}`}
                                    style={[styles.memberChip, !isSelected && styles.memberChipExcluded]}
                                    onPress={() => toggleDoer(member.userId)}
                                >
                                    <View
                                        style={[
                                            styles.memberAvatar,
                                            !isSelected && styles.memberAvatarExcluded,
                                        ]}
                                    >
                                        <Text style={styles.memberAvatarText}>
                                            {member.userName.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={[styles.memberName, !isSelected && styles.memberNameExcluded]}>
                                        {member.userName}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Members (Beneficiaries) */}
                    <Text style={styles.sectionLabel}>Pour qui ?</Text>
                    <Text style={styles.sectionHint}>Touche pour exclure un absent</Text>
                    <View style={styles.membersRow}>
                        {members.map((member) => {
                            const isExcluded = excludedIds.has(member.userId);
                            return (
                                <Pressable
                                    key={member.userId}
                                    style={[styles.memberChip, isExcluded && styles.memberChipExcluded]}
                                    onPress={() => toggleMember(member.userId)}
                                >
                                    <View
                                        style={[
                                            styles.memberAvatar,
                                            isExcluded && styles.memberAvatarExcluded,
                                        ]}
                                    >
                                        <Text style={styles.memberAvatarText}>
                                            {member.userName.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={[styles.memberName, isExcluded && styles.memberNameExcluded]}>
                                        {member.userName}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Submit */}
                    <Pressable
                        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
                        onPress={() => mutation.mutate()}
                        disabled={!canSubmit}
                    >
                        {mutation.isPending ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={styles.submitText}>
                                {isEditing ? 'Modifier' : 'Valider'}
                                {selectedTask ? ` · ${selectedTask.value} pts` : ''}
                            </Text>
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

AddTaskSheet.displayName = 'AddTaskSheet';
export default AddTaskSheet;

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
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    sectionHint: {
        fontSize: 12,
        color: '#AEAEB2',
        marginTop: -8,
        marginBottom: 12,
    },

    // Task grid
    taskGrid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
        flexWrap: 'wrap',
    },
    taskCard: {
        minWidth: 90,
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 16,
        padding: 14,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    taskCardSelected: {
        backgroundColor: '#E8F0FE',
        borderColor: '#007AFF',
    },
    taskEmoji: {
        fontSize: 28,
        marginBottom: 6,
    },
    taskLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 2,
        textAlign: 'center',
    },
    taskLabelSelected: {
        color: '#007AFF',
    },
    taskValue: {
        fontSize: 12,
        fontWeight: '500',
        color: '#8E8E93',
    },
    taskValueSelected: {
        color: '#007AFF',
    },

    // Members
    membersRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 28,
        flexWrap: 'wrap',
    },
    memberChip: {
        alignItems: 'center',
        gap: 6,
    },
    memberChipExcluded: {
        opacity: 0.3,
    },
    memberAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E8F9ED',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#34C759',
    },
    memberAvatarExcluded: {
        backgroundColor: '#F2F2F7',
        borderColor: '#D1D1D6',
    },
    memberAvatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    memberName: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1C1C1E',
    },
    memberNameExcluded: {
        color: '#AEAEB2',
    },

    // Submit
    submitButton: {
        backgroundColor: '#007AFF',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
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
