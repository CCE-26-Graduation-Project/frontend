import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { ProductPlaceholder } from './ProductPlaceholder';
import { Icon } from './Icon';
import { VendorLogo } from './VendorLogo';
import { theme } from '../constants/theme';
import type { Product } from '../constants/data';
import { useFavourites } from '../contexts/FavouritesContext';

interface Props {
  product: Product;
  onPress?: () => void;
}

function ProductCardInner({ product, onPress }: Props) {
  const { toggleFavourite, isFavourite } = useFavourites();
  const saved = isFavourite(product.id);
  const { name, store, price, oldPrice, discountPct, tone, imageUrl, imageUrls, category } = product;
  const primaryImage = imageUrl ?? imageUrls?.[0];

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrapper}>
        {primaryImage ? (
          <Image source={{ uri: primaryImage }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <ProductPlaceholder tone={tone} height={140} borderRadius={0} />
        )}

        {discountPct !== undefined && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>−{discountPct}%</Text>
          </View>
        )}

        {/* Add to favourites */}
        <Pressable
          style={[styles.addBtn, saved && styles.addBtnSaved]}
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation?.();
            toggleFavourite(product);
          }}
        >
          <Icon name={saved ? 'check' : 'plus'} size={16} color={theme.colors.surface} />
        </Pressable>

      </View>

      <View style={styles.info}>
        <View style={styles.storeRow}>
          <VendorLogo vendorName={store} size={16} borderRadius={4} />
          <Text style={styles.storeName} numberOfLines={1}>{store}</Text>
          {category && (
            <Text style={styles.categoryBadge} numberOfLines={1}>{category}</Text>
          )}
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

// Ignore onPress reference changes — the rendered output only depends on product data
// and the favourites context hook inside, not which handler is passed in.
export const ProductCard = React.memo(ProductCardInner, (prev, next) => prev.product === next.product);

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
  productImage: {
    width: '100%',
    height: 140,
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
  addBtnSaved: {
    backgroundColor: theme.colors.savings,
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
  storeName: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text2,
    flex: 1,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.text2,
    backgroundColor: theme.colors.bg2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
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
