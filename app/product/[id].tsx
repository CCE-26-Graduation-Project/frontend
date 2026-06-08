import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Image,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';
import { ProductPlaceholder } from '../../components/ProductPlaceholder';
import type { ProductTone } from '../../constants/data';
import { useFavourites } from '../../contexts/FavouritesContext';

const { width: SW } = Dimensions.get('window');
const OUTER_PAD  = 14;
const COL_GAP    = 10;
const CONTENT_W  = SW - OUTER_PAD * 2;
const LEFT_COL_W = Math.floor(CONTENT_W * 0.44);
const RIGHT_COL_W = CONTENT_W - LEFT_COL_W - COL_GAP;
const IMG_HEIGHT  = Math.round(LEFT_COL_W * 1.32);

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    price: string;
    store: string;
    storeLogo: string;
    category: string;
    imageUrl: string;
    productUrl: string;
    oldPrice: string;
    discountPct: string;
  }>();

  const { toggleFavourite, isFavourite } = useFavourites();
  const saveScaleAnim = useRef(new Animated.Value(1)).current;
  const captionAnim   = useRef(new Animated.Value(0)).current;
  const captionTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const id          = params.id ?? '';
  const name        = params.name ?? 'Product';
  const price       = params.price ?? '';
  const store       = params.store ?? '';
  const storeLogo   = params.storeLogo ?? store.charAt(0).toUpperCase();
  const category    = params.category ?? '';
  const imageUrl    = params.imageUrl ?? '';
  const productUrl  = params.productUrl ?? '';
  const oldPrice    = params.oldPrice ?? '';
  const discountPct = params.discountPct ? parseInt(params.discountPct, 10) : null;

  const saved = isFavourite(id);

  // Derive a stable tone from the id for the placeholder fallback
  const TONES: ProductTone[] = ['accent', 'warm', 'dark', 'character'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % TONES.length;
  const tone = TONES[hash];

  function handleSave() {
    const product = { id, name, store, storeLogo, price, imageUrl: imageUrl || undefined,
      category: category || undefined, productUrl: productUrl || undefined, tone, saved: !saved };
    toggleFavourite(product);
    if (!saved) {
      Animated.sequence([
        Animated.spring(saveScaleAnim, { toValue: 1.22, useNativeDriver: true, tension: 300, friction: 5 }),
        Animated.spring(saveScaleAnim, { toValue: 1,    useNativeDriver: true, tension: 200, friction: 8 }),
      ]).start();
      if (captionTimer.current) clearTimeout(captionTimer.current);
      Animated.timing(captionAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      captionTimer.current = setTimeout(() => {
        Animated.timing(captionAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start();
      }, 2200);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      if (captionTimer.current) clearTimeout(captionTimer.current);
      captionAnim.setValue(0);
    }
  }

  function handleGoToStore() {
    if (productUrl) Linking.openURL(productUrl);
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg1 }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={20} color={theme.colors.text1} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>

          {/* Left column — product image */}
          <View style={styles.leftCol}>
            <View style={styles.imageWrap}>
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: LEFT_COL_W, height: IMG_HEIGHT }}
                  resizeMode="cover"
                />
              ) : (
                <ProductPlaceholder tone={tone} height={IMG_HEIGHT} borderRadius={0} />
              )}
            </View>
          </View>

          {/* Right column — product info */}
          <View style={styles.rightCol}>

            <Text style={styles.productName} numberOfLines={4}>{name}</Text>

            {category ? (
              <View style={styles.catChip}>
                <Text style={styles.catChipText}>{category.toUpperCase()}</Text>
              </View>
            ) : null}

            <View style={styles.storeRow}>
              <View style={styles.storeLogo}>
                <Text style={styles.storeLogoText}>{storeLogo}</Text>
              </View>
              <Text style={styles.storeName} numberOfLines={1}>{store}</Text>
            </View>

            <View style={styles.priceBlock}>
              <Text style={styles.price}>{price}</Text>
              {oldPrice ? (
                <View style={styles.priceRow}>
                  <Text style={styles.oldPrice}>{oldPrice}</Text>
                  {discountPct != null && (
                    <View style={styles.discBadge}>
                      <Text style={styles.discText}>−{discountPct}%</Text>
                    </View>
                  )}
                </View>
              ) : null}
            </View>

            <View style={styles.divider} />

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <Pressable
                style={[styles.gotoBtn, !productUrl && styles.gotoBtnDisabled]}
                onPress={handleGoToStore}
              >
                <Text style={styles.gotoBtnText}>Go to store</Text>
                <Feather name="arrow-right" size={12} color="#fff" />
              </Pressable>

              <Animated.View style={{ transform: [{ scale: saveScaleAnim }] }}>
                <Pressable style={[styles.saveBtn, saved && styles.saveBtnActive]} onPress={handleSave}>
                  <MaterialCommunityIcons
                    name={saved ? 'heart' : 'heart-outline'}
                    size={18}
                    color={saved ? theme.colors.text1 : theme.colors.text2}
                  />
                </Pressable>
              </Animated.View>
            </View>

            <Animated.Text
              style={[styles.savedCaption, { opacity: captionAnim }]}
            >
              Added to favourites
            </Animated.Text>

          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { paddingHorizontal: OUTER_PAD, paddingBottom: 6, zIndex: 5 },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.rest,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: OUTER_PAD,
    paddingTop: 2,
    gap: COL_GAP,
    alignItems: 'flex-start',
  },
  leftCol:  { width: LEFT_COL_W },
  rightCol: { width: RIGHT_COL_W, paddingTop: 2 },
  imageWrap: {
    width: LEFT_COL_W,
    height: IMG_HEIGHT,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    backgroundColor: theme.colors.bg2,
    ...theme.shadows.rest,
  },
  catChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 5, backgroundColor: theme.colors.text1,
    marginBottom: 10,
  },
  catChipText: { fontSize: 9, fontWeight: '700', color: theme.colors.surface, letterSpacing: 0.6 },
  productName: {
    fontSize: 17, fontWeight: '700', color: theme.colors.text1,
    letterSpacing: -0.3, lineHeight: 22, marginBottom: 8,
  },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  storeLogo: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center', alignItems: 'center',
    ...theme.shadows.rest,
  },
  storeLogoText: { fontSize: 9, fontWeight: '800', color: theme.colors.text1 },
  storeName: { fontSize: 12, color: theme.colors.text2, flex: 1 },
  priceBlock: { gap: 3, marginBottom: 10 },
  price: {
    fontFamily: 'monospace', fontSize: 21, fontWeight: '700',
    color: theme.colors.savings, letterSpacing: -0.4,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  oldPrice: {
    fontFamily: 'monospace', fontSize: 12,
    color: theme.colors.text2, textDecorationLine: 'line-through',
  },
  discBadge: {
    paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: 4, backgroundColor: theme.colors.savingsSoft,
  },
  discText: { fontSize: 10, fontWeight: '700', color: theme.colors.savings },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.divider,
    marginVertical: 10,
  },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4, alignItems: 'center' },
  gotoBtn: {
    flex: 1, height: 44,
    backgroundColor: theme.colors.text1,
    borderRadius: theme.radius.pill,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    ...theme.shadows.card,
  },
  gotoBtnDisabled: { opacity: 0.45 },
  gotoBtnText: { fontSize: 13, fontWeight: '600', color: '#fff', letterSpacing: -0.1 },
  saveBtn: {
    width: 44, height: 44, borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: theme.colors.divider,
  },
  saveBtnActive: { backgroundColor: '#FFEBCC', borderColor: '#FFEBCC' },
  savedCaption: {
    fontSize: 11, fontWeight: '600', color: theme.colors.savings,
    marginTop: 8, textAlign: 'center',
  },
});
