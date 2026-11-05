/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Custom Floating Glass Nebula Pill bottom navigation bar with Home, Vault, and QR Hub tabs.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export type NebulaTabId = 'home' | 'vault' | 'qrhub';

export interface NebulaNavBarProps {
  activeTab: NebulaTabId;
  onSelectTab: (tab: NebulaTabId) => void;
}

interface TabConfig {
  id: NebulaTabId;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabConfig[] = [
  {
    id: 'home',
    label: 'Home',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  {
    id: 'vault',
    label: 'Vault',
    activeIcon: 'cube',
    inactiveIcon: 'cube-outline',
  },
  {
    id: 'qrhub',
    label: 'QR Hub',
    activeIcon: 'qr-code',
    inactiveIcon: 'qr-code-outline',
  },
];

export function NebulaNavBar({ activeTab, onSelectTab }: NebulaNavBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 14);

  return (
    <View style={[styles.outerWrap, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View style={styles.pillShadow}>
        <BlurView intensity={65} tint="dark" style={styles.pillContainer}>
          {/* Subtle Nebula Glass Tint */}
          <LinearGradient
            colors={[
              'rgba(30, 20, 68, 0.72)',
              'rgba(14, 24, 62, 0.78)',
              'rgba(46, 16, 82, 0.72)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.tabsRow}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  activeOpacity={0.82}
                  onPress={() => onSelectTab(tab.id)}
                  style={styles.tabTouch}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={tab.label}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={['#4F46E5', '#7C3AED', '#6D28D9']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.activeTabPill}
                    >
                      <Ionicons name={tab.activeIcon} size={18} color="#FFFFFF" />
                      <Text style={styles.activeTabText}>{tab.label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.inactiveTabPill}>
                      <Ionicons
                        name={tab.inactiveIcon}
                        size={18}
                        color="rgba(255, 255, 255, 0.65)"
                      />
                      <Text style={styles.inactiveTabText}>{tab.label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    position: 'absolute',
    left: 22,
    right: 22,
    alignItems: 'center',
    zIndex: 50,
  },
  pillShadow: {
    width: '100%',
    maxWidth: 370,
    borderRadius: 999,
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.42,
    shadowRadius: 18,
    elevation: 12,
  },
  pillContainer: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.34)',
    padding: 6,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  tabTouch: {
    flex: 1,
  },
  activeTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  inactiveTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  activeTabText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  inactiveTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: -0.2,
  },
});
