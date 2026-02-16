import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Plus, ChevronRight } from 'lucide-react-native';

interface FloatingControlBarProps {
    onAddPress: () => void;
    onCatalogPress: () => void;
}

export default function FloatingControlBar({
    onAddPress,
    onCatalogPress,
}: FloatingControlBarProps) {
    return (
        <View style={styles.container}>
            <Pressable
                style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
                onPress={onAddPress}
            >
                <Text style={styles.pillText}>Ajouter</Text>
                <Plus size={20} color="#FFFFFF" strokeWidth={3} />
            </Pressable>

            <Pressable
                style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
                onPress={onCatalogPress}
            >
                <Text style={styles.pillText}>Catalogue</Text>
                <ChevronRight size={20} color="#FFFFFF" strokeWidth={3} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 40,
        left: 24,
        right: 24,
        flexDirection: 'row',
        gap: 12,
    },
    pill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1C1C1E',
        borderRadius: 18,
        paddingVertical: 16,
        paddingHorizontal: 20,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    pillPressed: {
        backgroundColor: '#3A3A3C',
    },
    pillText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
