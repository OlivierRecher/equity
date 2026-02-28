import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Pressable,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    TextInput,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUserSpaces, joinSpace } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import type { SpaceDTO } from '../../src/types/dashboard';

export default function HubScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, switchGroup, logout } = useAuth();

    const [showJoinInput, setShowJoinInput] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);

    const { data: spaces, isLoading } = useQuery({
        queryKey: ['userSpaces'],
        queryFn: fetchUserSpaces,
    });

    const handleSelectSpace = useCallback(
        async (space: SpaceDTO) => {
            await switchGroup(space.id);
            router.replace('/(tabs)');
        },
        [switchGroup, router],
    );

    const handleJoin = useCallback(async () => {
        if (!joinCode.trim()) return;
        setJoinLoading(true);
        try {
            const result = await joinSpace({ code: joinCode.trim() });
            await switchGroup(result.groupId);
            queryClient.invalidateQueries({ queryKey: ['userSpaces'] });
            setShowJoinInput(false);
            setJoinCode('');
            router.replace('/(tabs)');
        } catch (e) {
            Alert.alert('Erreur', (e as Error).message);
        } finally {
            setJoinLoading(false);
        }
    }, [joinCode, switchGroup, queryClient, router]);

    const renderSpace = ({ item }: { item: SpaceDTO }) => (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => handleSelectSpace(item)}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{item.name}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>
                        {item.role === 'ADMIN' ? 'Admin' : 'Membre'}
                    </Text>
                </View>
            </View>
            <Text style={styles.cardMeta}>
                {item.memberCount} membre{item.memberCount > 1 ? 's' : ''}
            </Text>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Mes espaces{'\n'}de répartition</Text>
                    <Pressable onPress={logout} style={styles.logoutButton}>
                        <Text style={styles.logoutText}>Déconnexion</Text>
                    </Pressable>
                </View>

                {/* List */}
                {isLoading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#1C1C1E" />
                    </View>
                ) : (
                    <FlatList
                        data={spaces ?? []}
                        keyExtractor={(item) => item.id}
                        renderItem={renderSpace}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>🏠</Text>
                                <Text style={styles.emptyText}>
                                    Aucun espace pour le moment.{'\n'}Crée-en un ou rejoins un espace existant !
                                </Text>
                            </View>
                        }
                    />
                )}

                {/* Join code input */}
                {showJoinInput && (
                    <View style={styles.joinRow}>
                        <TextInput
                            style={styles.joinInput}
                            value={joinCode}
                            onChangeText={setJoinCode}
                            placeholder="Code d'invitation"
                            placeholderTextColor="#C7C7CC"
                            autoCapitalize="characters"
                            autoCorrect={false}
                            maxLength={6}
                        />
                        <Pressable
                            style={[styles.joinButton, joinLoading && styles.buttonDisabled]}
                            onPress={handleJoin}
                            disabled={joinLoading}
                        >
                            {joinLoading ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <Text style={styles.joinButtonText}>OK</Text>
                            )}
                        </Pressable>
                    </View>
                )}

                {/* Actions */}
                <View style={styles.actions}>
                    <Pressable
                        style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                        onPress={() => router.push('/hub/create/name')}
                    >
                        <Text style={styles.primaryButtonText}>+ Nouvel espace</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                        onPress={() => setShowJoinInput(!showJoinInput)}
                    >
                        <Text style={styles.secondaryButtonText}>
                            {showJoinInput ? 'Annuler' : 'Rejoindre via un code'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 28,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1C1C1E',
        letterSpacing: -0.5,
        flex: 1,
    },
    logoutButton: {
        paddingTop: 8,
    },
    logoutText: {
        fontSize: 14,
        color: '#FF3B30',
        fontWeight: '600',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        gap: 16,
        paddingBottom: 16,
    },
    card: {
        backgroundColor: '#F9F9FB',
        borderRadius: 16,
        padding: 20,
    },
    cardPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    cardName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        flex: 1,
    },
    roleBadge: {
        backgroundColor: '#E5E5EA',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    roleBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#636366',
    },
    cardMeta: {
        fontSize: 14,
        color: '#8E8E93',
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 24,
    },
    joinRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    joinInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#1C1C1E',
        textAlign: 'center',
        letterSpacing: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        paddingVertical: 12,
    },
    joinButton: {
        backgroundColor: '#1C1C1E',
        borderRadius: 12,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    joinButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    actions: {
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    secondaryButton: {
        backgroundColor: '#F9F9FB',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    buttonPressed: {
        opacity: 0.85,
    },
    buttonDisabled: {
        backgroundColor: '#AEAEB2',
    },
});
