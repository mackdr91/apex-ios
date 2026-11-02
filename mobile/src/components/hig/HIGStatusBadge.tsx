/**
 * Author: Domonick Mack
 * Date: 2026-11-02
 * Description: Apple HIG status indicator pill badge for service health visualization.
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { AppleHIGColors, BorderRadius, Spacing } from '@/constants/theme';

export type StatusLevel = 'online' | 'degraded' | 'offline' | 'loading';

export interface HIGStatusBadgeProps {
  status: StatusLevel;
  label?: string;
}

export function HIGStatusBadge({ status, label }: HIGStatusBadgeProps) {
  const scheme = useColorScheme();
  const theme = AppleHIGColors[scheme === 'dark' ? 'dark' : 'light'];

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          color: theme.systemGreen,
          bg: scheme === 'dark' ? 'rgba(48, 209, 88, 0.2)' : 'rgba(52, 199, 89, 0.15)',
          defaultText: 'Connected',
        };
      case 'degraded':
        return {
          color: theme.systemOrange,
          bg: scheme === 'dark' ? 'rgba(255, 159, 10, 0.2)' : 'rgba(255, 149, 0, 0.15)',
          defaultText: 'Degraded',
        };
      case 'offline':
        return {
          color: theme.systemRed,
          bg: scheme === 'dark' ? 'rgba(255, 69, 58, 0.2)' : 'rgba(255, 59, 48, 0.15)',
          defaultText: 'Disconnected',
        };
      case 'loading':
      default:
        return {
          color: theme.systemBlue,
          bg: scheme === 'dark' ? 'rgba(10, 132, 255, 0.2)' : 'rgba(0, 122, 255, 0.15)',
          defaultText: 'Probing...',
        };
    }
  };

  const config = getStatusConfig();
  const text = label || config.defaultText;

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.pill,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: Spacing.one,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
