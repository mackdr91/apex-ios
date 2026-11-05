/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: List row card displaying a sneaker's thumbnail, brand/model, SKU, size, condition, market value, and QR icon.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Sneaker } from '@/types/sneaker';
import { formatCurrency } from '@/utils/format';

const FALLBACK_SNEAKER_IMG = require('../../../assets/images/sneakers/sneaker_1.jpg');

export interface SneakerCardProps {
  sneaker: Sneaker;
  onPress: (sneaker: Sneaker) => void;
}

const STATUS_DOT: Record<Sneaker['status'], { color: string; label: string }> = {
  in_stock: { color: '#30D158', label: 'In Vault' },
  reserved: { color: '#BF5AF2', label: 'Reserved' },
  sold: { color: '#FF9F0A', label: 'Sold' },
};

export function SneakerCard({ sneaker, onPress }: SneakerCardProps) {
  const statusMeta = STATUS_DOT[sneaker.status];
  const imageSource = sneaker.imageData ? { uri: sneaker.imageData } : FALLBACK_SNEAKER_IMG;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={() => onPress(sneaker)}
      style={styles.card}
    >
      <Image source={imageSource} style={styles.thumbnail} resizeMode="cover" />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.brand} numberOfLines={1}>
            {sneaker.brand.toUpperCase()}
          </Text>
          <View style={styles.statusChip}>
            <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
            <Text style={styles.statusText}>{statusMeta.label}</Text>
          </View>
        </View>

        <Text style={styles.model} numberOfLines={1}>
          {sneaker.model}
        </Text>

        {sneaker.colorway ? (
          <Text style={styles.colorway} numberOfLines={1}>
            {sneaker.colorway}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>US {sneaker.size}</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{sneaker.condition}</Text>
          </View>
          <Text style={styles.skuText} numberOfLines={1}>
            {sneaker.sku}
          </Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text style={styles.valueText}>{formatCurrency(sneaker.marketValue)}</Text>
        <View style={styles.qrBadge}>
          <Ionicons name="qr-code-outline" size={16} color="#FFFFFF" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 22, 0.86)',
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 12,
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: '#1C1C1E',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: 'rgba(255, 255, 255, 0.55)',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  model: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  colorway: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skuText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.45)',
    flexShrink: 1,
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 64,
    paddingVertical: 2,
  },
  valueText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  qrBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
