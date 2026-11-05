/**
 * Author: Domonick Mack
 * Date: 2026-11-04
 * Description: Background cross-fade slideshow engine with smooth opacity transitions and editorial gradient vignette.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SNEAKER_SLIDES: ImageSourcePropType[] = [
  require('@/assets/images/sneakers/sneaker_1.jpg'),
  require('@/assets/images/sneakers/sneaker_2.jpg'),
  require('@/assets/images/sneakers/sneaker_3.jpg'),
];

export interface SneakerSlideshowProps {
  intervalMs?: number;
  fadeDurationMs?: number;
  overlayOpacity?: number;
}

export function SneakerSlideshow({
  intervalMs = 4500,
  fadeDurationMs = 1200,
  overlayOpacity = 0.65,
}: SneakerSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const zoomAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;

    const timer = setInterval(() => {
      if (!isMounted) return;

      const upcoming = (currentIndex + 1) % SNEAKER_SLIDES.length;
      setNextIndex(upcoming);

      // Reset zoom for smooth slow subtle push-in
      zoomAnim.setValue(1);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: fadeDurationMs,
          useNativeDriver: true,
        }),
        Animated.timing(zoomAnim, {
          toValue: 1.04,
          duration: intervalMs,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!isMounted) return;
        setCurrentIndex(upcoming);
        fadeAnim.setValue(0);
      });
    }, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [currentIndex, fadeAnim, zoomAnim, intervalMs, fadeDurationMs]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Current Base Slide */}
      <Animated.Image
        source={SNEAKER_SLIDES[currentIndex]}
        resizeMode="cover"
        style={[
          StyleSheet.absoluteFill,
          styles.image,
          {
            transform: [{ scale: zoomAnim }],
          },
        ]}
      />

      {/* Next Incoming Slide (Fading In) */}
      <Animated.Image
        source={SNEAKER_SLIDES[nextIndex]}
        resizeMode="cover"
        style={[
          StyleSheet.absoluteFill,
          styles.image,
          {
            opacity: fadeAnim,
          },
        ]}
      />

      {/* Editorial Gradient Vignette for Maximum Contrast & Readability */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0.45)',
          'rgba(0, 0, 0, 0.25)',
          'rgba(0, 0, 0, 0.75)',
          'rgba(0, 0, 0, 0.95)',
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Secondary Tint Wash to Harmonize Palette */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity * 0.35})`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
