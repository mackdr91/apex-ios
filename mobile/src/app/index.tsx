/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Primary home screen combining the sneaker slideshow background, Editorial Hero overlay, and full Sneaker Inventory Dashboard with photo capture and QR tag generation.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BottomTabInset, BorderRadius } from '@/constants/theme';
import { SneakerSlideshow } from '@/components/home/SneakerSlideshow';
import { NebulaBackground } from '@/components/home/NebulaBackground';
import { EditorialHeroOverlay } from '@/components/home/EditorialHeroOverlay';
import { SneakerCard } from '@/components/inventory/SneakerCard';
import { AddSneakerModal } from '@/components/inventory/AddSneakerModal';
import { SneakerDetailModal } from '@/components/inventory/SneakerDetailModal';
import { inventoryApi } from '@/services/inventoryApi';
import { formatCurrency } from '@/utils/format';
import type {
  Sneaker,
  SneakerInput,
  InventoryMetrics,
  SneakerStatus,
} from '@/types/sneaker';

const EMPTY_METRICS: InventoryMetrics = {
  totalPairs: 0,
  totalCost: 0,
  totalValuation: 0,
  inStockCount: 0,
  inStockValue: 0,
  reservedCount: 0,
  reservedValue: 0,
};

export default function HomeScreen() {
  const [activeView, setActiveView] = useState<'hero' | 'dashboard'>('hero');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [metrics, setMetrics] = useState<InventoryMetrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | SneakerStatus>('all');

  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [editingSneaker, setEditingSneaker] = useState<Sneaker | null>(null);
  const [selectedSneaker, setSelectedSneaker] = useState<Sneaker | null>(null);

  const loadInventory = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage(null);

    try {
      const response = await inventoryApi.list();
      setSneakers(response.sneakers);
      setMetrics(response.metrics);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to reach sneaker vault API.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory(false);
  }, [loadInventory]);

  const switchToDashboard = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 240,
      useNativeDriver: true,
    }).start(() => {
      setActiveView('dashboard');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
    });
  };

  const switchToHero = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 240,
      useNativeDriver: true,
    }).start(() => {
      setActiveView('hero');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSaveSneaker = async (payload: SneakerInput, existingId?: string) => {
    if (existingId) {
      const updated = await inventoryApi.update(existingId, payload);
      setSelectedSneaker(updated);
    } else {
      await inventoryApi.create(payload);
    }
    setEditingSneaker(null);
    await loadInventory(true);
  };

  const handleDeletedSneaker = async (_id: string) => {
    setSelectedSneaker(null);
    await loadInventory(true);
  };

  const filteredSneakers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sneakers.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        item.brand.toLowerCase().includes(query) ||
        item.model.toLowerCase().includes(query) ||
        item.colorway.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.size.toLowerCase().includes(query)
      );
    });
  }, [sneakers, searchQuery, statusFilter]);

  const unrealizedGain = metrics.totalValuation - metrics.totalCost;
  const gainPositive = unrealizedGain >= 0;

  return (
    <View style={styles.rootContainer}>
      <StatusBar style="light" />

      {/* Background switches between Sneaker Slideshow on Home and Black/Blue/Purple Nebula on Vault Dashboard */}
      {activeView === 'hero' ? (
        <SneakerSlideshow intervalMs={4500} fadeDurationMs={1200} />
      ) : (
        <NebulaBackground />
      )}

      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        {activeView === 'hero' ? (
          <EditorialHeroOverlay onEnterVault={switchToDashboard} />
        ) : (
          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <View style={styles.headerBar}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={switchToHero}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.dashboardTitle}>My Sneaker Vault</Text>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  setEditingSneaker(null);
                  setAddModalVisible(true);
                }}
                style={styles.addHeaderButton}
                accessibilityLabel="Add sneaker"
              >
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: BottomTabInset + Spacing.five },
              ]}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => void loadInventory(true)}
                  tintColor="#FFFFFF"
                />
              }
            >
              {/* Top Dark Portfolio Valuation Card (Reference Mockup Style) */}
              <View style={styles.portfolioCard}>
                <View style={styles.portfolioLeft}>
                  <Text style={styles.portfolioLabel}>Collection Market Value</Text>
                  <Text style={styles.portfolioValue}>
                    {formatCurrency(metrics.totalValuation)}
                  </Text>
                  <View style={styles.portfolioSubRow}>
                    <Text style={styles.portfolioMetaText}>
                      {metrics.totalPairs} {metrics.totalPairs === 1 ? 'Pair' : 'Pairs'}
                    </Text>
                    <Text style={styles.portfolioDot}>•</Text>
                    <Text
                      style={[
                        styles.portfolioGainText,
                        { color: gainPositive ? '#30D158' : '#FF453A' },
                      ]}
                    >
                      {gainPositive ? '+' : ''}
                      {formatCurrency(unrealizedGain)} vs Cost
                    </Text>
                  </View>
                </View>

                {/* Signature White Ring Emblem from Reference Screenshot */}
                <View style={styles.ringOuter}>
                  <View style={styles.ringInner} />
                </View>
              </View>

              {/* Details Section Header */}
              <Text style={styles.sectionHeader}>Details</Text>

              {/* Dual Side-by-Side Pastel Breakdown Cards (Mint & Lavender) */}
              <View style={styles.dualRow}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() =>
                    setStatusFilter((prev) => (prev === 'in_stock' ? 'all' : 'in_stock'))
                  }
                  style={[
                    styles.pastelCard,
                    styles.mintCard,
                    statusFilter === 'in_stock' && styles.activePastelBorder,
                  ]}
                >
                  <View style={[styles.pastelIconCircle, { backgroundColor: '#5B9A8B' }]}>
                    <Ionicons name="cube-outline" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.pastelAmount}>
                    {formatCurrency(metrics.inStockValue)}
                  </Text>
                  <Text style={styles.pastelCaption}>
                    In Stock ({metrics.inStockCount}{' '}
                    {metrics.inStockCount === 1 ? 'pair' : 'pairs'})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() =>
                    setStatusFilter((prev) => (prev === 'reserved' ? 'all' : 'reserved'))
                  }
                  style={[
                    styles.pastelCard,
                    styles.lavenderCard,
                    statusFilter === 'reserved' && styles.activePastelBorder,
                  ]}
                >
                  <View style={[styles.pastelIconCircle, { backgroundColor: '#7A6F8B' }]}>
                    <Ionicons name="bookmark-outline" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.pastelAmount}>
                    {formatCurrency(metrics.reservedValue)}
                  </Text>
                  <Text style={styles.pastelCaption}>
                    Reserved ({metrics.reservedCount}{' '}
                    {metrics.reservedCount === 1 ? 'pair' : 'pairs'})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Action Row: Add Photo & Generate QR Sneaker Tag */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setEditingSneaker(null);
                  setAddModalVisible(true);
                }}
                style={styles.uploadActionCard}
              >
                <View style={styles.uploadActionTextCol}>
                  <Text style={styles.uploadActionTitle}>
                    Add Sneaker & Generate QR Tag
                  </Text>
                  <Text style={styles.uploadActionSub}>
                    Snap photo, log SKU/size & print box QR code
                  </Text>
                </View>
                <View style={styles.uploadPlusCircle}>
                  <Ionicons name="add" size={22} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              {/* Search & Filter Bar */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={16} color="rgba(255,255,255,0.55)" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search brand, model, SKU, or size..."
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  style={styles.searchInput}
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color="rgba(255,255,255,0.55)"
                    />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Collection List Header */}
              <View style={styles.listHeaderRow}>
                <Text style={styles.sectionHeader}>
                  Collection ({filteredSneakers.length})
                </Text>
                {statusFilter !== 'all' ? (
                  <TouchableOpacity onPress={() => setStatusFilter('all')}>
                    <Text style={styles.clearFilterText}>Show All</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{errorMessage}</Text>
                  <TouchableOpacity
                    onPress={() => void loadInventory(false)}
                    style={styles.retryBtn}
                  >
                    <Text style={styles.retryBtnText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {loading && sneakers.length === 0 ? (
                <View style={styles.emptyBox}>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.emptyText}>Loading your sneaker vault...</Text>
                </View>
              ) : filteredSneakers.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons
                    name="pricetag-outline"
                    size={32}
                    color="rgba(255,255,255,0.5)"
                  />
                  <Text style={styles.emptyTitle}>No sneakers found</Text>
                  <Text style={styles.emptyText}>
                    Tap “Add Sneaker & Generate QR Tag” above to photograph a pair and
                    generate its box QR code.
                  </Text>
                </View>
              ) : (
                filteredSneakers.map((item) => (
                  <SneakerCard
                    key={item.id}
                    sneaker={item}
                    onPress={(sneaker) => setSelectedSneaker(sneaker)}
                  />
                ))
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Animated.View>

      {/* Add / Edit Sneaker Modal */}
      <AddSneakerModal
        visible={addModalVisible}
        editingSneaker={editingSneaker}
        onClose={() => {
          setAddModalVisible(false);
          setEditingSneaker(null);
        }}
        onSave={handleSaveSneaker}
      />

      {/* Sneaker Detail & Printable QR Box Tag Modal */}
      <SneakerDetailModal
        sneaker={selectedSneaker}
        onClose={() => setSelectedSneaker(null)}
        onEdit={(sneaker) => {
          setSelectedSneaker(null);
          setEditingSneaker(sneaker);
          setAddModalVisible(true);
        }}
        onDeleted={handleDeletedSneaker}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(15, 15, 18, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: '#FFFFFF',
  },
  addHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(15, 15, 18, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  portfolioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(12, 12, 15, 0.92)',
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  portfolioLeft: {
    flex: 1,
  },
  portfolioLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginTop: 6,
  },
  portfolioSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  portfolioMetaText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  portfolioDot: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  portfolioGainText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ringOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  ringInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0C0C0F',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 18,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  dualRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pastelCard: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    minHeight: 142,
    justifyContent: 'space-between',
  },
  mintCard: {
    backgroundColor: 'rgba(214, 231, 226, 0.94)',
  },
  lavenderCard: {
    backgroundColor: 'rgba(227, 222, 232, 0.94)',
  },
  activePastelBorder: {
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  pastelIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pastelAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#121214',
    letterSpacing: -0.5,
    marginTop: 14,
  },
  pastelCaption: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(18, 18, 20, 0.68)',
    marginTop: 2,
  },
  uploadActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 15,
    marginTop: 12,
  },
  uploadActionTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  uploadActionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111113',
  },
  uploadActionSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#636366',
    marginTop: 2,
  },
  uploadPlusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7697A0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 22, 0.85)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    paddingVertical: 0,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C8DCD4',
    marginTop: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 69, 58, 0.22)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.45)',
  },
  errorBannerText: {
    flex: 1,
    color: '#FFD3D0',
    fontSize: 12,
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 10,
  },
  retryBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    backgroundColor: 'rgba(18, 18, 22, 0.84)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 6,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
