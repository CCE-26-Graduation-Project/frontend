import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import type { ProductTone } from '../constants/data';

// Pre-computed gradient pairs for each tone (peach base + tinted highlight)
const GRADIENTS: Record<ProductTone, [string, string]> = {
  accent: ['#FFEBCC', '#BDD9F0'],
  warm:   ['#FFEBCC', '#FFD0A0'],
  dark:   ['#FFEBCC', '#C4C8D4'],
  character: ['#FFEBCC', '#FFE4EC'],
};

const OBJECT_COLORS: Record<ProductTone, string> = {
  accent: 'rgba(100, 170, 225, 0.65)',
  warm:   'rgba(230, 130, 60, 0.55)',
  dark:   'rgba(50, 65, 100, 0.55)',
  character: 'rgba(220, 100, 140, 0.50)',
};

interface Props {
  tone?: ProductTone;
  height?: number;
  borderRadius?: number;
}

export function ProductPlaceholder({ tone = 'accent', height = 160, borderRadius = 0 }: Props) {
  return (
    <LinearGradient
      colors={GRADIENTS[tone]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[styles.container, { height, borderRadius }]}
    >
      <View style={[styles.object, { backgroundColor: OBJECT_COLORS[tone] }]} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  object: {
    position: 'absolute',
    top: '20%',
    left: '22%',
    right: '22%',
    bottom: '20%',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
});
