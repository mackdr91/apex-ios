/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Full-screen sneaker detail sheet with hero photo, valuation, specs, and QR box tag.
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SneakerQRTag } from '@/components/inventory/SneakerQRTag';
import { inventoryApi } from '@/services/inventoryApi';
import { formatCurrency } from '@/utils/format';
import { STATUS_LABELS, type Sneaker } from '@/types/sneaker';

const FALLBACK_SNEAKER_IMGS = [
  require('../../../assets/images/sneakers/sneaker_1.jpg'),
  require('../../../assets/images/sneakers/sneaker_2.jpg'),
  require('../../../assets/images/sneakers/sneaker_3.jpg'),
];

function getFallbackSneakerImg(id: string) {
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
  return FALLBACK_SNEAKER_IMGS[code % FALLBACK_SNEAKER_IMGS.length];
}

export interface SneakerDetailModalProps {
  sneaker: Sneaker | null;
  onClose: () => void;
  onEdit: (sneaker: Sneaker) => void;
  onDeleted: (id: string) => void;
}

export function SneakerDetailModal({ sneaker, onClose, onEdit, onDeleted }: SneakerDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!sneaker) return null;

  const profit = sneaker.marketValue - sneaker.purchasePrice;
  const profitPositive = profit >= 0;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${sneaker.brand} ${sneaker.model} — ${sneaker.colorway}\nSKU ${sneaker.sku} · US ${sneaker.size}\n${sneaker.qrCodeData}`,
      });
    } catch (error: unknown) {
      Alert.alert('Share failed', error instanceof Error ? error.message : 'Unable to share this pair.');
    }
  };

  const confirmDelete = () => {
    Alert.alert('Remove pair?', `${sneaker.model} will be permanently removed from your vault.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await inventoryApi.remove(sneaker.id);
            onDeleted(sneaker.id);
          } catch (error: unknown) {
            Alert.alert('Delete failed', error instanceof Error ? error.message : 'Please try again.');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton} accessibilityLabel="Close">
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pair Details</Text>
          <TouchableOpacity onPress={() => onEdit(sneaker)} style={styles.iconButton} accessibilityLabel="Edit">
            <Ionicons name="create-outline" size={19} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero photo */}
          <View style={styles.photoWrap}>
            <Image
              source={
                sneaker.imageData
                  ? { uri: sneaker.imageData }
                  : getFallbackSneakerImg(sneaker.id)
              }
              style={styles.photo}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{STATUS_LABELS[sneaker.status]}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.brand}>{sneaker.brand.toUpperCase()}</Text>
          <Text style={styles.model}>{sneaker.model}</Text>
          {sneaker.colorway ? <Text style={styles.colorway}>{sneaker.colorway}</Text> : null}

          {/* Valuation card (dark, reference-style) */}
          <View style={styles.valueCard}>
            <View>
              <Text style={styles.valueLabel}>Market Value</Text>
              <Text style={styles.valueAmount}>{formatCurrency(sneaker.marketValue)}</Text>
            </View>
            <View style={styles.valueRight}>
              <Text style={styles.valueLabel}>Paid {formatCurrency(sneaker.purchasePrice)}</Text>
              <Text style={[styles.profit, { color: profitPositive ? '#30D158' : '#FF453A' }]}>
                {profitPositive ? '+' : '−'}
                {formatCurrency(Math.abs(profit))}
              </Text>
            </View>
          </View>

          {/* Specs grid */}
          <View style={styles.specGrid}>
            <Spec label="SKU" value={sneaker.sku} />
            <Spec label="Size" value={`US ${sneaker.size}`} />
            <Spec label="Condition" value={sneaker.condition} />
            <Spec label="Box" value={sneaker.boxCondition} />
            <Spec label="Location" value={sneaker.storageLocation || '—'} />
            <Spec label="Purchased" value={sneaker.purchaseDate ?? '—'} />
          </View>

          {sneaker.notes ? (
            <View style={styles.notesCard}>
              <Text style={styles.sectionLabel}>NOTES</Text>
              <Text style={styles.notes}>{sneaker.notes}</Text>
            </View>
          ) : null}

          {/* QR Box Tag */}
          <Text style={styles.sectionLabel}>BOX TAG</Text>
          <SneakerQRTag sneaker={sneaker} />
          <Text style={styles.hint}>Screenshot or share this tag and stick it on the shoe box.</Text>

          {/* Actions */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleShare} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={18} color="#000000" />
            <Text style={styles.primaryText}>Share Tag</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={confirmDelete}
            disabled={isDeleting}
            activeOpacity={0.7}
          >
            {isDeleting ? (
              <ActivityIndicator color="#FF453A" />
            ) : (
              <Text style={styles.deleteText}>Remove from Vault</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.spec}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: '#0B0B0D' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },
  photoWrap: { marginTop: 8, marginBottom: 18 },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 24, backgroundColor: '#1C1C1E' },
  photoPlaceholder: { justifyContent: 'center', alignItems: 'center', gap: 8 },
  placeholderText: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  statusPill: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  brand: { color: '#8E8E93', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  model: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.8, marginTop: 2 },
  colorway: { color: 'rgba(255,255,255,0.7)', fontSize: 15, marginTop: 2 },
  valueCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: '#000000',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 18,
    marginTop: 18,
  },
  valueLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  valueAmount: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', letterSpacing: -0.8, marginTop: 4 },
  valueRight: { alignItems: 'flex-end' },
  profit: { fontSize: 17, fontWeight: '800', marginTop: 4 },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  spec: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 14,
  },
  specLabel: { color: '#8E8E93', fontSize: 12, fontWeight: '600' },
  specValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 4 },
  notesCard: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 14, marginTop: 10 },
  notes: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 20, marginTop: 6 },
  sectionLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 22,
    marginBottom: 10,
  },
  hint: { color: 'rgba(255,255,255,0.45)', fontSize: 12, textAlign: 'center', marginTop: 10 },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 50,
    marginTop: 20,
  },
  primaryText: { color: '#000000', fontSize: 16, fontWeight: '700' },
  deleteButton: { height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  deleteText: { color: '#FF453A', fontSize: 15, fontWeight: '600' },
});
