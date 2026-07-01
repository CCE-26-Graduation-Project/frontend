import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  Dimensions,
  ScrollView,
  PanResponder,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { getVendors } from '../services';
import type { Vendor } from '../services';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.72;
const PRICE_MAX = 10000;
// const CATEGORIES = ['Clothes', 'Shoes', 'Bags', 'Sportswear'] as const;
const CATEGORIES = ['Clothes'] as const;
const THUMB = 26;
const SNAP = 50;

export type FilterState = {
  category: string | null;
  minPrice: number;
  maxPrice: number;
  brands: string[] | null; // null = all brands (no brand filter applied)
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
};

export function FilterSheet({ visible, onClose, onApply, onClear }: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);

  const [category, setCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: PRICE_MAX });
  const [minInput, setMinInput] = useState('0');
  const [maxInput, setMaxInput] = useState(String(PRICE_MAX));

  // Brand state
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const vendorsInitialized = useRef(false);

  // Brand sub-panel
  const [showBrandPanel, setShowBrandPanel] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const panelAnim = useRef(new Animated.Value(0)).current;
  const brandSearchRef = useRef<TextInput>(null);

  // Drag-to-dismiss on the handle area
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > 8,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > 100 || vy > 0.8) {
          Animated.parallel([
            Animated.timing(translateY, { toValue: SHEET_HEIGHT, duration: 260, useNativeDriver: true }),
            Animated.timing(backdrop, { toValue: 0, duration: 220, useNativeDriver: true }),
          ]).start(() => { setMounted(false); onClose(); });
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 280, mass: 0.9 }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 280, mass: 0.9 }),
        Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: SHEET_HEIGHT, duration: 260, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
  }, [visible]);

  // Fetch vendors once on first open
  useEffect(() => {
    if (!visible || vendorsInitialized.current) return;
    vendorsInitialized.current = true;
    setVendorsLoading(true);
    getVendors()
      .then((data) => {
        setVendors(data);
        setSelectedBrands(new Set(data.map((v) => v.name)));
      })
      .catch(() => {})
      .finally(() => setVendorsLoading(false));
  }, [visible]);

  // ── Brand panel helpers ──────────────────────────────────────────────────────

  function openBrandPanel() {
    setShowBrandPanel(true);
    Animated.timing(panelAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }

  function closeBrandPanel() {
    Keyboard.dismiss();
    Animated.timing(panelAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setShowBrandPanel(false);
      setBrandSearch('');
    });
  }

  function cancelBrandSearch() {
    setBrandSearch('');
    brandSearchRef.current?.blur();
  }

  function handleBrandShow() {
    const brands = allSelected ? null : Array.from(selectedBrands);
    onApply({ category, minPrice: priceRange.min, maxPrice: priceRange.max, brands });
    onClose();
  }

  const filteredVendors = useMemo(() => {
    const q = brandSearch.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) => v.name.toLowerCase().includes(q));
  }, [vendors, brandSearch]);

  const allSelected = vendors.length > 0 && selectedBrands.size === vendors.length;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedBrands(new Set());
    } else {
      setSelectedBrands(new Set(vendors.map((v) => v.name)));
    }
  }

  function toggleBrand(name: string) {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  // ── Price helpers ────────────────────────────────────────────────────────────

  function setRange(v: { min: number; max: number }) {
    setPriceRange(v);
    setMinInput(String(v.min));
    setMaxInput(String(v.max));
  }

  function handleMinInput(text: string) {
    setMinInput(text);
    const v = parseInt(text, 10);
    if (!isNaN(v)) {
      setPriceRange((r) => ({ ...r, min: Math.max(0, Math.min(v, r.max - SNAP)) }));
    }
  }

  function handleMaxInput(text: string) {
    setMaxInput(text);
    const v = parseInt(text, 10);
    if (!isNaN(v)) {
      setPriceRange((r) => ({ ...r, max: Math.min(PRICE_MAX, Math.max(v, r.min + SNAP)) }));
    }
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  function handleClear() {
    setCategory(null);
    setRange({ min: 0, max: PRICE_MAX });
    setSelectedBrands(new Set(vendors.map((v) => v.name)));
    onClear();
  }

  function handleShow() {
    const brands = allSelected ? null : Array.from(selectedBrands);
    onApply({ category, minPrice: priceRange.min, maxPrice: priceRange.max, brands });
    onClose();
  }

  const brandSubtitle = allSelected || vendors.length === 0
    ? 'All'
    : `${selectedBrands.size} selected`;

  const brandPanelX = panelAnim.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_WIDTH, 0] });

  if (!mounted) return null;

  return (
    <Modal transparent statusBarTranslucent animationType="none" visible={mounted} onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]} pointerEvents={visible ? 'box-none' : 'none'}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kavContainer}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          {/* Drag handle */}
          <View style={styles.handleWrap} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <Text style={styles.title}>Filters</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* ── Category ── */}
            {/* <View style={styles.section}>
              <Text style={styles.sectionLabel}>Category</Text>
              <View style={styles.chipsRow}>
                {CATEGORIES.map((cat) => {
                  const active = category === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(active ? null : cat)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.divider} /> */}

            <View style={styles.divider} />
            {/* ── Brand (nav row → sub-panel) ── */}
            <Pressable style={styles.brandNavRow} onPress={openBrandPanel}>
              <Text style={styles.brandNavLabel}>Brand</Text>
              <Text style={styles.brandNavSub}>{brandSubtitle}</Text>
              <Feather name="chevron-right" size={18} color={theme.colors.text2} />
            </Pressable>

            <View style={styles.divider} />

            {/* ── Price ── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Price</Text>
              <PriceRangeSlider value={priceRange} onChange={setRange} />
              <View style={styles.priceRow}>
                <View style={styles.priceBox}>
                  <Text style={styles.currencyPrefix}>EGP</Text>
                  <TextInput
                    style={styles.priceInput}
                    keyboardType="number-pad"
                    value={minInput}
                    onChangeText={handleMinInput}
                    onBlur={() => setMinInput(String(priceRange.min))}
                    returnKeyType="done"
                  />
                </View>
                <Text style={styles.rangeDash}>–</Text>
                <View style={styles.priceBox}>
                  <Text style={styles.currencyPrefix}>EGP</Text>
                  <TextInput
                    style={styles.priceInput}
                    keyboardType="number-pad"
                    value={maxInput}
                    onChangeText={handleMaxInput}
                    onBlur={() => setMaxInput(String(priceRange.max))}
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom buttons */}
          <View style={styles.bottomRow}>
            <Pressable style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearText}>Clear all</Text>
            </Pressable>
            <Pressable style={styles.showBtn} onPress={handleShow}>
              <Text style={styles.showText}>Show</Text>
            </Pressable>
          </View>

          {/* ── Brand sub-panel (slides in from right over the sheet) ── */}
          {showBrandPanel && (
            <Animated.View style={[styles.brandPanel, { transform: [{ translateX: brandPanelX }] }]}>
              {/* Header */}
              <View style={styles.brandHeader}>
                <Pressable onPress={closeBrandPanel} hitSlop={10} style={styles.brandHeaderBtn}>
                  <Feather name="arrow-left" size={22} color={theme.colors.text1} />
                </Pressable>
                <Text style={styles.brandPanelTitle}>Brand</Text>
                <Pressable onPress={onClose} hitSlop={10} style={styles.brandHeaderBtn}>
                  <Feather name="x" size={22} color={theme.colors.text1} />
                </Pressable>
              </View>

              {/* Search + Cancel */}
              <View style={styles.brandSearchRow}>
                <View style={styles.brandSearchWrap}>
                  <Feather name="search" size={15} color={theme.colors.text2} />
                  <TextInput
                    ref={brandSearchRef}
                    style={styles.brandSearchInput}
                    placeholder="Search"
                    placeholderTextColor={theme.colors.text2}
                    value={brandSearch}
                    onChangeText={setBrandSearch}
                    returnKeyType="search"
                    onSubmitEditing={() => brandSearchRef.current?.blur()}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  {brandSearch.length > 0 && (
                    <Pressable onPress={() => setBrandSearch('')} hitSlop={6}>
                      <Feather name="x" size={14} color={theme.colors.text2} />
                    </Pressable>
                  )}
                </View>
                <Pressable onPress={cancelBrandSearch} hitSlop={6} style={styles.brandCancelBtn}>
                  <Text style={styles.brandCancelText}>Cancel</Text>
                </Pressable>
              </View>

              {/* Select all (below search, above list) */}
              <Pressable style={styles.selectAllRow} onPress={toggleSelectAll}>
                <Text style={styles.selectAllText}>Select all</Text>
                <View style={[styles.checkbox, allSelected && styles.checkboxChecked]}>
                  {allSelected && <Feather name="check" size={11} color="#fff" />}
                </View>
              </Pressable>

              <View style={styles.divider} />

              {/* Vendor list */}
              {vendorsLoading ? (
                <ActivityIndicator color={theme.colors.text2} style={styles.vendorLoader} />
              ) : (
                <ScrollView
                  style={styles.vendorScroll}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                >
                  {filteredVendors.map((v) => {
                    const checked = selectedBrands.has(v.name);
                    return (
                      <Pressable key={v.name} style={styles.vendorRow} onPress={() => toggleBrand(v.name)}>
                        <View style={styles.vendorInitialCircle}>
                          <Text style={styles.vendorInitialText}>{v.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        <Text style={styles.vendorName} numberOfLines={1}>{v.name}</Text>
                        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                          {checked && <Feather name="check" size={11} color="#fff" />}
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}

              {/* Show button */}
              <View style={styles.brandBottomRow}>
                <Pressable style={styles.showBtn} onPress={handleBrandShow}>
                  <Text style={styles.showText}>Show</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Dual-thumb range slider ──────────────────────────────────────────────────

type RangeValue = { min: number; max: number };

function PriceRangeSlider({ value, onChange }: { value: RangeValue; onChange: (v: RangeValue) => void }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const twRef = useRef(0);
  const valRef = useRef(value);
  valRef.current = value;

  const minCurrPx = useRef(0);
  const minStartPx = useRef(0);
  const maxCurrPx = useRef(0);
  const maxStartPx = useRef(0);

  const [leftPx, setLeftPx] = useState(0);
  const [rightPx, setRightPx] = useState(0);

  const priceToPx = (p: number, tw: number) => (p / PRICE_MAX) * tw;
  const pxToPrice = (px: number, tw: number) =>
    Math.round(((px / (tw || 1)) * PRICE_MAX) / SNAP) * SNAP;

  useEffect(() => {
    const tw = twRef.current;
    if (!tw) return;
    const lx = priceToPx(value.min, tw);
    const rx = priceToPx(value.max, tw);
    minCurrPx.current = lx;
    maxCurrPx.current = rx;
    setLeftPx(lx);
    setRightPx(rx);
  }, [value.min, value.max, trackWidth]);

  const minPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { minStartPx.current = minCurrPx.current; },
      onPanResponderMove: (_, { dx }) => {
        const tw = twRef.current;
        if (!tw) return;
        const newPx = Math.max(0, Math.min(minStartPx.current + dx, maxCurrPx.current - THUMB));
        minCurrPx.current = newPx;
        setLeftPx(newPx);
        onChange({ min: Math.max(0, Math.min(pxToPrice(newPx, tw), valRef.current.max - SNAP)), max: valRef.current.max });
      },
      onPanResponderRelease: () => {},
    }),
  ).current;

  const maxPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { maxStartPx.current = maxCurrPx.current; },
      onPanResponderMove: (_, { dx }) => {
        const tw = twRef.current;
        if (!tw) return;
        const newPx = Math.max(minCurrPx.current + THUMB, Math.min(maxStartPx.current + dx, tw));
        maxCurrPx.current = newPx;
        setRightPx(newPx);
        onChange({ min: valRef.current.min, max: Math.min(PRICE_MAX, Math.max(pxToPrice(newPx, tw), valRef.current.min + SNAP)) });
      },
      onPanResponderRelease: () => {},
    }),
  ).current;

  return (
    <View style={sliderStyles.container}>
      <View
        style={sliderStyles.trackWrap}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          twRef.current = w;
          const lx = priceToPx(valRef.current.min, w);
          const rx = priceToPx(valRef.current.max, w);
          minCurrPx.current = lx;
          maxCurrPx.current = rx;
          setTrackWidth(w);
          setLeftPx(lx);
          setRightPx(rx);
        }}
      >
        <View style={sliderStyles.track} />
        {trackWidth > 0 && (
          <View style={[sliderStyles.activeTrack, { left: leftPx, width: rightPx - leftPx }]} />
        )}
        {trackWidth > 0 && (
          <View style={[sliderStyles.thumb, { left: leftPx - THUMB / 2 }]} {...minPan.panHandlers} />
        )}
        {trackWidth > 0 && (
          <View style={[sliderStyles.thumb, { left: rightPx - THUMB / 2 }]} {...maxPan.panHandlers} />
        )}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14,18,36,0.48)',
  },
  kavContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: SHEET_HEIGHT,
    backgroundColor: theme.colors.bg1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    ...theme.shadows.floating,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.divider,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.24,
    paddingHorizontal: theme.spacing.s5,
    paddingBottom: 4,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  section: {
    paddingHorizontal: theme.spacing.s5,
    paddingVertical: theme.spacing.s4,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text1,
    letterSpacing: -0.04,
    marginBottom: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.divider,
    marginHorizontal: theme.spacing.s5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.bg1,
  },
  chipActive: {
    borderColor: theme.colors.accentDeep,
    backgroundColor: theme.colors.accentSoft,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text2,
    letterSpacing: -0.04,
  },
  chipTextActive: {
    color: theme.colors.accentDeep,
    fontWeight: '600',
  },
  // Brand nav row
  brandNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s5,
    paddingVertical: 18,
  },
  brandNavLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text1,
    flex: 1,
    letterSpacing: -0.04,
  },
  brandNavSub: {
    fontSize: 14,
    color: theme.colors.text2,
    marginRight: 6,
  },
  // Price
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  priceBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: theme.radius.compact,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.white,
    gap: 6,
  },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text2,
    flexShrink: 0,
  },
  priceInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text1,
    padding: 0,
  },
  rangeDash: {
    fontSize: 18,
    color: theme.colors.text2,
    fontWeight: '400',
  },
  // Bottom buttons
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: theme.spacing.s5,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.divider,
    backgroundColor: theme.colors.bg1,
  },
  clearBtn: {
    flex: 1,
    height: 50,
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: theme.colors.text1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.bg1,
  },
  clearText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text1,
    letterSpacing: -0.04,
  },
  showBtn: {
    flex: 2,
    height: 50,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.text1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  showText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -0.04,
  },
  // Brand sub-panel
  brandPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.bg1,
    flexDirection: 'column',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s4,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  brandHeaderBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandPanelTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.2,
  },
  brandSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: 10,
    gap: 10,
  },
  brandSearchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.bg2,
    paddingHorizontal: 12,
    gap: 8,
  },
  brandSearchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text1,
    padding: 0,
  },
  brandCancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  brandCancelText: {
    fontSize: 15,
    color: theme.colors.accentDeep,
    fontWeight: '500',
  },
  vendorLoader: {
    flex: 1,
    marginTop: 32,
  },
  vendorScroll: {
    flex: 1,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s5,
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  vendorInitialCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.bg2,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  vendorInitialText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text2,
  },
  vendorName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text1,
    letterSpacing: -0.04,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.text1,
    borderColor: theme.colors.text1,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s5,
    paddingVertical: 14,
    backgroundColor: theme.colors.bg1,
  },
  brandBottomRow: {
    paddingHorizontal: theme.spacing.s5,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.divider,
    backgroundColor: theme.colors.bg1,
  },
  selectAllText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text1,
    letterSpacing: -0.04,
  },
});

const sliderStyles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
  trackWrap: {
    height: THUMB,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.divider,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  activeTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.accentDeep,
    position: 'absolute',
    top: (THUMB - 3) / 2,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: theme.colors.white,
    borderWidth: 2.5,
    borderColor: theme.colors.accentDeep,
    position: 'absolute',
    top: 0,
    ...theme.shadows.card,
  },
});
