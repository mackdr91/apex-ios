/**
 * Author: Domonick Mack
 * Date: 2026-11-02
 * Description: Reusable Apple HIG frosted glass widget container with native blur and specular edge highlights.
 */

import React from 'react';
import { View, StyleSheet, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { BlurView, BlurTint } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export interface GlassWidgetProps extends ViewProps {
  children?: React.ReactNode;
  intensity?: number;
  tint?: BlurTint;
  containerStyle?: StyleProp<ViewStyle>;
  height?: number;
}

export function GlassWidget({
  children,
  intensity = 60,
  tint = 'systemUltraThinMaterialDark',
  containerStyle,
  height = 180,
  style,
  ...rest
}: GlassWidgetProps) {
  return (
    <View style={[styles.outerShadowContainer, { height }, containerStyle]}>
      <View style={[styles.glassCard, style]} {...rest}>
        {/* Native Frosted Glass Layer */}
        <BlurView
          intensity={intensity}
          tint={tint}
          style={StyleSheet.absoluteFill}
        />

        {/* Specular Ambient Fill */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Rim Specular Highlight (Simulating Glass Bevel) */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.rimHighlight}
        />

        {/* Widget Content Canvas */}
        <View style={styles.innerCanvas}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerShadowContainer: {
    width: '100%',
    marginVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  glassCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(25, 25, 30, 0.25)',
  },
  rimHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  innerCanvas: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
