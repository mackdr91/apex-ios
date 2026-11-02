/**
 * Author: Domonick Mack
 * Date: 2026-11-02
 * Description: Apple HIG metric card displaying key system metrics (database latency, uptime, memory, services).
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { AppleHIGColors, BorderRadius, Spacing } from '@/constants/theme';

export interface HIGMetricTileProps {
  label: string;
  value: string;
  subtitle?: string;
  accentColor?: string;
}

export function HIGMetricTile({ label, value, subtitle, accentColor }: HIGMetricTileProps) {
  const scheme = useColorScheme();
  const theme = AppleHIGColors[scheme === 'dark' ? 'dark' : 'light'];
  const resolvedAccent = accentColor || theme.systemBlue;

  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: theme.secondarySystemGroupedBackground,
          borderColor: theme.cardBorder,
        },
      ]}
    >
      <Text style={[styles.label, { color: theme.secondaryLabel }]}>{label}</Text>
      <Text style={[styles.value, { color: resolvedAccent }]}>{value}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.tertiaryLabel }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: '45%',
    borderRadius: BorderRadius.tile,
    borderWidth: 1,
    padding: Spacing.three,
    margin: Spacing.one,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.half,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    marginTop: Spacing.half,
    fontWeight: '400',
  },
});
