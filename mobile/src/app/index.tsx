/**
 * Author: Domonick Mack
 * Date: 2026-11-04
 * Description: Primary home screen switching between Editorial Hero mode and Inventory Dashboard over the sneaker slideshow background.
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BottomTabInset, BorderRadius } from '@/constants/theme';
import { SneakerSlideshow } from '@/components/home/SneakerSlideshow';
import { EditorialHeroOverlay } from '@/components/home/EditorialHeroOverlay';
import { GlassWidget } from '@/components/hig/GlassWidget';
import { ClearWidget } from '@/components/hig/ClearWidget';

export default function HomeScreen() {
  const [activeView, setActiveView] = useState<'hero' | 'dashboard'>('hero');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const switchToDashboard = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setActiveView('dashboard');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const switchToHero = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setActiveView('hero');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar style="light" />

      {/* Auto-Advancing Sneaker Photography Slideshow Background */}
      <SneakerSlideshow intervalMs={4500} fadeDurationMs={1200} />

      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        {activeView === 'hero' ? (
          <EditorialHeroOverlay onEnterVault={switchToDashboard} />
        ) : (
          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <View
              style={[
                styles.container,
                {
                  paddingBottom: BottomTabInset + Spacing.four,
                },
              ]}
            >
              {/* Dashboard Navigation Bar */}
              <View style={styles.dashboardHeader}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={switchToHero}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.dashboardTitle}>My Inventory</Text>
                <View style={styles.placeholderButton} />
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
        )}
      </Animated.View>
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
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: '#FFFFFF',
  },
  placeholderButton: {
    width: 38,
    height: 38,
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
