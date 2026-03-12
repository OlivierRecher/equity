import React, { useCallback } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { fetchUserSpaces } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { SpaceDTO } from '../../types/dashboard';
import type BottomSheet from '@gorhom/bottom-sheet';
import ProfileSheet from '../ProfileSheet';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const PULL_THRESHOLD = 80;
const EXIT_SPRING = { damping: 30, stiffness: 120, mass: 0.9 };
const SNAP_BACK_SPRING = { damping: 22, stiffness: 200, mass: 0.7 };

interface SpacePullDownProps {
    children: React.ReactNode;
    groupName: string;
    isAdmin?: boolean;
    onSettingsPress?: () => void;
}

export default function SpacePullDown({ children, groupName, isAdmin, onSettingsPress }: Readonly<SpacePullDownProps>) {
    const translateY = useSharedValue(0);
    const startY = useSharedValue(0);
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, switchGroup, groupId } = useAuth();
    const profileSheetRef = React.useRef<BottomSheet>(null);

    const { data: spaces, isLoading } = useQuery({
        queryKey: ['userSpaces'],
        queryFn: fetchUserSpaces,
    });

    const navigateToHub = useCallback(() => {
        // Let the spring animation finish, then navigate
        setTimeout(() => {
            router.replace('/hub' as any);
            // Reset for when user comes back
            setTimeout(() => { translateY.value = 0; }, 200);
        }, 400);
    }, [router, translateY]);

    const handleSelectGroup = useCallback(
        async (space: SpaceDTO) => {
            if (space.id !== groupId) {
                await switchGroup(space.id);
                queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            }
            translateY.value = withSpring(0, SNAP_BACK_SPRING);
        },
        [groupId, switchGroup, queryClient, translateY],
    );

    const toggleOverlay = useCallback(() => {
        translateY.value = withSpring(SCREEN_HEIGHT, EXIT_SPRING);
        navigateToHub();
    }, [translateY, navigateToHub]);

    // Pan gesture — attached only to the header zone
    const panGesture = Gesture.Pan()
        .onStart(() => {
            startY.value = translateY.value;
        })
        .onUpdate((e) => {
            const nextY = startY.value + e.translationY;
            // Only prevent going above 0, no max limit
            translateY.value = Math.max(0, nextY);
        })
        .onEnd((e) => {
            if (e.translationY > PULL_THRESHOLD || e.velocityY > 400) {
                // Pulled down enough → smooth exit then navigate
                translateY.value = withSpring(SCREEN_HEIGHT, EXIT_SPRING);
                runOnJS(navigateToHub)();
            } else {
                // Not enough → snap back
                translateY.value = withSpring(0, SNAP_BACK_SPRING);
            }
        });

    // Dashboard slides down + subtle scale
    const dashboardStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: interpolate(translateY.value, [0, SCREEN_HEIGHT * 0.5], [1, 0.95], 'clamp') },
        ],
        borderRadius: interpolate(translateY.value, [0, 80], [0, 14], 'clamp'),
    }));

    // Chevron rotates
    const chevronStyle = useAnimatedStyle(() => ({
        transform: [{
            rotate: `${interpolate(translateY.value, [0, SCREEN_HEIGHT * 0.3], [0, 180], 'clamp')}deg`,
        }],
    }));

    return (
        <View style={styles.container}>
            {/* ── Background: Hub preview (same style as real hub) ───── */}
            <SafeAreaView style={styles.hubPreview}>
                <View style={styles.hubContent}>
                    <View style={styles.hubHeader}>
                        <Text style={styles.hubTitle}>
                            Mes espaces
                        </Text>
                        <Pressable onPress={() => profileSheetRef.current?.snapToIndex(0)} style={styles.avatarButton}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarInitial}>
                                    {user?.name?.charAt(0).toUpperCase() ?? '?'}
                                </Text>
                            </View>
                        </Pressable>
                    </View>

                    {isLoading ? (
                        <View style={styles.hubLoading}>
                            <ActivityIndicator size="small" color="#1C1C1E" />
                        </View>
                    ) : (
                        <View style={styles.hubList}>
                            {(spaces ?? []).map((space) => (
                                <Pressable
                                    key={space.id}
                                    style={styles.hubCard}
                                    onPress={() => handleSelectGroup(space)}
                                >
                                    <View style={styles.hubCardHeader}>
                                        <Text style={styles.hubCardName}>{space.name}</Text>
                                        <View style={styles.roleBadge}>
                                            <Text style={styles.roleBadgeText}>
                                                {space.role === 'ADMIN' ? 'Admin' : 'Membre'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.hubCardMeta}>
                                        {space.memberCount} membre{space.memberCount > 1 ? 's' : ''}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                {/* Actions — fixed at bottom */}
                <View style={styles.hubActions}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.primaryButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={() => router.replace('/hub/create/name' as any)}
                    >
                        <Text style={styles.primaryButtonText}>+ Nouvel espace</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.secondaryButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={navigateToHub}
                    >
                        <Text style={styles.secondaryButtonText}>Rejoindre via un code</Text>
                    </Pressable>
                </View>
            </SafeAreaView>

            <ProfileSheet ref={profileSheetRef} />

            {/* ── Foreground: Dashboard ────────────────────────────── */}
            <Animated.View style={[styles.dashboard, dashboardStyle]}>
                {/* Draggable header zone */}
                <GestureDetector gesture={panGesture}>
                    <Animated.View>
                        <View style={styles.headerTap}>
                            <Pressable style={styles.headerLeft} onPress={toggleOverlay}>
                                <Text style={styles.groupNameHeader} numberOfLines={1}>
                                    {groupName}
                                </Text>
                                <Animated.View style={chevronStyle}>
                                    <ChevronDown size={20} color="#8E8E93" strokeWidth={2.5} />
                                </Animated.View>
                            </Pressable>
                            {isAdmin && onSettingsPress && (
                                <Pressable onPress={onSettingsPress} hitSlop={10} style={styles.headerSettingsIcon}>
                                    <Settings size={22} color="#8E8E93" strokeWidth={2.5} />
                                </Pressable>
                            )}
                        </View>
                    </Animated.View>
                </GestureDetector>

                {/* Dashboard content */}
                {children}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    // ── Hub preview (behind dashboard) ──
    hubPreview: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF',
    },
    hubContent: {
        flex: 1,
        paddingHorizontal: 28,
        paddingTop: 16,
    },
    hubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    hubTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1C1C1E',
        letterSpacing: -0.5,
        flex: 1,
    },
    avatarButton: {
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1C1C1E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    hubLoading: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    hubList: {
        gap: 16,
    },
    hubCard: {
        backgroundColor: '#F9F9FB',
        borderRadius: 16,
        padding: 20,
    },
    hubCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    hubCardName: {
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
    hubCardMeta: {
        fontSize: 14,
        color: '#8E8E93',
    },
    hubActions: {
        gap: 12,
        paddingHorizontal: 28,
        paddingBottom: 40,
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
    // ── Foreground dashboard ──
    dashboard: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    headerTap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 56,
        paddingBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    headerSettingsIcon: {
        padding: 4,
        marginLeft: 12,
    },
    groupNameHeader: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1C1C1E',
        flexShrink: 1,
    },
});
