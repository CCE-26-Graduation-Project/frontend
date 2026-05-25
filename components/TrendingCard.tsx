import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ProductPlaceholder } from './ProductPlaceholder';
import { theme } from '../constants/theme';
import type { TrendingProduct } from '../constants/data';

interface Props {
  product: TrendingProduct;
  onPress?: () => void;
}

export function TrendingCard({ product, onPress }: Props) {
  const { name, vendor, tone } = product;
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrapper}>
        <ProductPlaceholder tone={tone} height={100} borderRadius={12} />
      </View>
      <Text style={styles.name} numberOfLines={2}>{name}</Text>
      <Text style={styles.vendor} numberOfLines={1}>{vendor}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    flexShrink: 0,
    gap: 6,
  },
  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text1,
    letterSpacing: -0.12,
    lineHeight: 17,
    minHeight: 34,
  },
  vendor: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.text2,
  },
});
