import React, { forwardRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Copy, Trash2, Check } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import {
    updateGroupName,
    removeGroupMember,
    deleteGroup,
} from '../../services/api';
import type { GroupMemberDTO } from '../../types/dashboard';

interface GroupSettingsSheetProps {
    groupId: string;
    groupName: string;
    groupCode: string;
    members: GroupMemberDTO[];
    currentUserId: string;
    onDeleted: () => void;
}

const GroupSettingsSheet = forwardRef<BottomSheet, GroupSettingsSheetProps>(
    ({ groupId, groupName, groupCode, members, currentUserId, onDeleted }, ref) => {
        const queryClient = useQueryClient();
        const [name, setName] = useState(groupName);
        const [isSavingName, setIsSavingName] = useState(false);
        const [codeCopied, setCodeCopied] = useState(false);

        // Sync name when groupName prop changes
        React.useEffect(() => { setName(groupName); }, [groupName]);

        const handleSaveName = useCallback(async () => {
            if (!name.trim() || name === groupName) return;
            setIsSavingName(true);
            try {
                await updateGroupName(groupId, name.trim());
                queryClient.invalidateQueries({ queryKey: ['userSpaces'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            } finally {
                setIsSavingName(false);
            }
        }, [name, groupId, groupName, queryClient]);

        const handleCopyCode = useCallback(async () => {
            await Clipboard.setStringAsync(groupCode);
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        }, [groupCode]);

        const handleRemoveMember = useCallback((member: GroupMemberDTO) => {
            Alert.alert(
                'Retirer le membre',
                `Retirer ${member.userName} de cet espace ?`,
                [
                    { text: 'Annuler', style: 'cancel' },
                    {
                        text: 'Retirer',
                        style: 'destructive',
                        onPress: async () => {
                            await removeGroupMember(groupId, member.userId);
                            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                            queryClient.invalidateQueries({ queryKey: ['userSpaces'] });
                        },
                    },
                ],
            );
        }, [groupId, queryClient]);

        const handleDeleteGroup = useCallback(() => {
            Alert.alert(
                'Supprimer l\'espace',
                'Cette action est irréversible. Toutes les données seront supprimées.',
                [
                    { text: 'Annuler', style: 'cancel' },
                    {
                        text: 'Supprimer',
                        style: 'destructive',
                        onPress: async () => {
                            await deleteGroup(groupId);
                            queryClient.invalidateQueries({ queryKey: ['userSpaces'] });
                            onDeleted();
                        },
                    },
                ],
            );
        }, [groupId, queryClient, onDeleted]);

        return (
            <BottomSheet
                ref={ref}
                index={-1}
                snapPoints={['75%']}
                enablePanDownToClose
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
            >
                <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Group Name */}
                    <Text style={styles.sectionLabel}>Nom de l'espace</Text>
                    <View style={styles.nameRow}>
                        <TextInput
                            style={styles.nameInput}
                            value={name}
                            onChangeText={setName}
                            onBlur={handleSaveName}
                            onSubmitEditing={handleSaveName}
                            returnKeyType="done"
                        />
                        {isSavingName && <ActivityIndicator size="small" color="#8E8E93" />}
                    </View>

                    {/* Invite Code */}
                    <Text style={styles.sectionLabel}>Code d'invitation</Text>
                    <Pressable
                        style={({ pressed }) => [styles.codeCard, pressed && styles.codeCardPressed]}
                        onPress={handleCopyCode}
                    >
                        <Text style={styles.codeText}>{groupCode}</Text>
                        {codeCopied ? (
                            <Check size={20} color="#34C759" strokeWidth={2.5} />
                        ) : (
                            <Copy size={20} color="#8E8E93" strokeWidth={2.5} />
                        )}
                    </Pressable>

                    {/* Members */}
                    <Text style={styles.sectionLabel}>Membres</Text>
                    <View style={styles.membersList}>
                        {members.map((member) => (
                            <View key={member.userId} style={styles.memberRow}>
                                <View style={styles.memberAvatar}>
                                    <Text style={styles.memberAvatarText}>
                                        {member.userName.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.memberInfo}>
                                    <Text style={styles.memberName}>{member.userName}</Text>
                                    <Text style={styles.memberRole}>
                                        {member.role === 'ADMIN' ? 'Admin' : 'Membre'}
                                    </Text>
                                </View>
                                {member.userId !== currentUserId && (
                                    <Pressable
                                        onPress={() => handleRemoveMember(member)}
                                        hitSlop={8}
                                    >
                                        <Trash2 size={18} color="#FF3B30" strokeWidth={2.5} />
                                    </Pressable>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Delete Group */}
                    <Pressable
                        style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
                        onPress={handleDeleteGroup}
                    >
                        <Trash2 size={18} color="#FF3B30" strokeWidth={2.5} />
                        <Text style={styles.deleteButtonText}>Supprimer l'espace</Text>
                    </Pressable>
                </BottomSheetScrollView>
            </BottomSheet>
        );
    },
);

GroupSettingsSheet.displayName = 'GroupSettingsSheet';
export default GroupSettingsSheet;

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
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 60,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 20,
        marginBottom: 10,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    nameInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#1C1C1E',
        backgroundColor: '#F2F2F7',
        borderRadius: 14,
        padding: 16,
    },
    codeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F2F2F7',
        borderRadius: 14,
        padding: 16,
    },
    codeCardPressed: {
        backgroundColor: '#E5E5EA',
    },
    codeText: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1C1C1E',
        letterSpacing: 3,
    },
    membersList: {
        gap: 8,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 14,
        padding: 14,
        gap: 12,
    },
    memberAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E5E5EA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberAvatarText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    memberRole: {
        fontSize: 12,
        color: '#8E8E93',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 32,
        backgroundColor: '#FFF0F0',
        borderRadius: 14,
        paddingVertical: 16,
    },
    deleteButtonPressed: {
        backgroundColor: '#FFE0E0',
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF3B30',
    },
});
