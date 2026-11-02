/**
 * Author: Domonick Mack
 * Date: 2026-11-02
 * Description: Apple Human Interface Guidelines grouped card container with dynamic light/dark theming and subtle border.
 */

import React from 'react';
import { View, StyleSheet, ViewProps, useColorScheme } from 'react-native';
import { AppleHIGColors, BorderRadius, Spacing } from '@/constants/theme';

export interface HIGCardProps extends ViewProps {
  children: React.ReactNode;
}

export function HIGCard({ children, style, ...rest }: HIGCardProps) {
  const scheme = useColorScheme();
  const theme = AppleHIGColors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.cardBorder,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    padding: Spacing.three,
    marginVertical: Spacing.two,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});
