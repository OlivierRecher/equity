import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { joinSpace } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

export default function JoinScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { switchGroup } = useAuth();

    const [joinCode, setJoinCode] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);

    const handleJoin = async () => {
        if (!joinCode.trim()) return;
        setJoinLoading(true);
        try {
            const result = await joinSpace({ code: joinCode.trim() });
            await switchGroup(result.groupId);
            queryClient.invalidateQueries({ queryKey: ['userSpaces'] });
            router.replace('/(tabs)');
        } catch (e) {
            Alert.alert('Erreur', (e as Error).message);
        } finally {
            setJoinLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backText}>← Retour</Text>
                    </Pressable>
                </View>

                {/* Question */}
                <View style={styles.body}>
                    <Text style={styles.question}>
                        Quel est le code{'\n'}d&apos;invitation ?
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={joinCode}
                        onChangeText={setJoinCode}
                        placeholder="Ex: ABCDEF"
                        placeholderTextColor="#C7C7CC"
                        autoFocus
                        autoCapitalize="characters"
                        autoCorrect={false}
                        maxLength={6}
                        returnKeyType="done"
                        onSubmitEditing={handleJoin}
                    />
                </View>

                {/* CTA */}
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                        (!joinCode.trim() || joinLoading) && styles.buttonDisabled,
                    ]}
                    onPress={handleJoin}
                    disabled={!joinCode.trim() || joinLoading}
                >
                    {joinLoading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Rejoindre l&apos;espace</Text>
                    )}
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 28,
        paddingTop: 60,
        paddingBottom: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        padding: 4,
    },
    backText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    body: {
        gap: 32,
    },
    question: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1C1C1E',
        letterSpacing: -0.5,
    },
    input: {
        fontSize: 20,
        fontWeight: '400',
        color: '#1C1C1E',
        borderBottomWidth: 2,
        borderBottomColor: '#1C1C1E',
        paddingVertical: 12,
        letterSpacing: 4,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPressed: {
        opacity: 0.85,
    },
    buttonDisabled: {
        backgroundColor: '#AEAEB2',
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
