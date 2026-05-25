import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ProductPlaceholder } from '../../components/ProductPlaceholder';
import { Icon } from '../../components/Icon';
import { theme } from '../../constants/theme';
import { PRODUCT_DETAIL, COMPARISON_ITEMS } from '../../constants/data';

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const product = PRODUCT_DETAIL;

  function openSheet() {
    setSheetVisible(true);
    Animated.spring(sheetAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }).start();
  }

  function closeSheet() {
    Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start(() =>
      setSheetVisible(false)
    );
  }

  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg1 }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.topBtn, { backgroundColor: 'rgba(255,249,210,0.85)' }]}
            hitSlop={8}
          >
            <Feather name="arrow-left" size={22} color={theme.colors.text1} />
          </Pressable>
          <View style={{ flex: 1 }} />
          <Text style={styles.pageCount}>12 of 2,340</Text>
          <Pressable
            onPress={() => setSaved((s) => !s)}
            style={[styles.topBtn, { backgroundColor: saved ? theme.colors.text1 : 'rgba(255,249,210,0.85)' }]}
            hitSlop={8}
          >
            <Feather
              name="bookmark"
              size={18}
              color={saved ? theme.colors.surface : theme.colors.text1}
            />
          </Pressable>
        </View>

        {/* Product image */}
        <View style={styles.imageWrapper}>
          <ProductPlaceholder tone={product.tone} height={300} borderRadius={20} />
          {/* Image dots */}
          <View style={styles.imageDots}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[styles.imageDot, i === 0 ? styles.imageDotActive : styles.imageDotInactive]}
              />
            ))}
          </View>
        </View>

        {/* Info block */}
        <View style={styles.infoBlock}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{product.category}</Text>
          </View>
          <Text style={styles.productName}>{product.name}</Text>

          {/* Store row */}
          <View style={styles.storeRow}>
            <View style={styles.storeLogoBox}>
              <Text style={styles.storeLogoText}>{product.storeLogo}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>{product.store}</Text>
              <View style={styles.verifiedRow}>
                <Icon name="check" size={11} color={theme.colors.savings} />
                <Text style={styles.verifiedText}>Verified store</Text>
              </View>
            </View>
            <Icon name="globe" size={16} color={theme.colors.text2} />
          </View>

          {/* Price */}
          <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>{product.store} price</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{product.price}</Text>
              <Text style={styles.oldPrice}>{product.oldPrice}</Text>
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsBadgeText}>−{product.discountPct}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Specs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specsTable}>
            {product.specs.map(([key, val], i) => (
              <View
                key={key}
                style={[styles.specRow, i % 2 === 0 ? styles.specRowShaded : null]}
              >
                <Text style={styles.specKey}>{key}</Text>
                <Text style={styles.specVal}>{val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Go to store */}
        <View style={styles.section}>
          <Pressable style={styles.primaryBtn} onPress={() => {}}>
            <Text style={styles.primaryBtnText}>Go to {product.store}</Text>
            <View style={styles.primaryBtnArrow}>
              <Feather name="arrow-right" size={14} color="#fff" />
            </View>
          </Pressable>
          <Text style={styles.externalHint}>Opens the official {product.store} website</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this product</Text>
          <Text style={styles.description}>{product.description}</Text>
          <Pressable hitSlop={8}>
            <Text style={styles.showMore}>Show more</Text>
          </Pressable>
        </View>

        {/* Compare button */}
        <View style={[styles.section, { alignItems: 'center' }]}>
          <Pressable style={styles.compareBtn} onPress={openSheet}>
            <Feather name="bar-chart-2" size={18} color={theme.colors.white} />
            <Text style={styles.compareBtnText}>Compare prices</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Comparison sheet modal */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="none"
        onRequestClose={closeSheet}
      >
        <Pressable style={styles.scrim} onPress={closeSheet} />
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Comparison</Text>
            <Pressable onPress={closeSheet} hitSlop={8}>
              <Text style={styles.clearAll}>Clear all</Text>
            </Pressable>
          </View>
          <View style={styles.sheetItems}>
            {COMPARISON_ITEMS.map((item) => (
              <View
                key={item.id}
                style={[styles.compareRow, item.lowest && styles.compareRowLowest]}
              >
                <View style={styles.compareThumbnail}>
                  <ProductPlaceholder tone={item.tone} height={48} borderRadius={10} />
                </View>
                <View style={styles.compareInfo}>
                  <Text style={styles.compareItemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.compareItemStore}>{item.store}</Text>
                </View>
                <View style={styles.comparePriceCol}>
                  <Text
                    style={[styles.comparePrice, { color: item.lowest ? theme.colors.savings : theme.colors.text1, fontWeight: item.lowest ? '600' : '400' }]}
                  >
                    {item.price}
                  </Text>
                  {item.lowest && (
                    <Text style={styles.lowestLabel}>LOWEST</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    paddingHorizontal: theme.spacing.s4,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
    zIndex: 5,
  },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E2B4D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 2,
  },
  pageCount: {
    fontSize: 12,
    color: theme.colors.text2,
  },
  imageWrapper: {
    marginHorizontal: theme.spacing.s4,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageDots: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  imageDot: {
    height: 6,
    borderRadius: 3,
  },
  imageDotActive: {
    width: 18,
    backgroundColor: theme.colors.text1,
  },
  imageDotInactive: {
    width: 6,
    backgroundColor: 'rgba(30,43,77,0.20)',
  },
  infoBlock: {
    paddingHorizontal: theme.spacing.s5,
    paddingBottom: 12,
    gap: 10,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.text1,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.surface,
    lineHeight: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.compact,
    backgroundColor: theme.colors.bg2,
  },
  storeLogoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.rest,
  },
  storeLogoText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text1,
  },
  storeName: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text1,
    letterSpacing: -0.08,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  verifiedText: {
    fontSize: 12,
    color: theme.colors.text2,
  },
  priceBlock: {
    marginTop: 4,
    gap: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: theme.colors.text2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  price: {
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.savings,
    letterSpacing: -0.05,
  },
  oldPrice: {
    fontFamily: 'monospace',
    fontSize: 15,
    color: theme.colors.text2,
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.savingsSoft,
  },
  savingsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.savings,
  },
  section: {
    paddingHorizontal: theme.spacing.s5,
    paddingTop: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text1,
    letterSpacing: -0.24,
    marginBottom: 8,
  },
  specsTable: {
    borderRadius: theme.radius.compact,
    overflow: 'hidden',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  specRowShaded: {
    backgroundColor: theme.colors.bg2,
  },
  specKey: {
    fontSize: 15,
    color: theme.colors.text2,
  },
  specVal: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text1,
    textAlign: 'right',
    flex: 1,
    paddingLeft: 8,
  },
  primaryBtn: {
    height: 54,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.text1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.08,
  },
  primaryBtnArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  externalHint: {
    fontSize: 12,
    color: theme.colors.text2,
    textAlign: 'center',
    marginTop: 6,
  },
  description: {
    fontSize: 17,
    color: theme.colors.text1,
    lineHeight: 24,
    letterSpacing: -0.08,
  },
  showMore: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text1,
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
    ...theme.shadows.card,
  },
  compareBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.white,
    letterSpacing: -0.08,
  },
  // Sheet
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.bg1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 24,
  },
  sheetHandle: {
    width: 38,
    height: 5,
    borderRadius: 99,
    backgroundColor: theme.colors.divider,
    alignSelf: 'center',
    marginTop: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.s5,
    paddingVertical: 16,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.26,
  },
  clearAll: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text1,
  },
  sheetItems: {
    paddingHorizontal: theme.spacing.s4,
    gap: 8,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.compact,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.divider,
  },
  compareRowLowest: {
    backgroundColor: theme.colors.savingsSoft,
    borderColor: 'rgba(63, 166, 107, 0.30)',
  },
  compareThumbnail: {
    width: 48,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
  },
  compareInfo: {
    flex: 1,
    minWidth: 0,
  },
  compareItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text1,
    letterSpacing: -0.08,
  },
  compareItemStore: {
    fontSize: 12,
    color: theme.colors.text2,
    marginTop: 1,
  },
  comparePriceCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  comparePrice: {
    fontFamily: 'monospace',
    fontSize: 15,
    letterSpacing: -0.05,
  },
  lowestLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.colors.savings,
    letterSpacing: 0.06,
  },
});
