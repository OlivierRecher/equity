import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function CreateNameScreen() {
    const router = useRouter();
    const [name, setName] = useState('');

    const handleNext = () => {
        if (!name.trim()) return;
        router.push({
            pathname: '/hub/create/template',
            params: { name: name.trim() },
        });
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
                    <Text style={styles.step}>Étape 1/3</Text>
                </View>

                {/* Question */}
                <View style={styles.body}>
                    <Text style={styles.question}>
                        Comment s'appelle{'\n'}cet espace ?
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Coloc Rue de la Paix"
                        placeholderTextColor="#C7C7CC"
                        autoFocus
                        autoCapitalize="words"
                        returnKeyType="next"
                        onSubmitEditing={handleNext}
                    />
                </View>

                {/* CTA */}
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                        !name.trim() && styles.buttonDisabled,
                    ]}
                    onPress={handleNext}
                    disabled={!name.trim()}
                >
                    <Text style={styles.buttonText}>Continuer</Text>
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
    input: {
        fontSize: 20,
        fontWeight: '400',
        color: '#1C1C1E',
        borderBottomWidth: 2,
        borderBottomColor: '#1C1C1E',
        paddingVertical: 12,
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
