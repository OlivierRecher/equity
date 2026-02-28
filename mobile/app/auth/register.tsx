import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function RegisterScreen() {
    const router = useRouter();
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            setError('Remplis tous les champs');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit faire au moins 6 caractères');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await register(name.trim(), email.trim().toLowerCase(), password);
        } catch (e) {
            setError((e as Error).message || 'Inscription échouée');
        } finally {
            setLoading(false);
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
                    <Text style={styles.title}>Créer un{'\n'}compte.</Text>
                    <Text style={styles.subtitle}>
                        Rejoins ta coloc en quelques secondes
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Prénom</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Alice"
                            placeholderTextColor="#C7C7CC"
                            autoCapitalize="words"
                            autoComplete="given-name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="alice@equity.app"
                            placeholderTextColor="#C7C7CC"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="email"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Mot de passe</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="6 caractères minimum"
                            placeholderTextColor="#C7C7CC"
                            secureTextEntry
                            autoComplete="new-password"
                        />
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.buttonPressed,
                            loading && styles.buttonDisabled,
                        ]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={styles.buttonText}>Continuer</Text>
                        )}
                    </Pressable>

                    <Pressable
                        style={styles.linkButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.linkText}>
                            Déjà un compte ?{' '}
                            <Text style={styles.linkTextBold}>Se connecter</Text>
                        </Text>
                    </Pressable>
                </View>
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
        paddingTop: 100,
        paddingBottom: 50,
    },
    header: {
        gap: 8,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#1C1C1E',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 17,
        color: '#8E8E93',
        fontWeight: '400',
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        fontSize: 17,
        fontWeight: '400',
        color: '#1C1C1E',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        paddingVertical: 12,
    },
    errorText: {
        fontSize: 14,
        color: '#FF3B30',
        textAlign: 'center',
    },
    footer: {
        gap: 20,
        alignItems: 'center',
    },
    button: {
        width: '100%',
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
    linkButton: {
        padding: 8,
    },
    linkText: {
        fontSize: 15,
        color: '#8E8E93',
    },
    linkTextBold: {
        fontWeight: '700',
        color: '#1C1C1E',
    },
});
