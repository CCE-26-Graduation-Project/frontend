import React, { useEffect, useRef, useState } from 'react';
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
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';
import { ProductPlaceholder } from '../../components/ProductPlaceholder';
import type { ProductTone } from '../../constants/data';
import { useFavourites } from '../../contexts/FavouritesContext';
import { postJson } from '../../services';

const { width: SW } = Dimensions.get('window');
const GALLERY_HEIGHT = Math.round(SW * 0.72);

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    price: string;
    store: string;
    storeLogo: string;
    category: string;
    imageUrls: string; // JSON.stringify(string[])
    productUrl: string;
    oldPrice: string;
    discountPct: string;
  }>();

  const { toggleFavourite, isFavourite } = useFavourites();
  const saveScaleAnim = useRef(new Animated.Value(1)).current;
  const captionAnim   = useRef(new Animated.Value(0)).current;
  const captionTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const id          = params.id ?? '';
  const name        = params.name ?? 'Product';
  const price       = params.price ?? '';
  const store       = params.store ?? '';
  const storeLogo   = params.storeLogo ?? store.charAt(0).toUpperCase();
  const category    = params.category ?? '';
  const productUrl  = params.productUrl ?? '';
  const oldPrice    = params.oldPrice ?? '';
  const discountPct = params.discountPct ? parseInt(params.discountPct, 10) : null;

  let imageUrls: string[] = [];
  try { imageUrls = JSON.parse(params.imageUrls ?? '[]'); } catch { imageUrls = []; }

  const saved = isFavourite(id);

  useEffect(() => {
    if (!id) return;
    postJson(`/api/public/products/${id}/click`, {}).catch(() => {});
  }, [id]);

  const TONES: ProductTone[] = ['accent', 'warm', 'dark', 'character'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % TONES.length;
  const tone = TONES[hash];

  function handleSave() {
    const product = {
      id, name, store, storeLogo, price,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      category: category || undefined,
      productUrl: productUrl || undefined,
      tone,
      saved: !saved,
    };
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

  function handleGalleryScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / SW);
    setActiveIndex(index);
  }

  const hasImages = imageUrls.length > 0;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg1 }]}>
      {/* Floating back button rendered above the ScrollView */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={20} color={theme.colors.text1} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* ── Image gallery ──────────────────────────────────────────────────── */}
        <View style={styles.galleryWrap}>
          {hasImages ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleGalleryScroll}
              style={styles.galleryScroll}
            >
              {imageUrls.map((uri, idx) => (
                <Image
                  key={idx}
                  source={{ uri }}
                  style={styles.galleryImage}
                  resizeMode="contain"
                />
              ))}
            </ScrollView>
          ) : (
            <ProductPlaceholder tone={tone} height={GALLERY_HEIGHT} borderRadius={0} />
          )}

          {/* Dot indicators — only when there are multiple images */}
          {hasImages && imageUrls.length > 1 && (
            <View style={styles.dotsRow}>
              {imageUrls.map((_, idx) => (
                <View key={idx} style={[styles.dot, idx === activeIndex && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        {/* ── Product info ───────────────────────────────────────────────────── */}
        <View style={styles.infoSection}>
          <Text style={styles.productName} numberOfLines={3}>{name}</Text>

          <View style={styles.metaRow}>
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

          <Animated.Text style={[styles.savedCaption, { opacity: captionAnim }]}>
            Added to favourites
          </Animated.Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingBottom: 6,
    zIndex: 10,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.rest,
  },

  // Gallery
  galleryWrap: {
    width: SW,
    height: GALLERY_HEIGHT,
    backgroundColor: theme.colors.bg2,
  },
  galleryScroll: {
    width: SW,
    height: GALLERY_HEIGHT,
  },
  galleryImage: {
    width: SW,
    height: GALLERY_HEIGHT,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  dotActive: {
    backgroundColor: theme.colors.text1,
    width: 18,
  },

  // Info section
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 0,
  },
  productName: {
    fontSize: 20, fontWeight: '700', color: theme.colors.text1,
    letterSpacing: -0.3, lineHeight: 26, marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  catChip: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, backgroundColor: theme.colors.text1,
  },
  catChipText: { fontSize: 9, fontWeight: '700', color: theme.colors.surface, letterSpacing: 0.6 },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storeLogo: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center', alignItems: 'center',
    ...theme.shadows.rest,
  },
  storeLogoText: { fontSize: 9, fontWeight: '800', color: theme.colors.text1 },
  storeName: { fontSize: 13, color: theme.colors.text2 },
  priceBlock: { gap: 3, marginBottom: 14 },
  price: {
    fontFamily: 'monospace', fontSize: 26, fontWeight: '700',
    color: theme.colors.savings, letterSpacing: -0.4,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  oldPrice: {
    fontFamily: 'monospace', fontSize: 14,
    color: theme.colors.text2, textDecorationLine: 'line-through',
  },
  discBadge: {
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, backgroundColor: theme.colors.savingsSoft,
  },
  discText: { fontSize: 11, fontWeight: '700', color: theme.colors.savings },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.divider,
    marginVertical: 12,
  },
  actionRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  gotoBtn: {
    flex: 1, height: 48,
    backgroundColor: theme.colors.text1,
    borderRadius: theme.radius.pill,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    ...theme.shadows.card,
  },
  gotoBtnDisabled: { opacity: 0.45 },
  gotoBtnText: { fontSize: 15, fontWeight: '600', color: '#fff', letterSpacing: -0.1 },
  saveBtn: {
    width: 48, height: 48, borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: theme.colors.divider,
  },
  saveBtnActive: { backgroundColor: '#FFEBCC', borderColor: '#FFEBCC' },
  savedCaption: {
    fontSize: 12, fontWeight: '600', color: theme.colors.savings,
    marginTop: 10, textAlign: 'center',
  },
});
