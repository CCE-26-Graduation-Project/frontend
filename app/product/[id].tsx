import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';
import { PRODUCT_DETAIL } from '../../constants/data';

// ─── Layout constants ─────────────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');
const OUTER_PAD  = 14;
const COL_GAP    = 10;
const CONTENT_W  = SW - OUTER_PAD * 2;
const LEFT_COL_W = Math.floor(CONTENT_W * 0.44);
const RIGHT_COL_W = CONTENT_W - LEFT_COL_W - COL_GAP;
const SLIDE_WIDTH = LEFT_COL_W;
const IMG_HEIGHT  = Math.round(LEFT_COL_W * 1.32);

// ─── Loupe constants ──────────────────────────────────────────────────────────
const LOUPE_SIZE = Math.round(SW * 0.27);
const LOUPE_GAP  = 14;
const ZOOM       = 2.5;

// ─── Expandable section (compact) ────────────────────────────────────────────

function ExpandableSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const chevronAnim = useRef(new Animated.Value(0)).current;

  function toggle() {
    Animated.spring(chevronAnim, { toValue: open ? 0 : 1, useNativeDriver: true, tension: 120, friction: 10 }).start();
    setOpen((o) => !o);
  }

  const rotate = chevronAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={styles.rSection}>
      <Pressable style={styles.rExpandHeader} onPress={toggle} hitSlop={4}>
        <Text style={styles.rSectionTitle}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Feather name="chevron-down" size={14} color={theme.colors.text1} />
        </Animated.View>
      </Pressable>
      {open && <View style={styles.rExpandContent}>{children}</View>}
    </View>
  );
}

// ─── Full-screen image viewer with loupe magnifier ───────────────────────────

