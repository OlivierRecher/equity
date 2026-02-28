import React from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CreateInviteScreen() {
    const router = useRouter();
    const { code, spaceName } = useLocalSearchParams<{ code: string; spaceName: string; spaceId: string }>();

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Rejoins "${spaceName}" sur Equity ! Utilise le code : ${code}`,
            });
        } catch {
            // User cancelled share
        }
    };

    const handleDone = () => {
        // Navigate to dashboard (group already switched in previous step)
        router.replace('/(tabs)');
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.step}>Étape 3/3</Text>
                </View>

                {/* Body */}
                <View style={styles.body}>
                    <Text style={styles.title}>
                        Ton espace est{'\n'}prêt ! 🎉
                    </Text>
                    <Text style={styles.subtitle}>
                        Partage ce code pour inviter tes colocataires :
                    </Text>

                    <View style={styles.codeCard}>
                        <Text style={styles.codeText}>{code}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <Pressable
                        style={({ pressed }) => [styles.shareButton, pressed && styles.buttonPressed]}
                        onPress={handleShare}
                    >
                        <Text style={styles.shareButtonText}>📤 Partager le code</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.doneButton, pressed && styles.buttonPressed]}
                        onPress={handleDone}
                    >
                        <Text style={styles.doneButtonText}>Aller au dashboard</Text>
                    </Pressable>
                </View>
            </View>
        </View>
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
        alignItems: 'flex-end',
    },
    step: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
    },
    body: {
        alignItems: 'center',
        gap: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1C1C1E',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
    },
    codeCard: {
        backgroundColor: '#F9F9FB',
        borderRadius: 20,
        paddingVertical: 28,
        paddingHorizontal: 44,
        marginTop: 8,
    },
    codeText: {
        fontSize: 40,
        fontWeight: '900',
        color: '#1C1C1E',
        letterSpacing: 8,
        textAlign: 'center',
    },
    actions: {
        gap: 12,
    },
    shareButton: {
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
    },
    shareButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    doneButton: {
        backgroundColor: '#F9F9FB',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
    },
    doneButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    buttonPressed: {
        opacity: 0.85,
    },
});
