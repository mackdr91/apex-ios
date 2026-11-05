/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Printable shoe-box tag card rendering a sneaker's QR code alongside its key identifiers.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type { Sneaker } from '@/types/sneaker';

export interface SneakerQRTagProps {
  sneaker: Pick<Sneaker, 'brand' | 'model' | 'colorway' | 'sku' | 'size' | 'storageLocation' | 'qrCodeData'>;
  qrSize?: number;
}

/** White, high-contrast tag designed to be screenshotted, printed, and taped to a box. */
export function SneakerQRTag({ sneaker, qrSize = 132 }: SneakerQRTagProps) {
  return (
    <View style={styles.tag} collapsable={false}>
      <View style={styles.qrFrame}>
        <QRCode value={sneaker.qrCodeData} size={qrSize} color="#000000" backgroundColor="#FFFFFF" ecl="M" />
      </View>

      <View style={styles.info}>
        <Text style={styles.brand}>{sneaker.brand.toUpperCase()}</Text>
        <Text style={styles.model} numberOfLines={2}>
          {sneaker.model}
        </Text>
        {sneaker.colorway ? (
          <Text style={styles.colorway} numberOfLines={1}>
            {sneaker.colorway}
          </Text>
        ) : null}

        <View style={styles.divider} />

        <TagRow label="SKU" value={sneaker.sku} />
        <TagRow label="SIZE" value={`US ${sneaker.size}`} />
        {sneaker.storageLocation ? <TagRow label="LOC" value={sneaker.storageLocation} /> : null}
      </View>
    </View>
  );
}

function TagRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    gap: 14,
    alignItems: 'center',
  },
  qrFrame: {
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  info: { flex: 1 },
  brand: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: '#8E8E93' },
  model: { fontSize: 18, fontWeight: '800', color: '#000000', letterSpacing: -0.4, marginTop: 2 },
  colorway: { fontSize: 13, color: '#3A3A3C', marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#C6C6C8', marginVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 1.5 },
  rowLabel: { width: 36, fontSize: 10, fontWeight: '800', color: '#8E8E93', letterSpacing: 0.8 },
  rowValue: { flex: 1, fontSize: 13, fontWeight: '700', color: '#000000' },
});
