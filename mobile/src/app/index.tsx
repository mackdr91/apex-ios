/**
 * Author: Domonick Mack
 * Date: 2026-11-02
 * Description: Clean baseline home screen for Apex iOS application development.
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppleHIGColors, Spacing, BottomTabInset } from '@/constants/theme';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const theme = AppleHIGColors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.systemBackground }]}
      edges={['top', 'left', 'right']}
    >
      <View
        style={[
          styles.container,
          {
            paddingBottom: BottomTabInset + Spacing.four,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.label }]}>Home</Text>
        </View>

        <View style={styles.content}>
          {/* Clean canvas area ready for feature implementation */}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  header: {
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
