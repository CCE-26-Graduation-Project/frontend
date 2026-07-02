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
import { FullscreenGallery } from '../../components/FullscreenGallery';
import { VendorLogo } from '../../components/VendorLogo';
import type { ProductTone } from '../../constants/data';
import { useFavourites } from '../../contexts/FavouritesContext';
import { postJson } from '../../services';

const { width: SW } = Dimensions.get('window');
const GALLERY_HEIGHT = Math.round(SW * 0.72);
const BACK_BTN_SIZE = 44;
const TOP_BAR_V_PADDING = 6;

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
    imageUrls: string; // JSON.stringify(string[])
    productUrl: string;
    oldPrice: string;
    discountPct: string;
  }>();

  // Parse all image data first so hooks below can reference allImages
  const id          = params.id ?? '';
  const name        = params.name ?? 'Product';
  const price       = params.price ?? '';
  const store       = params.store ?? '';
  const storeLogo   = params.storeLogo ?? store.charAt(0).toUpperCase();
  const category    = params.category ?? '';
  const productUrl  = params.productUrl ?? '';
  const oldPrice    = params.oldPrice ?? '';
  const discountPct = params.discountPct ? parseInt(params.discountPct, 10) : null;
  const imageUrl    = params.imageUrl ?? '';

  let imageUrls: string[] = [];
  try { imageUrls = JSON.parse(params.imageUrls ?? '[]'); } catch { imageUrls = []; }

  // imageUrl first, then imageUrls — fully deduplicated so key={uri} is always unique
  const _seen = new Set<string>();
  const allImages: string[] = [];
  if (imageUrl) { _seen.add(imageUrl); allImages.push(imageUrl); }
  for (const u of imageUrls) {
    if (u && !_seen.has(u)) { _seen.add(u); allImages.push(u); }
  }

  const { toggleFavourite, isFavourite } = useFavourites();
  const saveScaleAnim = useRef(new Animated.Value(1)).current;
  const captionAnim   = useRef(new Animated.Value(0)).current;
  const captionTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  // Start with the primary image (already cached from search results), then reveal
  // additional images one by one so the user never waits for the gallery to initialize.
  const [visibleImages, setVisibleImages] = useState<string[]>(
    allImages.length > 0 ? [allImages[0]] : []
  );

  useEffect(() => {
    if (allImages.length <= 1) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    allImages.slice(1).forEach((uri, idx) => {
      timers.push(
        setTimeout(() => setVisibleImages(prev => [...prev, uri]), (idx + 1) * 180)
      );
    });
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      imageUrl: imageUrl || undefined,
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
    if (productUrl) Linking.openURL(productUrl).catch(() => {});
  }

  function handleGalleryScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / SW);
    setActiveIndex(index);
  }

  const hasImages = allImages.length > 0;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg1 }]}>
      {/* Floating back button rendered above the ScrollView */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={20} color={theme.colors.text1} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* ── Image gallery ──────────────────────────────────────────────────── */}
        <View
          style={[
            styles.galleryWrap,
            { marginTop: insets.top + TOP_BAR_V_PADDING * 2 + BACK_BTN_SIZE + theme.spacing.s3 },
          ]}
        >
          {hasImages ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleGalleryScroll}
              style={styles.galleryScroll}
            >
              {visibleImages.map((uri, idx) => (
                <Pressable
                  key={uri}
                  onPress={() => { setFullscreenIndex(idx); setFullscreenOpen(true); }}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={`View ${name} photo ${idx + 1} of ${allImages.length} fullscreen`}
                >
                  <Image
                    source={{ uri }}
                    style={styles.galleryImage}
                    resizeMode="contain"
                    fadeDuration={idx === 0 ? 0 : 200}
                    accessibilityLabel={`${name} photo ${idx + 1} of ${allImages.length}`}
                  />
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <ProductPlaceholder tone={tone} height={GALLERY_HEIGHT} borderRadius={0} />
          )}

          {/* Dot indicators — only when there are multiple images */}
          {hasImages && allImages.length > 1 && (
            <View style={styles.dotsRow} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {allImages.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    idx === activeIndex && styles.dotActive,
                    idx >= visibleImages.length && styles.dotPending,
                  ]}
                />
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
              <VendorLogo vendorName={store} size={24} borderRadius={6} style={styles.storeLogo} />
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
              disabled={!productUrl}
              accessibilityRole="button"
              accessibilityLabel="Go to store"
            >
              <Text style={styles.gotoBtnText}>Go to store</Text>
              <Feather name="arrow-right" size={12} color="#fff" />
            </Pressable>

            <Animated.View style={{ transform: [{ scale: saveScaleAnim }] }}>
              <Pressable
                style={[styles.saveBtn, saved && styles.saveBtnActive]}
                onPress={handleSave}
                accessibilityRole="button"
                accessibilityLabel={saved ? 'Remove from favourites' : 'Add to favourites'}
              >
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

      <FullscreenGallery
        visible={fullscreenOpen}
        images={allImages}
        initialIndex={fullscreenIndex}
        onClose={() => setFullscreenOpen(false)}
      />
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
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.rest,
  },

  // Gallery
  galleryWrap: {
    width: SW,
    height: GALLERY_HEIGHT,
    backgroundColor: theme.colors.bg1,
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
  dotPending: {
    opacity: 0.25,
  },

  // Info section
  infoSection: {
    paddingHorizontal: theme.spacing.s4,
    paddingTop: theme.spacing.s4,
    gap: 0,
  },
  productName: {
    fontSize: 20, fontWeight: '700', color: theme.colors.text1,
    letterSpacing: -0.3, lineHeight: 26, marginBottom: theme.spacing.s3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
    marginBottom: theme.spacing.s4,
    flexWrap: 'wrap',
  },
  catChip: {
    paddingHorizontal: theme.spacing.s2, paddingVertical: theme.spacing.s1,
    borderRadius: 6, backgroundColor: theme.colors.text1,
  },
  catChipText: { fontSize: 9, fontWeight: '700', color: theme.colors.surface, letterSpacing: 0.6 },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s1 + 2 },
  storeLogo: {
    ...theme.shadows.rest,
  },
  storeName: { fontSize: 13, color: theme.colors.text2 },
  priceBlock: { gap: theme.spacing.s1, marginBottom: theme.spacing.s4 },
  price: {
    fontFamily: 'monospace', fontSize: 26, fontWeight: '700',
    color: theme.colors.savings, letterSpacing: -0.4,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s2 },
  oldPrice: {
    fontFamily: 'monospace', fontSize: 14,
    color: theme.colors.text2, textDecorationLine: 'line-through',
  },
  discBadge: {
    paddingHorizontal: theme.spacing.s1 + 2, paddingVertical: theme.spacing.s1 / 2,
    borderRadius: 4, backgroundColor: theme.colors.savingsSoft,
  },
  discText: { fontSize: 11, fontWeight: '700', color: theme.colors.savings },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.s4,
  },
  actionRow: { flexDirection: 'row', gap: theme.spacing.s3, alignItems: 'center' },
  gotoBtn: {
    flex: 1, height: 48,
    backgroundColor: theme.colors.text1,
    borderRadius: theme.radius.pill,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.s1 + 2,
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
    marginTop: theme.spacing.s3, textAlign: 'center',
  },
});
