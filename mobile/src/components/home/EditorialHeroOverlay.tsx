/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Editorial fashion hero layout serving as the animated ~2.5s loading splash screen and cover view over the sneaker slideshow.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius } from '@/constants/theme';

export interface EditorialHeroOverlayProps {
  onEnterVault: () => void;
  isLoadingSplash?: boolean;
}

export function EditorialHeroOverlay({
  onEnterVault,
  isLoadingSplash = false,
}: EditorialHeroOverlayProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoadingSplash) {
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2400,
        useNativeDriver: false,
      }).start();
    }
  }, [isLoadingSplash, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['8%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Top Utility Bar */}
      <View style={styles.topBar}>
        <View style={styles.statusIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EXCLUSIVE DROP</Text>
        </View>

        {!isLoadingSplash ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onEnterVault}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Vault</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Vertical Brand Typography Along Left Edge */}
      <View style={styles.verticalTextWrapper} pointerEvents="none">
        <Text style={styles.verticalText}>RUNWAY VAULT</Text>
      </View>

      {/* Bottom Editorial Content & Headline */}
      <View style={styles.bottomSection}>
        <View style={styles.headlineBlock}>
          <Text style={styles.headlineWord}>CURATE</Text>
          <View style={styles.starRow}>
            <Text style={styles.starSymbol}>✱</Text>
            <Text style={styles.headlineWord}>YOUR</Text>
          </View>
          <Text style={styles.headlineWord}>COLLECTION</Text>
        </View>

        {isLoadingSplash ? (
          <View style={styles.loadingWrap}>
            <View style={styles.loadingTrack}>
              <Animated.View style={[styles.loadingFill, { width: progressWidth }]} />
            </View>
            <Text style={styles.loadingCaption}>INITIALIZING SNEAKER VAULT...</Text>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onEnterVault}
            style={styles.ctaPill}
          >
            <Text style={styles.ctaText}>RETURN TO VAULT</Text>
            <Ionicons
              name="arrow-forward"
              size={15}
              color="#FFFFFF"
              style={styles.ctaIcon}
            />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#30D158',
    marginRight: Spacing.one,
  },
  liveText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  skipButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  verticalTextWrapper: {
    position: 'absolute',
    left: -48,
    top: '32%',
    transform: [{ rotate: '-90deg' }],
    width: 280,
    zIndex: 5,
  },
  verticalText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 7,
    textTransform: 'uppercase',
  },
  bottomSection: {
    alignItems: 'flex-end',
    width: '100%',
    paddingBottom: Spacing.two,
    zIndex: 10,
  },
  headlineBlock: {
    alignItems: 'flex-end',
    marginBottom: Spacing.three,
  },
  headlineWord: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 34,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  starSymbol: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  loadingWrap: {
    width: 210,
    alignItems: 'flex-end',
    gap: 8,
  },
  loadingTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    overflow: 'hidden',
  },
  loadingFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  loadingCaption: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: Spacing.three + Spacing.half,
    paddingVertical: Spacing.two,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  ctaIcon: {
    marginLeft: Spacing.one + Spacing.half,
  },
});
