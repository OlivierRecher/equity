import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { fetchUserSpaces } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { SpaceDTO } from '../../types/dashboard';

interface Props {
    currentGroupId: string;
}

const SpaceSwitcherSheet = forwardRef<BottomSheet, Props>(({ currentGroupId }, ref) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { switchGroup } = useAuth();
    const snapPoints = useMemo(() => ['50%'], []);

    const { data: spaces, isLoading } = useQuery({
        queryKey: ['userSpaces'],
        queryFn: fetchUserSpaces,
    });

    const handleSelect = useCallback(
        async (space: SpaceDTO) => {
            if (space.id === currentGroupId) {
                (ref as React.RefObject<BottomSheet>)?.current?.close();
                return;
            }
            await switchGroup(space.id);
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            (ref as React.RefObject<BottomSheet>)?.current?.close();
        },
        [currentGroupId, switchGroup, queryClient, ref],
    );

    const handleGoToHub = useCallback(() => {
        (ref as React.RefObject<BottomSheet>)?.current?.close();
        router.push('/hub');
    }, [ref, router]);

    const renderItem = ({ item }: { item: SpaceDTO }) => {
        const isActive = item.id === currentGroupId;
        return (
            <Pressable
                style={[styles.item, isActive && styles.itemActive]}
                onPress={() => handleSelect(item)}
            >
                <View style={styles.itemLeft}>
                    <Text style={[styles.itemName, isActive && styles.itemNameActive]}>
                        {item.name}
                    </Text>
                    <Text style={styles.itemMeta}>
                        {item.memberCount} membre{item.memberCount > 1 ? 's' : ''}
                    </Text>
                </View>
                {isActive && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
        );
    };

    return (
        <BottomSheet
            ref={ref}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            backgroundStyle={styles.background}
            handleIndicatorStyle={styles.handle}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Changer d'espace</Text>
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="small" color="#1C1C1E" />
                </View>
            ) : (
                <BottomSheetFlatList
                    data={spaces ?? []}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListFooterComponent={
                        <Pressable
                            style={({ pressed }) => [styles.footerButton, pressed && { opacity: 0.7 }]}
                            onPress={handleGoToHub}
                        >
                            <Text style={styles.footerButtonText}>Gérer mes espaces</Text>
                        </Pressable>
                    }
                />
            )}
        </BottomSheet>
    );
});

SpaceSwitcherSheet.displayName = 'SpaceSwitcherSheet';

export default SpaceSwitcherSheet;

const styles = StyleSheet.create({
    background: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
    },
    handle: {
        backgroundColor: '#D1D1D6',
        width: 36,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1C1C1E',
    },
    centered: {
        padding: 32,
        alignItems: 'center',
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 4,
    },
    itemActive: {
        backgroundColor: '#F2F2F7',
    },
    itemLeft: {
        gap: 2,
    },
    itemName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    itemNameActive: {
        fontWeight: '800',
    },
    itemMeta: {
        fontSize: 13,
        color: '#8E8E93',
    },
    checkmark: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    footerButton: {
        marginTop: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#F9F9FB',
    },
    footerButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#8E8E93',
    },
});
