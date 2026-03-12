import React, { forwardRef, useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useAuth } from '../context/AuthContext';

const ProfileSheet = forwardRef<BottomSheet>(
    (_props, ref) => {
        const { user, logout, updateProfile } = useAuth();

        const [name, setName] = useState(user?.name ?? '');
        const [email, setEmail] = useState(user?.email ?? '');
        const [currentPassword, setCurrentPassword] = useState('');
        const [newPassword, setNewPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [saving, setSaving] = useState(false);
        const [error, setError] = useState('');
        const [success, setSuccess] = useState('');

        useEffect(() => {
            setName(user?.name ?? '');
            setEmail(user?.email ?? '');
        }, [user?.name, user?.email]);

        const handleSaveProfile = useCallback(async () => {
            setError('');
            setSuccess('');

            const trimmedName = name.trim();
            const trimmedEmail = email.trim().toLowerCase();

            if (!trimmedName || !trimmedEmail) {
                setError('Le nom et l\'email sont requis');
                return;
            }

            if (newPassword && newPassword !== confirmPassword) {
                setError('Les mots de passe ne correspondent pas');
                return;
            }

            if (newPassword && !currentPassword) {
                setError('Le mot de passe actuel est requis');
                return;
            }

            const hasNameChange = trimmedName !== user?.name;
            const hasEmailChange = trimmedEmail !== user?.email;
            const hasPasswordChange = !!newPassword;

            if (!hasNameChange && !hasEmailChange && !hasPasswordChange) {
                return;
            }

            setSaving(true);
            try {
                await updateProfile({
                    ...(hasNameChange ? { name: trimmedName } : {}),
                    ...(hasEmailChange ? { email: trimmedEmail } : {}),
                    ...(hasPasswordChange ? { currentPassword, newPassword } : {}),
                });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setSuccess('Profil mis à jour');
                setTimeout(() => setSuccess(''), 3000);
            } catch (e) {
                setError((e as Error).message || 'Erreur lors de la mise à jour');
            } finally {
                setSaving(false);
            }
        }, [name, email, currentPassword, newPassword, confirmPassword, user, updateProfile]);

        const handleLogout = useCallback(() => {
            Alert.alert('Déconnexion', 'Es-tu sûr de vouloir te déconnecter ?', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Déconnexion', style: 'destructive', onPress: logout },
            ]);
        }, [logout]);

        return (
            <BottomSheet
                ref={ref}
                index={-1}
                snapPoints={['75%']}
                enablePanDownToClose
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
            >
                <BottomSheetScrollView contentContainerStyle={styles.content}>
                    {/* Avatar */}
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarInitial}>
                            {user?.name?.charAt(0).toUpperCase() ?? '?'}
                        </Text>
                    </View>

                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Nom</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Ton nom"
                            placeholderTextColor="#C7C7CC"
                            autoCapitalize="words"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="ton@email.com"
                            placeholderTextColor="#C7C7CC"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Password section */}
                    <View style={styles.separator} />
                    <Text style={styles.sectionTitle}>Changer le mot de passe</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Mot de passe actuel</Text>
                        <TextInput
                            style={styles.input}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="••••••••"
                            placeholderTextColor="#C7C7CC"
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
                        <TextInput
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="••••••••"
                            placeholderTextColor="#C7C7CC"
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Confirmer</Text>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="••••••••"
                            placeholderTextColor="#C7C7CC"
                            secureTextEntry
                        />
                    </View>

                    {/* Feedback */}
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    {success ? <Text style={styles.successText}>{success}</Text> : null}

                    {/* Save button */}
                    <Pressable
                        style={({ pressed }) => [styles.saveButton, pressed && styles.buttonPressed, saving && styles.buttonDisabled]}
                        onPress={handleSaveProfile}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={styles.saveButtonText}>Enregistrer</Text>
                        )}
                    </Pressable>

                    {/* Logout */}
                    <Pressable
                        style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutPressed]}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutText}>Se déconnecter</Text>
                    </Pressable>
                </BottomSheetScrollView>
            </BottomSheet>
        );
    },
);

ProfileSheet.displayName = 'ProfileSheet';
export default ProfileSheet;

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
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 40,
        gap: 16,
    },
    avatarCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#1C1C1E',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 8,
    },
    avatarInitial: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    inputGroup: {
        gap: 6,
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
        backgroundColor: '#F9F9FB',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    separator: {
        height: 1,
        backgroundColor: '#E5E5EA',
        marginVertical: 4,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    errorText: {
        fontSize: 14,
        color: '#FF3B30',
        textAlign: 'center',
    },
    successText: {
        fontSize: 14,
        color: '#34C759',
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#1C1C1E',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    buttonPressed: {
        opacity: 0.85,
    },
    buttonDisabled: {
        backgroundColor: '#AEAEB2',
    },
    logoutButton: {
        backgroundColor: '#FFF0F0',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    logoutPressed: {
        backgroundColor: '#FFE0E0',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF3B30',
    },
});
