/**
 * Author: Domonick Mack
 * Date: 2026-11-02
 * Description: Diagnostics and environment configuration screen for Apex iOS developer tools.
 */

import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppleHIGColors, Spacing, BottomTabInset } from '@/constants/theme';
import { HIGCard } from '@/components/hig/HIGCard';

export default function ExploreScreen() {
  const scheme = useColorScheme();
  const theme = AppleHIGColors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.systemGroupedBackground }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: BottomTabInset + Spacing.four },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: theme.systemIndigo }]}>
            ENVIRONMENT & DIAGNOSTICS
          </Text>
          <Text style={[styles.title, { color: theme.label }]}>Developer Guide</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryLabel }]}>
            Tooling status, commands, and local development configurations
          </Text>
        </View>

        {/* Quick Commands Card */}
        <HIGCard>
          <View style={styles.cardHeaderLeft}>
            <Ionicons
              name="terminal-outline"
              size={22}
              color={theme.systemBlue}
              style={styles.cardIcon}
            />
            <Text style={[styles.cardTitle, { color: theme.label }]}>
              Docker Commands
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.separator }]} />

          <View style={styles.codeBlock}>
            <Text style={[styles.commandLabel, { color: theme.secondaryLabel }]}>
              Start backend & database:
            </Text>
            <Text style={[styles.commandText, { color: theme.label }]}>
              docker compose up -d
            </Text>
          </View>

          <View style={styles.codeBlock}>
            <Text style={[styles.commandLabel, { color: theme.secondaryLabel }]}>
              View container logs:
            </Text>
            <Text style={[styles.commandText, { color: theme.label }]}>
              docker compose logs -f backend-api
            </Text>
          </View>

          <View style={styles.codeBlock}>
            <Text style={[styles.commandLabel, { color: theme.secondaryLabel }]}>
              Stop services:
            </Text>
            <Text style={[styles.commandText, { color: theme.label }]}>
              docker compose down
            </Text>
          </View>
        </HIGCard>

        {/* iOS Simulator & Platform Info */}
        <HIGCard>
          <View style={styles.cardHeaderLeft}>
            <Ionicons
              name="phone-portrait-outline"
              size={22}
              color={theme.systemGreen}
              style={styles.cardIcon}
            />
            <Text style={[styles.cardTitle, { color: theme.label }]}>
              Client Platform Details
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.separator }]} />

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.secondaryLabel }]}>
              Platform OS
            </Text>
            <Text style={[styles.rowValue, { color: theme.label }]}>
              {Platform.OS.toUpperCase()} (v{Platform.Version})
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.secondaryLabel }]}>
              Design System
            </Text>
            <Text style={[styles.rowValue, { color: theme.label }]}>
              Apple HIG / NativeWind
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.secondaryLabel }]}>
              Active Color Scheme
            </Text>
            <Text style={[styles.rowValue, { color: theme.label }]}>
              {scheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>
        </HIGCard>

        {/* Repository & Attribution Card */}
        <HIGCard>
          <View style={styles.cardHeaderLeft}>
            <Ionicons
              name="git-branch-outline"
              size={22}
              color={theme.systemOrange}
              style={styles.cardIcon}
            />
            <Text style={[styles.cardTitle, { color: theme.label }]}>
              Repository Info
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.separator }]} />

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.secondaryLabel }]}>
              Remote Repository
            </Text>
            <Text style={[styles.rowValue, { color: theme.systemBlue }]}>
              mackdr91/apex-ios
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.secondaryLabel }]}>
              Author
            </Text>
            <Text style={[styles.rowValue, { color: theme.label }]}>
              Domonick Mack
            </Text>
          </View>
        </HIGCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  header: {
    marginBottom: Spacing.three,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.half,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: Spacing.half,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  cardIcon: {
    marginRight: Spacing.two,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.two,
  },
  codeBlock: {
    marginVertical: Spacing.one,
    padding: Spacing.two,
    backgroundColor: 'rgba(120, 120, 128, 0.08)',
    borderRadius: 8,
  },
  commandLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: Spacing.half,
  },
  commandText: {
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.one,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
