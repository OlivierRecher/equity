import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import type { UserBalanceDTO } from '../../types/dashboard';

interface BalanceChartProps {
    balances: UserBalanceDTO[];
}

const BAR_HEIGHT = 36;
const BAR_GAP = 14;
const ANIMATION_DURATION = 800;

/**
 * Animated horizontal bar for a single user balance.
 */
function BalanceBar({
    item,
    maxAbsBalance,
    index,
}: {
    item: UserBalanceDTO;
    maxAbsBalance: number;
    index: number;
}) {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withDelay(
            index * 120,
            withTiming(1, {
                duration: ANIMATION_DURATION,
                easing: Easing.out(Easing.cubic),
            }),
        );
    }, [index, progress]);

    const isPositive = item.balance >= 0;
    const barWidthPercent =
        maxAbsBalance === 0 ? 0 : (Math.abs(item.balance) / maxAbsBalance) * 45;

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${barWidthPercent * progress.value}%` as unknown as number,
        opacity: 0.3 + 0.7 * progress.value,
    }));

    return (
        <View style={styles.rowContainer}>
            {/* Name label */}
            <Text style={styles.nameLabel} numberOfLines={1}>
                {item.userName}
            </Text>

            {/* Bar area */}
            <View style={styles.barArea}>
                {/* Zero line */}
                <View style={styles.zeroLine} />

                {/* Bar */}
                <Animated.View
                    style={[
                        styles.bar,
                        isPositive ? styles.barPositive : styles.barNegative,
                        isPositive ? { left: '50%' } : { right: '50%' },
                        animatedStyle,
                    ]}
                />
            </View>

            {/* Amount label */}
            <Text
                style={[
                    styles.amountLabel,
                    isPositive ? styles.amountPositive : styles.amountNegative,
                ]}
            >
                {isPositive ? '+' : ''}
                {item.balance.toFixed(1)}
            </Text>
        </View>
    );
}

/**
 * BalanceChart — Trade Republic style horizontal bar chart.
 *
 * - Green bars (credit) extend right from center
 * - Red bars (debt) extend left from center
 * - Animated entry with staggered delays
 */
export default function BalanceChart({ balances }: BalanceChartProps) {
    const maxAbsBalance = Math.max(
        ...balances.map((b) => Math.abs(b.balance)),
        1,
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Balances</Text>
            <View style={styles.chartContainer}>
                {balances.map((item, index) => (
                    <BalanceBar
                        key={item.userId}
                        item={item}
                        maxAbsBalance={maxAbsBalance}
                        index={index}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 20,
    },
    chartContainer: {
        gap: BAR_GAP,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: BAR_HEIGHT,
    },
    nameLabel: {
        width: 70,
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    barArea: {
        flex: 1,
        height: BAR_HEIGHT,
        position: 'relative',
    },
    zeroLine: {
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: '#E5E5EA',
    },
    bar: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        borderRadius: 14,
        minWidth: 4,
    },
    barPositive: {
        backgroundColor: '#34C759',
    },
    barNegative: {
        backgroundColor: '#FF3B30',
    },
    amountLabel: {
        width: 60,
        textAlign: 'right',
        fontSize: 14,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    amountPositive: {
        color: '#34C759',
    },
    amountNegative: {
        color: '#FF3B30',
    },
});
