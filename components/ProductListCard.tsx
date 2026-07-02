import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ProductPlaceholder } from './ProductPlaceholder';
import { VendorLogo } from './VendorLogo';
import { theme } from '../constants/theme';
import type { ListProduct } from '../constants/data';

interface Props {
  product: ListProduct;
  onPress?: () => void;
}

export function ProductListCard({ product, onPress }: Props) {
  const { name, specs, priceRange, topStores, stores, tone } = product;
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.thumbnail}>
        <ProductPlaceholder tone={tone} height={80} borderRadius={12} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        <Text style={styles.specs} numberOfLines={1}>{specs}</Text>
        <Text style={styles.price}>{priceRange}</Text>
        <View style={styles.storeRow}>
          {topStores.map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <View style={styles.dot} />}
              <VendorLogo vendorName={s} size={13} borderRadius={3} />
              <Text style={styles.storeText} numberOfLines={1}>{s}</Text>
            </React.Fragment>
          ))}
        </View>
      </View>
      <View style={styles.storesBadge}>
        <Text style={styles.storesBadgeText}>{stores}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...theme.shadows.card,
  },
  thumbnail: {
    width: 80,
    borderRadius: 12,
    overflow: 'hidden',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text1,
    letterSpacing: -0.12,
    lineHeight: 20,
  },
  specs: {
    fontSize: 13,
    color: theme.colors.text2,
  },
  price: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.savings,
    letterSpacing: -0.05,
    marginTop: 4,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.text2,
    opacity: 0.5,
  },
  storeText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text2,
  },
  storesBadge: {
    backgroundColor: theme.colors.bg2,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    flexShrink: 0,
  },
  storesBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text2,
  },
});
