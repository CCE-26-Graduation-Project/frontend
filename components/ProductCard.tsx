import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ProductPlaceholder } from './ProductPlaceholder';
import { Icon } from './Icon';
import { theme } from '../constants/theme';
import type { Product } from '../constants/data';

interface Props {
  product: Product;
  onPress?: () => void;
}

export function ProductCard({ product, onPress }: Props) {
  const [saved, setSaved] = useState(product.saved ?? false);
  const { name, store, storeLogo, price, oldPrice, discountPct, tone } = product;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrapper}>
        <ProductPlaceholder tone={tone} height={140} borderRadius={0} />

        {discountPct !== undefined && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>−{discountPct}%</Text>
          </View>
        )}

        {/* Add to compare */}
        <Pressable
          style={styles.addBtn}
          hitSlop={8}
          onPress={(e) => e.stopPropagation?.()}
        >
          <Icon name="plus" size={16} color={theme.colors.surface} />
        </Pressable>

        {/* Bookmark */}
        <Pressable
          style={[styles.bookmarkBtn, saved && styles.bookmarkSaved]}
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation?.();
            setSaved((s) => !s);
          }}
        >
          <Icon
            name="bookmark"
            size={16}
            color={saved ? theme.colors.surface : theme.colors.text1}
          />
        </Pressable>
      </View>

      <View style={styles.info}>
        <View style={styles.storeRow}>
          <View style={styles.storeLogo}>
            <Text style={styles.storeLogoText}>{storeLogo}</Text>
          </View>
          <Text style={styles.storeName} numberOfLines={1}>{store}</Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>{name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{price}</Text>
          {oldPrice && <Text style={styles.oldPrice}>{oldPrice}</Text>}
          {discountPct !== undefined && (
            <Text style={styles.savingsLabel}>−{discountPct}%</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  imageWrapper: {
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    height: 24,
    paddingHorizontal: 9,
    borderRadius: theme.radius.chip,
    backgroundColor: theme.colors.savings,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.05,
  },
  addBtn: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.text1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E2B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.30,
    shadowRadius: 6,
    elevation: 4,
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,249,210,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E2B4D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 2,
  },
  bookmarkSaved: {
    backgroundColor: theme.colors.text1,
  },
  info: {
    padding: 12,
    paddingTop: 10,
    gap: 6,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeLogo: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: theme.colors.bg2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeLogoText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.text1,
  },
  storeName: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text2,
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text1,
    letterSpacing: -0.12,
    lineHeight: 20,
    minHeight: 40,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 2,
  },
  price: {
    fontFamily: 'monospace',
    fontSize: 19,
    fontWeight: '600',
    color: theme.colors.savings,
    letterSpacing: -0.05,
  },
  oldPrice: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: theme.colors.text2,
    textDecorationLine: 'line-through',
  },
  savingsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.savings,
  },
});
