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

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Remplis tous les champs');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await login(email.trim().toLowerCase(), password);
        } catch (e) {
            setError((e as Error).message || 'Connexion échouée');
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
                    <Text style={styles.title}>Bienvenue.</Text>
                    <Text style={styles.subtitle}>
                        Connecte-toi pour continuer
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
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
                            placeholder="••••••••"
                            placeholderTextColor="#C7C7CC"
                            secureTextEntry
                            autoComplete="password"
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
                        onPress={handleLogin}
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
                        onPress={() => router.push('/auth/register')}
                    >
                        <Text style={styles.linkText}>
                            Pas encore de compte ?{' '}
                            <Text style={styles.linkTextBold}>Créer un compte</Text>
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
