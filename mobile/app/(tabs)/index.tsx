import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ArrowRightLeft } from 'lucide-react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { fetchGroupDashboard } from '../../src/services/api';
import BalanceChart from '../../src/components/dashboard/BalanceChart';
import ActivityFeed from '../../src/components/dashboard/ActivityFeed';
import FloatingControlBar from '../../src/components/dashboard/FloatingControlBar';
import AddTaskSheet from '../../src/components/dashboard/AddTaskSheet';
import CatalogSheet from '../../src/components/dashboard/CatalogSheet';
import CatalogFormSheet from '../../src/components/dashboard/CatalogFormSheet';
import type { UserBalanceDTO, CatalogItemDTO } from '../../src/types/dashboard';

const GROUP_ID = 'group-coloc';
const CURRENT_USER_ID = 'user-alice';

function BalanceListItem({ item }: { item: UserBalanceDTO }) {
  const isPositive = item.balance >= 0;

  return (
    <View style={styles.listItem}>
      <View
        style={[
          styles.avatar,
          { backgroundColor: isPositive ? '#E8F9ED' : '#FDECEB' },
        ]}
      >
        <Text style={styles.avatarText}>
          {item.userName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemName}>{item.userName}</Text>
        <Text style={styles.listItemDetail}>
          Généré: {item.pointsGenerated.toFixed(1)} · Consommé:{' '}
          {item.pointsConsumed.toFixed(1)}
        </Text>
      </View>
      <Text
        style={[
          styles.listItemBalance,
          isPositive ? styles.balancePositive : styles.balanceNegative,
        ]}
      >
        {isPositive ? '+' : ''}
        {item.balance.toFixed(1)}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const addSheetRef = useRef<BottomSheet>(null);
  const catalogSheetRef = useRef<BottomSheet>(null);
  const catalogFormRef = useRef<BottomSheet>(null);

  // Track which catalog item is being edited (null = create mode)
  const [editingCatalogItem, setEditingCatalogItem] = useState<CatalogItemDTO | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', GROUP_ID],
    queryFn: () => fetchGroupDashboard(GROUP_ID),
  });

  const openAddSheet = useCallback(() => {
    addSheetRef.current?.snapToIndex(0);
  }, []);

  const closeAddSheet = useCallback(() => {
    addSheetRef.current?.close();
  }, []);

  const openCatalogSheet = useCallback(() => {
    catalogSheetRef.current?.snapToIndex(0);
  }, []);

  // Open form in CREATE mode
  const openCatalogFormCreate = useCallback(() => {
    setEditingCatalogItem(null);
    catalogSheetRef.current?.close();
    // Small delay so sheets don't overlap
    setTimeout(() => catalogFormRef.current?.snapToIndex(1), 150);
  }, []);

  // Open form in EDIT mode
  const openCatalogFormEdit = useCallback((item: CatalogItemDTO) => {
    setEditingCatalogItem(item);
    catalogSheetRef.current?.close();
    setTimeout(() => catalogFormRef.current?.snapToIndex(1), 150);
  }, []);

  // Close form → re-open list
  const closeCatalogForm = useCallback(() => {
    catalogFormRef.current?.close();
    setTimeout(() => catalogSheetRef.current?.snapToIndex(0), 150);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#1C1C1E" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>
          Erreur de chargement. Vérifiez que le serveur est en marche.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.header}>Dashboard</Text>
        <Text style={styles.subHeader}>Coloc Test</Text>

        {/* Balance Chart */}
        <BalanceChart balances={data.balances} />

        {/* Suggested Next Doer */}
        {data.suggestedNextDoer && (
          <View style={styles.suggestionCard}>
            <ArrowRightLeft size={18} color="#007AFF" strokeWidth={2.5} />
            <Text style={styles.suggestionText}>
              Prochaine tâche suggérée pour{' '}
              <Text style={styles.suggestionName}>
                {data.suggestedNextDoer.userName}
              </Text>
            </Text>
          </View>
        )}

        {/* Balance Details */}
        <Text style={styles.sectionTitle}>Soldes</Text>
        {data.balances.map((item) => (
          <BalanceListItem key={item.userId} item={item} />
        ))}

        {/* Activity Feed */}
        <Text style={styles.sectionTitle}>Historique</Text>
        <ActivityFeed history={data.history} />
      </ScrollView>

      {/* Floating Control Bar */}
      <FloatingControlBar
        onAddPress={openAddSheet}
        onCatalogPress={openCatalogSheet}
      />

      {/* Bottom Sheets */}
      <AddTaskSheet
        ref={addSheetRef}
        groupId={GROUP_ID}
        members={data.balances}
        catalog={data.catalog}
        currentUserId={CURRENT_USER_ID}
        onClose={closeAddSheet}
      />

      <CatalogSheet
        ref={catalogSheetRef}
        catalog={data.catalog}
        onAddPress={openCatalogFormCreate}
        onItemPress={openCatalogFormEdit}
      />

      <CatalogFormSheet
        ref={catalogFormRef}
        groupId={GROUP_ID}
        editItem={editingCatalogItem}
        onClose={closeCatalogForm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#8E8E93',
  },
  errorText: {
    fontSize: 15,
    color: '#FF3B30',
    textAlign: 'center',
  },

  // Header
  header: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 28,
  },

  // Suggestion card
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF3FF',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    gap: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#3C3C43',
  },
  suggestionName: {
    fontWeight: '700',
    color: '#007AFF',
  },

  // Section
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 28,
    marginBottom: 12,
  },

  // List items
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  listItemDetail: {
    fontSize: 12,
    color: '#8E8E93',
  },
  listItemBalance: {
    fontSize: 17,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  balancePositive: {
    color: '#34C759',
  },
  balanceNegative: {
    color: '#FF3B30',
  },
});
