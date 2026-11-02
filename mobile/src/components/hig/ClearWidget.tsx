/**
 * Author: Domonick Mack
 * Date: 2026-11-02
 * Description: Reusable Apple HIG clear widget container with transparent background and subtle border.
 */

import React from 'react';
import { View, StyleSheet, ViewProps, StyleProp, ViewStyle } from 'react-native';

export interface ClearWidgetProps extends ViewProps {
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  height?: number;
}

export function ClearWidget({
  children,
  containerStyle,
  height = 155,
  style,
  ...rest
}: ClearWidgetProps) {
  return (
    <View style={[styles.outerContainer, { height }, containerStyle]}>
      <View style={[styles.clearCard, style]} {...rest}>
        <View style={styles.innerCanvas}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  clearCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  innerCanvas: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
