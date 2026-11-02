/**
 * Author: Domonick Mack
 * Date: 2026-11-02
 * Description: Home screen with Apple-inspired black gradient and frosted glass widget canvas.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Spacing, BottomTabInset } from '@/constants/theme';
import { GlassWidget } from '@/components/hig/GlassWidget';

export default function HomeScreen() {
  return (
    <View style={styles.rootContainer}>
      <StatusBar style="light" />

      {/* Background Black Gradient */}
      <LinearGradient
        colors={['#1c1c1e', '#0f0f11', '#000000']}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

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
            <Text style={styles.title}>Home</Text>
          </View>

          <View style={styles.content}>
            {/* Empty Frosted Glass Widget */}
            <GlassWidget height={190} />
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
    marginBottom: Spacing.four,
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
    paddingTop: Spacing.two,
  },
});
