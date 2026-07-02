import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { ProductPlaceholder } from './ProductPlaceholder';
import { VendorLogo } from './VendorLogo';
import { theme } from '../constants/theme';
import type { Product } from '../constants/data';

interface Props {
  product: Product;
  onPress?: () => void;
}

export function TrendingCard({ product, onPress }: Props) {
  const { name, store, tone, imageUrls } = product;
  const primaryImage = imageUrls?.[0];
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrapper}>
        {primaryImage ? (
          <Image source={{ uri: primaryImage }} style={styles.image} resizeMode="cover" />
        ) : (
          <ProductPlaceholder tone={tone} height={100} borderRadius={12} />
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>{name}</Text>
      <View style={styles.vendorRow}>
        <VendorLogo vendorName={store} size={14} borderRadius={3} />
        <Text style={styles.vendor} numberOfLines={1}>{store}</Text>
      </View>
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
  image: {
    width: 140,
    height: 100,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text1,
    letterSpacing: -0.12,
    lineHeight: 17,
    minHeight: 34,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  vendor: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.text2,
  },
});
