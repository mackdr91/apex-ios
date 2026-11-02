/**
 * Author: Domonick Mack
 * Date: 2026-11-02
 * Description: Apple HIG interactive button component with primary, tinted, and destructive variants.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
  TouchableOpacityProps,
} from 'react-native';
import { AppleHIGColors, BorderRadius, Spacing } from '@/constants/theme';

export interface HIGButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'tinted' | 'destructive';
  isLoading?: boolean;
}

export function HIGButton({
  title,
  variant = 'primary',
  isLoading = false,
  style,
  disabled,
  ...rest
}: HIGButtonProps) {
  const scheme = useColorScheme();
  const theme = AppleHIGColors[scheme === 'dark' ? 'dark' : 'light'];

  const getVariantStyles = () => {
    switch (variant) {
      case 'tinted':
        return {
          container: {
            backgroundColor: scheme === 'dark' ? 'rgba(10, 132, 255, 0.15)' : 'rgba(0, 122, 255, 0.12)',
          },
          text: {
            color: theme.systemBlue,
          },
        };
      case 'destructive':
        return {
          container: {
            backgroundColor: theme.systemRed,
          },
          text: {
            color: '#FFFFFF',
          },
        };
      case 'primary':
      default:
        return {
          container: {
            backgroundColor: theme.systemBlue,
          },
          text: {
            color: '#FFFFFF',
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || isLoading}
      style={[
        styles.button,
        variantStyles.container,
        disabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'tinted' ? theme.systemBlue : '#FFFFFF'}
        />
      ) : (
        <Text style={[styles.text, variantStyles.text]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 44,
    borderRadius: BorderRadius.button,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginVertical: Spacing.one,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  disabled: {
    opacity: 0.5,
  },
});
