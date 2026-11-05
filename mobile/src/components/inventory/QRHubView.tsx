/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: QR Hub view displaying printable shoe-box QR tags for every pair in the sneaker collection with search, share, and inspection actions.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius, BottomTabInset } from '@/constants/theme';
import { SneakerQRTag } from '@/components/inventory/SneakerQRTag';
import { formatCurrency } from '@/utils/format';
import type { Sneaker } from '@/types/sneaker';

export interface QRHubViewProps {
  sneakers: Sneaker[];
  refreshing: boolean;
  onRefresh: () => void;
  onSelectSneaker: (sneaker: Sneaker) => void;
  onAddSneaker: () => void;
  onBackToHome: () => void;
}

export function QRHubView({
  sneakers,
  refreshing,
  onRefresh,
  onSelectSneaker,
  onAddSneaker,
  onBackToHome,
}: QRHubViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSneakers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sneakers;
    return sneakers.filter(
      (item) =>
        item.brand.toLowerCase().includes(query) ||
        item.model.toLowerCase().includes(query) ||
        item.colorway.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.size.toLowerCase().includes(query) ||
        item.storageLocation.toLowerCase().includes(query)
    );
  }, [sneakers, searchQuery]);

  const handleShareTag = async (sneaker: Sneaker) => {
    try {
      await Share.share({
        message: `${sneaker.brand} ${sneaker.model} (${sneaker.colorway})\nSKU: ${sneaker.sku} · US ${sneaker.size}\nLocation: ${sneaker.storageLocation || 'Vault'}\nQR URI: ${sneaker.qrCodeData}`,
      });
    } catch (error) {
      Alert.alert(
        'Share Failed',
        error instanceof Error ? error.message : 'Unable to share this QR tag.'
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onBackToHome}
          style={styles.iconButton}
          accessibilityLabel="Back to Home"
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>QR Box Tag Hub</Text>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onAddSneaker}
          style={styles.iconButton}
          accessibilityLabel="Add sneaker"
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BottomTabInset + 100 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        }
      >
        {/* Summary Banner */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconWrap}>
            <Ionicons name="qr-code" size={24} color="#C4B5FD" />
          </View>
          <View style={styles.summaryTextCol}>
            <Text style={styles.summaryTitle}>
              {sneakers.length} Printable Shoe-Box {sneakers.length === 1 ? 'Tag' : 'Tags'}
            </Text>
            <Text style={styles.summarySub}>
              Each QR code encodes your sneaker’s unique vault URI, SKU, and US size for instant box identification.
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="rgba(255,255,255,0.55)" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Filter QR tags by SKU, model, size, or shelf..."
            placeholderTextColor="rgba(255,255,255,0.45)"
            style={styles.searchInput}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.55)" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* QR Tag Cards List */}
        {filteredSneakers.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="qr-code-outline" size={34} color="rgba(255,255,255,0.45)" />
            <Text style={styles.emptyTitle}>No matching QR tags</Text>
            <Text style={styles.emptySub}>
              Add a new sneaker to automatically generate its printable box QR tag.
            </Text>
          </View>
        ) : (
          filteredSneakers.map((sneaker) => (
            <View key={sneaker.id} style={styles.tagWrapperCard}>
              <SneakerQRTag sneaker={sneaker} qrSize={122} />

              <View style={styles.tagFooterRow}>
                <View style={styles.tagMetaLeft}>
                  <Text style={styles.tagValueText}>
                    {formatCurrency(sneaker.marketValue)}
                  </Text>
                  <Text style={styles.tagConditionText}>
                    {sneaker.condition} · {sneaker.boxCondition}
                  </Text>
                </View>

                <View style={styles.tagActionButtons}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => void handleShareTag(sneaker)}
                    style={styles.secondaryBtn}
                  >
                    <Ionicons name="share-outline" size={15} color="#FFFFFF" />
                    <Text style={styles.secondaryBtnText}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onSelectSneaker(sneaker)}
                    style={styles.primaryBtn}
                  >
                    <Text style={styles.primaryBtnText}>Details</Text>
                    <Ionicons name="chevron-forward" size={14} color="#000000" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(15, 15, 18, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 16, 42, 0.84)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    gap: 14,
  },
  summaryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(109, 40, 217, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.25)',
  },
  summaryTextCol: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  summarySub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 3,
    lineHeight: 17,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    marginBottom: 14,
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
  tagWrapperCard: {
    backgroundColor: 'rgba(16, 16, 24, 0.88)',
    borderRadius: 24,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.22)',
  },
  tagFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  tagMetaLeft: {
    flex: 1,
  },
  tagValueText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tagConditionText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: 1,
  },
  tagActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C8DCD4',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
  },
  primaryBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  emptyCard: {
    backgroundColor: 'rgba(18, 18, 26, 0.84)',
    borderRadius: 20,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  emptySub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
