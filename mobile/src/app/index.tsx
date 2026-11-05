/**
 * Author: Domonick Mack
 * Date: 2026-11-04
 * Description: Baseline home screen powered by background sneaker cross-fade slideshow with glass and clear widgets.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Spacing, BottomTabInset } from '@/constants/theme';
import { SneakerSlideshow } from '@/components/home/SneakerSlideshow';
import { GlassWidget } from '@/components/hig/GlassWidget';
import { ClearWidget } from '@/components/hig/ClearWidget';

export default function HomeScreen() {
  return (
    <View style={styles.rootContainer}>
      <StatusBar style="light" />

      {/* Auto-Advancing Sneaker Photography Slideshow Background */}
      <SneakerSlideshow intervalMs={4500} fadeDurationMs={1200} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View
          style={[
            styles.container,
            {
              paddingBottom: BottomTabInset + Spacing.four,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.eyebrow}>INVENTORY SHOWCASE</Text>
            <Text style={styles.title}>Home</Text>
          </View>

          <View style={styles.content}>
            {/* Top Large Frosted Glass Widget */}
            <GlassWidget height={190} />

            {/* Dual Side-by-Side Clear Widgets */}
            <View style={styles.dualWidgetRow}>
              <ClearWidget height={160} />
              <ClearWidget height={160} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  header: {
    marginBottom: Spacing.three,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: Spacing.half,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  dualWidgetRow: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
});
