/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Full-screen black, deep blue, and cosmic purple nebula gradient background for the My Sneaker Vault dashboard.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

export function NebulaBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base diagonal deep-space black -> midnight blue -> cosmic purple -> obsidian gradient */}
      <LinearGradient
        colors={['#030307', '#0A1128', '#1D1038', '#0D1E3D', '#040308']}
        locations={[0, 0.28, 0.55, 0.82, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Layered radial nebula glow clouds (purple & electric blue) */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient
            id="purpleNebula"
            cx="80%"
            cy="22%"
            rx="65%"
            ry="42%"
            fx="80%"
            fy="22%"
          >
            <Stop offset="0%" stopColor="#6D28D9" stopOpacity="0.48" />
            <Stop offset="45%" stopColor="#4C1D95" stopOpacity="0.22" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>

          <RadialGradient
            id="blueNebula"
            cx="18%"
            cy="56%"
            rx="68%"
            ry="45%"
            fx="18%"
            fy="56%"
          >
            <Stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.42" />
            <Stop offset="50%" stopColor="#1E3A8A" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>

          <RadialGradient
            id="violetCore"
            cx="62%"
            cy="82%"
            rx="58%"
            ry="38%"
            fx="62%"
            fy="82%"
          >
            <Stop offset="0%" stopColor="#5B21B6" stopOpacity="0.36" />
            <Stop offset="55%" stopColor="#1E1B4B" stopOpacity="0.16" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect x="0" y="0" width="100%" height="100%" fill="url(#purpleNebula)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#blueNebula)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#violetCore)" />
      </Svg>
    </View>
  );
}
