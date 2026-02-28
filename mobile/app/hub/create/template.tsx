import React, { useState } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createSpace } from '../../../src/services/api';
import { useAuth } from '../../../src/context/AuthContext';

type TemplateOption = 'coloc' | 'family' | 'custom';

const TEMPLATES: Array<{ key: TemplateOption; emoji: string; label: string; desc: string }> = [
    { key: 'coloc', emoji: '🏠', label: 'Colocation', desc: 'Vaisselle, Ménage, Poubelles...' },
    { key: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Famille', desc: 'Repas, Courses, Jardinage...' },
    { key: 'custom', emoji: '✨', label: 'Vide', desc: 'Tu ajouteras tes tâches toi-même' },
];

export default function CreateTemplateScreen() {
    const router = useRouter();
    const { name } = useLocalSearchParams<{ name: string }>();
    const { switchGroup } = useAuth();

    const [selected, setSelected] = useState<TemplateOption | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!selected || !name) return;
        setLoading(true);
        try {
            const result = await createSpace({
                name,
                template: selected,
            });
            await switchGroup(result.id);
            router.push({
                pathname: '/hub/create/invite',
                params: { code: result.code, spaceName: result.name, spaceId: result.id },
            });
        } catch (e) {
            Alert.alert('Erreur', (e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backText}>← Retour</Text>
                    </Pressable>
                    <Text style={styles.step}>Étape 2/3</Text>
                </View>

                {/* Question */}
                <View style={styles.body}>
                    <Text style={styles.question}>
                        Choisis un{'\n'}modèle
                    </Text>

                    <View style={styles.options}>
                        {TEMPLATES.map((t) => (
                            <Pressable
                                key={t.key}
                                style={[
                                    styles.option,
                                    selected === t.key && styles.optionSelected,
                                ]}
                                onPress={() => setSelected(t.key)}
                            >
                                <Text style={styles.optionEmoji}>{t.emoji}</Text>
                                <View style={styles.optionInfo}>
                                    <Text style={styles.optionLabel}>{t.label}</Text>
                                    <Text style={styles.optionDesc}>{t.desc}</Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* CTA */}
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                        (!selected || loading) && styles.buttonDisabled,
                    ]}
                    onPress={handleCreate}
                    disabled={!selected || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Créer l'espace</Text>
                    )}
                </Pressable>
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
    step: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
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
    options: {
        gap: 12,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        backgroundColor: '#F9F9FB',
        gap: 16,
    },
    optionSelected: {
        backgroundColor: '#1C1C1E',
    },
    optionEmoji: {
        fontSize: 36,
    },
    optionInfo: {
        flex: 1,
        gap: 2,
    },
    optionLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    optionDesc: {
        fontSize: 14,
        color: '#8E8E93',
    },
    button: {
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
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
