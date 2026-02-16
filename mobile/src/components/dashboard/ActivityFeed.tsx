import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TaskHistoryItemDTO } from '../../types/dashboard';

interface ActivityFeedProps {
    history: TaskHistoryItemDTO[];
}

function formatDate(iso: string): string {
    const date = new Date(iso);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month} à ${hours}:${mins}`;
}

export default function ActivityFeed({ history }: ActivityFeedProps) {
    if (history.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucune activité pour le moment</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {history.map((item) => (
                <View key={item.id} style={styles.row}>
                    <View style={styles.info}>
                        <Text style={styles.taskName}>{item.taskName}</Text>
                        <Text style={styles.detail}>
                            fait par {item.doerName} le {formatDate(item.date)}
                        </Text>
                    </View>
                    <Text style={styles.value}>{item.value} pts</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 4,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#AEAEB2',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 6,
        elevation: 1,
    },
    info: {
        flex: 1,
    },
    taskName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 2,
    },
    detail: {
        fontSize: 12,
        fontWeight: '300',
        color: '#8E8E93',
    },
    value: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1C1C1E',
        fontVariant: ['tabular-nums'],
    },
});
