/**
 * Author: Domonick Mack
 * Date: 2026-11-02
 * Description: Apple Human Interface Guidelines (HIG) theme tokens, system colors, and typography constants.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const AppleHIGColors = {
  light: {
    systemBackground: '#FFFFFF',
    secondarySystemBackground: '#F2F2F7',
    tertiarySystemBackground: '#FFFFFF',
    systemGroupedBackground: '#F2F2F7',
    secondarySystemGroupedBackground: '#FFFFFF',
    tertiarySystemGroupedBackground: '#F2F2F7',
    label: '#000000',
    secondaryLabel: '#6C6C70',
    tertiaryLabel: '#8E8E93',
    quaternaryLabel: '#C7C7CC',
    separator: '#C6C6C8',
    opaqueSeparator: '#C6C6C8',
    systemBlue: '#007AFF',
    systemGreen: '#34C759',
    systemIndigo: '#5856D6',
    systemOrange: '#FF9500',
    systemPink: '#FF2D55',
    systemPurple: '#AF52DE',
    systemRed: '#FF3B30',
    systemTeal: '#59ADC4',
    systemYellow: '#FFCC00',
    systemGray: '#8E8E93',
    cardBackground: '#FFFFFF',
    cardBorder: 'rgba(60, 60, 67, 0.12)',
  },
  dark: {
    systemBackground: '#000000',
    secondarySystemBackground: '#1C1C1E',
    tertiarySystemBackground: '#2C2C2E',
    systemGroupedBackground: '#000000',
    secondarySystemGroupedBackground: '#1C1C1E',
    tertiarySystemGroupedBackground: '#2C2C2E',
    label: '#FFFFFF',
    secondaryLabel: '#8E8E93',
    tertiaryLabel: '#48484A',
    quaternaryLabel: '#3A3A3C',
    separator: '#38383A',
    opaqueSeparator: '#38383A',
    systemBlue: '#0A84FF',
    systemGreen: '#30D158',
    systemIndigo: '#5E5CE6',
    systemOrange: '#FF9F0A',
    systemPink: '#FF375F',
    systemPurple: '#BF5AF2',
    systemRed: '#FF453A',
    systemTeal: '#70D7EE',
    systemYellow: '#FFD60A',
    systemGray: '#8E8E93',
    cardBackground: '#1C1C1E',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
  },
} as const;

export const Colors = {
  light: {
    text: AppleHIGColors.light.label,
    background: AppleHIGColors.light.systemBackground,
    backgroundElement: AppleHIGColors.light.secondarySystemBackground,
    backgroundSelected: AppleHIGColors.light.tertiarySystemBackground,
    textSecondary: AppleHIGColors.light.secondaryLabel,
  },
  dark: {
    text: AppleHIGColors.dark.label,
    background: AppleHIGColors.dark.systemBackground,
    backgroundElement: AppleHIGColors.dark.secondarySystemBackground,
    backgroundSelected: AppleHIGColors.dark.tertiarySystemBackground,
    textSecondary: AppleHIGColors.dark.secondaryLabel,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BorderRadius = {
  card: 14,
  button: 10,
  pill: 9999,
  tile: 12,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