function ImageViewerModal({
  images, initialIndex, visible, onClose, onIndexChange,
}: {
  images: number[]; initialIndex: number; visible: boolean; onClose: () => void; onIndexChange?: (i: number) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showLoupe, setShowLoupe]       = useState(false);
  const [areaSize, setAreaSize]         = useState({ w: SW, h: SH - 220 });

  const loupeLeft = useRef(new Animated.Value(0)).current;
  const loupeTop  = useRef(new Animated.Value(0)).current;
  const zImgLeft  = useRef(new Animated.Value(0)).current;
  const zImgTop   = useRef(new Animated.Value(0)).current;

  const onCloseRef   = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  const areaSizeRef  = useRef(areaSize);
  useEffect(() => { areaSizeRef.current = areaSize; }, [areaSize]);

  const loupeTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  function moveLoupeTo(lx: number, ly: number) {
    const { w: CW, h: CH } = areaSizeRef.current;
    const left     = Math.max(0, Math.min(lx - LOUPE_SIZE / 2, CW - LOUPE_SIZE));
    const topAbove = ly - LOUPE_SIZE - LOUPE_GAP;
    const top      = topAbove >= 4 ? topAbove : ly + LOUPE_GAP + 20;
    loupeLeft.setValue(left);
    loupeTop.setValue(top);
    zImgLeft.setValue(LOUPE_SIZE / 2 - lx * ZOOM);
    zImgTop.setValue(LOUPE_SIZE / 2 - ly * ZOOM);
  }

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,
    onPanResponderGrant: (evt) => {
      moveLoupeTo(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      loupeTimer.current = setTimeout(() => setShowLoupe(true), 130);
    },
    onPanResponderMove: (evt) => {
      if (loupeTimer.current) { clearTimeout(loupeTimer.current); loupeTimer.current = null; setShowLoupe(true); }
      moveLoupeTo(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
    },
    onPanResponderRelease: () => {
      if (loupeTimer.current) { clearTimeout(loupeTimer.current); loupeTimer.current = null; }
      setShowLoupe(false);
    },
    onPanResponderTerminate: () => {
      if (loupeTimer.current) { clearTimeout(loupeTimer.current); loupeTimer.current = null; }
      setShowLoupe(false);
    },
  })).current;

  function goTo(idx: number) {
    const next = Math.max(0, Math.min(idx, images.length - 1));
    setCurrentIndex(next);
    onIndexChange?.(next);
    setShowLoupe(false);
  }

  useEffect(() => {
    if (visible) { setCurrentIndex(initialIndex); setShowLoupe(false); }
  }, [visible, initialIndex]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <StatusBar hidden />
      <View style={viewerStyles.bg}>
        {/* Top bar */}
        <Pressable style={viewerStyles.topBar} onPress={onClose}>
          <Text style={viewerStyles.counterText}>{currentIndex + 1} / {images.length}</Text>
          <Pressable style={viewerStyles.closeBtn} onPress={onClose} hitSlop={12}>
            <Feather name="x" size={22} color="#fff" />
          </Pressable>
        </Pressable>

        {/* Image + loupe */}
        <View
          style={viewerStyles.imageArea}
          onLayout={(e) => { const { width, height } = e.nativeEvent.layout; setAreaSize({ w: width, h: height }); }}
          {...panResponder.panHandlers}
        >
          <Image source={images[currentIndex]} style={viewerStyles.mainImage} resizeMode="contain" />
          {showLoupe && (
            <Animated.View style={[viewerStyles.loupe, { left: loupeLeft, top: loupeTop }]} pointerEvents="none">
              <Animated.Image
                source={images[currentIndex]} resizeMode="contain"
                style={{ position: 'absolute', width: areaSize.w * ZOOM, height: areaSize.h * ZOOM, left: zImgLeft, top: zImgTop }}
              />
              <View style={viewerStyles.crossH} pointerEvents="none" />
              <View style={viewerStyles.crossV} pointerEvents="none" />
            </Animated.View>
          )}
        </View>

        {/* Hint */}
        <Pressable style={viewerStyles.hintRow} onPress={onClose}>
          <Feather name="zoom-in" size={12} color="rgba(255,255,255,0.45)" />
          <Text style={viewerStyles.hintText}>Touch &amp; drag to magnify</Text>
        </Pressable>

        {/* Arrows */}
        {currentIndex > 0 && (
          <Pressable style={[viewerStyles.navArrow, viewerStyles.navLeft]} onPress={() => goTo(currentIndex - 1)}>
            <Feather name="chevron-left" size={28} color="#fff" />
          </Pressable>
        )}
        {currentIndex < images.length - 1 && (
          <Pressable style={[viewerStyles.navArrow, viewerStyles.navRight]} onPress={() => goTo(currentIndex + 1)}>
            <Feather name="chevron-right" size={28} color="#fff" />
          </Pressable>
        )}

        {/* Thumbnails */}
        <Pressable onPress={onClose}>
          <View style={viewerStyles.thumbStrip} pointerEvents="box-none">
            {images.map((src: number, i: number) => (
              <Pressable key={i} onPress={() => goTo(i)}>
                <Image source={src} style={[viewerStyles.thumb, i === currentIndex && viewerStyles.thumbActive]} resizeMode="cover" />
              </Pressable>
            ))}
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

// ─── Product detail screen ────────────────────────────────────────────────────

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const [saved, setSaved]           = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const viewerIndexRef      = useRef(0);

  // Save-button animation
  const saveScaleAnim    = useRef(new Animated.Value(1)).current;
  const captionAnim      = useRef(new Animated.Value(0)).current;
  const captionTranslateY = captionAnim.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });
  const captionTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const product = PRODUCT_DETAIL;

  function goToSlide(index: number) {
    const next = Math.max(0, Math.min(index, product.images.length - 1));
    setActiveImage(next);
  }

  function handleSave() {
    const next = !saved;
    setSaved(next);
    if (next) {
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

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg1 }]}>

      {/* ── Top bar — back only ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={20} color={theme.colors.text1} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>

          {/* ── Left column: image slider ── */}
          <View style={styles.leftCol}>
            <View style={styles.sliderWrap}>
              <Pressable
                style={{ width: SLIDE_WIDTH, height: IMG_HEIGHT, backgroundColor: theme.colors.bg2, justifyContent: 'center' }}
                onPress={() => { viewerIndexRef.current = activeImage; setViewerOpen(true); }}
              >
                <Image source={product.images[activeImage]} style={{ width: SLIDE_WIDTH, height: IMG_HEIGHT }} resizeMode="contain" />
              </Pressable>

              {activeImage > 0 && (
                <Pressable style={[styles.sliderArrow, styles.sliderArrowL]} onPress={() => goToSlide(activeImage - 1)}>
                  <Feather name="chevron-left" size={14} color={theme.colors.text1} />
                </Pressable>
              )}
              {activeImage < product.images.length - 1 && (
                <Pressable style={[styles.sliderArrow, styles.sliderArrowR]} onPress={() => goToSlide(activeImage + 1)}>
                  <Feather name="chevron-right" size={14} color={theme.colors.text1} />
                </Pressable>
              )}

              {product.images.length > 1 && (
                <View style={styles.dots}>
                  {product.images.map((_: number, i: number) => (
                    <View key={i} style={[styles.dot, i === activeImage ? styles.dotActive : styles.dotInactive]} />
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* ── Right column: product info ── */}
          <View style={styles.rightCol}>

            {/* Product name */}
            <Text style={styles.productName} numberOfLines={4}>{product.name}</Text>

            {/* Category chip */}
            <View style={styles.catChip}>
              <Text style={styles.catChipText}>{product.category.toUpperCase()}</Text>
            </View>

            {/* Store */}
            <View style={styles.storeRow}>
              <View style={styles.storeLogo}>
                <Text style={styles.storeLogoText}>{product.storeLogo}</Text>
              </View>
              <Text style={styles.storeName} numberOfLines={1}>{product.store}</Text>
            </View>

            {/* Price */}
            <View style={styles.priceBlock}>
              <Text style={styles.price}>{product.price}</Text>
              {product.oldPrice && (
                <View style={styles.priceRow}>
                  <Text style={styles.oldPrice}>{product.oldPrice}</Text>
                  {product.discountPct != null && (
                    <View style={styles.discBadge}>
                      <Text style={styles.discText}>−{product.discountPct}%</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            <View style={styles.divider} />

            {/* Product details */}
            <ExpandableSection title="Product details">
              <View style={styles.rDetailsList}>
                {product.details.map((item: string, i: number) => (
                  <View key={i} style={styles.rDetailRow}>
                    <View style={styles.rBullet} />
                    <Text style={styles.rDetailText}>{item}</Text>
                  </View>
                ))}
              </View>
            </ExpandableSection>

            {/* Specifications */}
            <ExpandableSection title="Specifications">
              <View style={styles.rSpecTable}>
                {product.specs.map(([key, val]: [string, string], i: number) => (
                  <View key={key} style={[styles.rSpecRow, i % 2 === 0 ? styles.rSpecRowShaded : null]}>
                    <Text style={styles.rSpecKey}>{key}</Text>
                    <Text style={styles.rSpecVal}>{val}</Text>
                  </View>
                ))}
              </View>
            </ExpandableSection>

            <View style={styles.divider} />

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <Pressable style={styles.gotoBtn} onPress={() => {}}>
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

            {/* "Added to favourites" caption */}
            <Animated.Text
              style={[styles.savedCaption, { opacity: captionAnim, transform: [{ translateY: captionTranslateY }] }]}
            >
              ✓ Added to favourites
            </Animated.Text>

          </View>
        </View>
      </ScrollView>

      <ImageViewerModal
        images={product.images}
        initialIndex={activeImage}
        visible={viewerOpen}
        onIndexChange={(i) => { viewerIndexRef.current = i; }}
        onClose={() => {
          setActiveImage(viewerIndexRef.current);
          setViewerOpen(false);
        }}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Top bar
  topBar: { paddingHorizontal: OUTER_PAD, paddingBottom: 6, zIndex: 5 },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.rest,
  },

  // Two-column row
  row: {
    flexDirection: 'row',
    paddingHorizontal: OUTER_PAD,
    paddingTop: 2,
    gap: COL_GAP,
    alignItems: 'center',
  },
  leftCol:  { width: LEFT_COL_W },
  rightCol: { width: RIGHT_COL_W, paddingTop: 2 },

  // Image slider
  sliderWrap: {
    width: LEFT_COL_W, height: IMG_HEIGHT,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    backgroundColor: theme.colors.bg2,
    ...theme.shadows.rest,
  },
  sliderArrow: {
    position: 'absolute', top: '50%', marginTop: -14,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10, shadowRadius: 3, elevation: 3,
  },
  sliderArrowL: { left: 5 },
  sliderArrowR: { right: 5 },
  dots: {
    position: 'absolute', bottom: 8, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 4,
  },
  dot:         { height: 4, borderRadius: 2 },
  dotActive:   { width: 14, backgroundColor: theme.colors.text1 },
  dotInactive: { width: 4, backgroundColor: 'rgba(30,43,77,0.22)' },

  // Right column — product info
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

  // Expandable sections — compact
  rSection: { marginBottom: 2 },
  rExpandHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.divider,
  },
  rSectionTitle: { fontSize: 13, fontWeight: '600', color: theme.colors.text1, letterSpacing: -0.1 },
  rExpandContent: { paddingTop: 8, paddingBottom: 4 },
  rDetailsList:   { gap: 5 },
  rDetailRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  rBullet: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: theme.colors.text2, marginTop: 5, flexShrink: 0,
  },
  rDetailText: { fontSize: 11, color: theme.colors.text1, lineHeight: 16, flex: 1 },
  rSpecTable:        { borderRadius: 8, overflow: 'hidden' },
  rSpecRow:          { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8 },
  rSpecRowShaded:    { backgroundColor: theme.colors.bg2 },
  rSpecKey:          { fontSize: 11, color: theme.colors.text2, flex: 1 },
  rSpecVal:          { fontSize: 11, fontWeight: '500', color: theme.colors.text1, textAlign: 'right', flex: 1 },

  // Action buttons
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4, alignItems: 'center' },
  gotoBtn: {
    flex: 1, height: 44,
    backgroundColor: theme.colors.text1,
    borderRadius: theme.radius.pill,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    ...theme.shadows.card,
  },
  gotoBtnText: { fontSize: 13, fontWeight: '600', color: '#fff', letterSpacing: -0.1 },

  saveBtn: {
    width: 44, height: 44, borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: theme.colors.divider,
  },
  saveBtnActive: {
    backgroundColor: '#FFEBCC',
    borderColor: '#FFEBCC',
  },

  savedCaption: {
    fontSize: 11, fontWeight: '600', color: theme.colors.savings,
    marginTop: 8, textAlign: 'center',
  },
});

// ─── Viewer styles ────────────────────────────────────────────────────────────

const viewerStyles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)' },
  topBar: {
    height: 56, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  counterText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  closeBtn: {
    position: 'absolute', right: 16, top: 8,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center', alignItems: 'center',
  },
  imageArea:  { flex: 1, overflow: 'hidden' },
  mainImage:  { width: '100%', height: '100%' },
  loupe: {
    position: 'absolute', width: LOUPE_SIZE, height: LOUPE_SIZE,
    borderRadius: 6, overflow: 'hidden',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
    backgroundColor: '#111',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 12, elevation: 12,
  },
  crossH: {
    position: 'absolute', top: Math.round(LOUPE_SIZE / 2),
    left: 0, right: 0, height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  crossV: {
    position: 'absolute', left: Math.round(LOUPE_SIZE / 2),
    top: 0, bottom: 0, width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  hintRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 8,
  },
  hintText: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },
  navArrow: {
    position: 'absolute', top: '50%', marginTop: -24, zIndex: 10,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  navLeft:  { left: 14 },
  navRight: { right: 14 },
  thumbStrip: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 8, paddingVertical: 10, paddingBottom: 28,
  },
  thumb: {
    width: 54, height: 54, borderRadius: 8,
    borderWidth: 2, borderColor: 'transparent', opacity: 0.55,
  },
  thumbActive: { borderColor: '#fff', opacity: 1 },
});
