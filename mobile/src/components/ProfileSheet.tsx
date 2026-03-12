import React, { forwardRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

interface ProfileSheetProps {
    user: { id: string; name: string; email: string } | null;
    onLogout: () => void;
}

const ProfileSheet = forwardRef<BottomSheet, ProfileSheetProps>(
    ({ user, onLogout }, ref) => {
        return (
            <BottomSheet
                ref={ref}
                index={-1}
                snapPoints={['35%']}
                enablePanDownToClose
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
            >
                <View style={styles.content}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarInitial}>
                            {user?.name?.charAt(0).toUpperCase() ?? '?'}
                        </Text>
                    </View>

                    <Text style={styles.name}>{user?.name ?? 'Utilisateur'}</Text>
                    <Text style={styles.email}>{user?.email ?? ''}</Text>

                    <Pressable
                        style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutPressed]}
                        onPress={onLogout}
                    >
                        <Text style={styles.logoutText}>Se déconnecter</Text>
                    </Pressable>
                </View>
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
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 40,
    },
    avatarCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#1C1C1E',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarInitial: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 24,
    },
    logoutButton: {
        backgroundColor: '#FFF0F0',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 32,
        width: '100%',
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
