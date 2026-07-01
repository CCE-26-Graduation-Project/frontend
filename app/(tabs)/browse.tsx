import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  InteractionManager,
  Keyboard,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ProductCard } from '../../components/ProductCard';
import { SnoopCharacter } from '../../components/SnoopCharacter';
import { AttachmentPreview } from '../../components/AttachmentPreview';
import { LoadMoreButton } from '../../components/LoadMoreButton';
import { SortingIcon } from '../../components/SortingIcon';
import { FilterIcon } from '../../components/FilterIcon';
import { FilterSheet, type FilterState } from '../../components/FilterSheet';
import { theme } from '../../constants/theme';
import type { Product } from '../../constants/data';
import { usePaginatedSearch } from '../../hooks/usePaginatedSearch';
import { useImageAttachment } from '../../hooks/useImageAttachment';
import { getAutocomplete } from '../../services';

const NAV_TOTAL_HEIGHT = 114;

export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const { focusAt, openAttach, searchQuery, searchAt, cameraUri, cameraAt } = useLocalSearchParams<{ focusAt?: string; openAttach?: string; searchQuery?: string; searchAt?: string; cameraUri?: string; cameraAt?: string }>();
  const lastFocusAt = useRef<string | undefined>(undefined);
  const lastOpenAttach = useRef<string | undefined>(undefined);
  const lastSearchAt = useRef<string | undefined>(undefined);
  const lastCameraAt = useRef<string | undefined>(undefined);

  const [query, setQuery]               = useState('');
  const [searched, setSearched]         = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const attachment                      = useImageAttachment();

  const [suggestions, setSuggestions]         = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [headerHeight, setHeaderHeight]       = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [sortOrder, setSortOrder] = useState<'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const sortBtnRef = useRef<View>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);

  // Search + pagination lifecycle (shared with app/results.tsx via the hook).
  const {
    products,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    totalElements,
    search,
    loadMore,
  } = usePaginatedSearch();

  // Focus the input after the tab-switch animation completes, but only when
  // the home screen explicitly triggered navigation (new focusAt timestamp).
  useFocusEffect(
    useCallback(() => {
      if (focusAt && focusAt !== lastFocusAt.current) {
        lastFocusAt.current = focusAt;
        const task = InteractionManager.runAfterInteractions(() => {
          inputRef.current?.focus();
        });
        return () => task.cancel();
      }
    }, [focusAt])
  );

  // Runs a text-only, image-only, or combined (multimodal) search depending on what
  // the user provided. `imageUri` defaults to the current attachment so the keyboard
  // "search" key and the retry button both include any attached photo. The hook owns
  // loading/error/products + pagination; we only track the label to echo back.
  const runSearch = useCallback((text: string, imageUri: string | null = attachment.uri) => {
    const q = text.trim();
    const img = imageUri;
    if (!q && !img) return;
    Keyboard.dismiss();
    setSuggestions([]);
    setShowSuggestions(false);
    setSearched(q || 'Visual search');
    setSortOrder(null);
    setActiveFilters(null);
    search({ text: q, imageUri: img });
  }, [attachment.uri, search]);

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Attach a single photo, then immediately run the search (combined with any text
  // already typed). One tap = search by photo; type first to refine it.
  const handleAttach = useCallback(async () => {
    const picked = await attachment.pick();
    if (picked) runSearch(query, picked);
  }, [attachment, query, runSearch]);

  // Launch the device camera directly — no tab navigation, so cancelling stays here.
  const handleCamera = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      const { Alert } = await import('react-native');
      Alert.alert('Camera permission needed', 'Enable camera access in Settings to search by photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true });
    if (!result.canceled && result.assets[0]?.uri) {
      const uri = result.assets[0].uri;
      attachment.set(uri);
      runSearch('', uri);
    }
  }, [attachment, runSearch]);

  const displayedProducts = useMemo(() => {
    let list = products;

    if (activeFilters) {
      const { minPrice, maxPrice, category, brands } = activeFilters;
      list = list.filter((p) => {
        const price = parseFloat(p.price.replace(/[^\d.]/g, ''));
        if (isNaN(price) || price < minPrice || price > maxPrice) return false;
        if (category && p.category?.toLowerCase() !== category.toLowerCase()) return false;
        if (brands !== null && !brands.includes(p.store)) return false;
        return true;
      });
    }

    if (!sortOrder) return list;
    return [...list].sort((a, b) => {
      if (sortOrder === 'price_asc') return parseFloat(a.price.replace(/[^\d.]/g, '')) - parseFloat(b.price.replace(/[^\d.]/g, ''));
      if (sortOrder === 'price_desc') return parseFloat(b.price.replace(/[^\d.]/g, '')) - parseFloat(a.price.replace(/[^\d.]/g, ''));
      if (sortOrder === 'name_asc') return a.name.localeCompare(b.name);
      if (sortOrder === 'name_desc') return b.name.localeCompare(a.name);
      return 0;
    });
  }, [products, sortOrder, activeFilters]);

  const handleSortPress = useCallback(() => {
    if (showSortMenu) {
      setShowSortMenu(false);
      return;
    }
    sortBtnRef.current?.measureInWindow((x, y, width, height) => {
      const screenWidth = Dimensions.get('window').width;
      setDropdownPos({ top: y + height + 4, right: screenWidth - x - width });
      setShowSortMenu(true);
    });
  }, [showSortMenu]);

  // When the home-page paperclip navigates here with a fresh openAttach timestamp,
  // open the image picker automatically after the tab animation finishes.
  useFocusEffect(
    useCallback(() => {
      if (openAttach && openAttach !== lastOpenAttach.current) {
        lastOpenAttach.current = openAttach;
        const task = InteractionManager.runAfterInteractions(() => {
          handleAttach();
        });
        return () => task.cancel();
      }
    }, [openAttach, handleAttach])
  );

  // Category card on home screen navigates here with a query to auto-run.
  useFocusEffect(
    useCallback(() => {
      if (searchAt && searchAt !== lastSearchAt.current && searchQuery) {
        lastSearchAt.current = searchAt;
        const task = InteractionManager.runAfterInteractions(() => {
          setQuery(searchQuery);
          runSearch(searchQuery, null);
        });
        return () => task.cancel();
      }
    }, [searchAt, searchQuery, runSearch])
  );

  // Camera screen passes the captured photo URI here to run an image search.
  useFocusEffect(
    useCallback(() => {
      if (cameraAt && cameraAt !== lastCameraAt.current && cameraUri) {
        lastCameraAt.current = cameraAt;
        const task = InteractionManager.runAfterInteractions(() => {
          setQuery('');
          attachment.set(cameraUri);
          runSearch('', cameraUri);
        });
        return () => task.cancel();
      }
    }, [cameraAt, cameraUri, runSearch, attachment])
  );

  const renderItem = useCallback(({ item: product }: { item: Product }) => (
    <View style={styles.gridCell}>
      <ProductCard
        product={product}
        onPress={() =>
          router.push({
            pathname: '/product/[id]',
            params: {
              id: product.id,
              name: product.name,
              price: product.price,
              store: product.store,
              storeLogo: product.storeLogo,
              category: product.category ?? '',
              imageUrl: product.imageUrl ?? product.imageUrls?.[0] ?? '',
              imageUrls: JSON.stringify(product.imageUrls ?? []),
              productUrl: product.productUrl ?? '',
              oldPrice: product.oldPrice ?? '',
              discountPct: product.discountPct != null ? String(product.discountPct) : '',
            },
          })
        }
      />
    </View>
  ), []);

  const showEmpty  = !loading && !error && searched && (products.length === 0 || displayedProducts.length === 0);
  const showResult = !loading && !error && products.length > 0;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg1 }]}>
      {/* ── Search bar ── */}
      <View
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.inputRow}>
          <Feather name="search" size={18} color={theme.colors.text2} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search any product…"
            placeholderTextColor={theme.colors.text2}
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (debounceRef.current) clearTimeout(debounceRef.current);
              if (text.trim().length > 0) {
                debounceRef.current = setTimeout(async () => {
                  const results = await getAutocomplete(text);
                  setSuggestions(results);
                  setShowSuggestions(results.length > 0);
                }, 300);
              } else {
                setSuggestions([]);
                setShowSuggestions(false);
              }
            }}
            onSubmitEditing={() => runSearch(query)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => {
              setInputFocused(false);
              // Delay so a suggestion tap can register before the dropdown hides
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={handleClear} hitSlop={8}>
              <Feather name="x" size={16} color={theme.colors.text2} />
            </Pressable>
          )}
          {/* Attach a photo to search by image */}
          <Pressable onPress={handleAttach} hitSlop={8} disabled={attachment.picking}>
            <Feather name="paperclip" size={18} color={theme.colors.text2} />
          </Pressable>
          {/* Open camera for visual search */}
          <Pressable onPress={handleCamera} hitSlop={8}>
            <Feather name="camera" size={18} color={theme.colors.text2} />
          </Pressable>
        </View>

        {/* Cancel — visible while keyboard is open, just dismisses the keyboard */}
        {inputFocused && (
          <Pressable hitSlop={8} onPress={() => Keyboard.dismiss()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        )}
      </View>

      {/* Attached image preview */}
      {attachment.uri && (
        <View style={styles.attachmentBar}>
          <AttachmentPreview uri={attachment.uri} onRemove={attachment.clear} />
        </View>
      )}

      {/* ── Result count bar ── */}
      {showResult && (
        <View style={styles.countBar}>
          <Text style={styles.countText}>
            <Text style={styles.countBold}>
              {activeFilters ? displayedProducts.length : (totalElements || products.length)}
            </Text>
            {(activeFilters ? displayedProducts.length : (totalElements || products.length)) === 1 ? ' result' : ' results'} for{' '}
            <Text style={styles.countBold}>{searched}</Text>
          </Text>
          <View style={styles.buttonRow}>
            <View ref={sortBtnRef} collapsable={false}>
              <Pressable onPress={handleSortPress} style={[styles.sortBtn, sortOrder != null && styles.sortBtnActive]} hitSlop={4}>
                <SortingIcon
                  size={20}
                  color={sortOrder ? theme.colors.accentDeep : theme.colors.text2}
                />
              </Pressable>
            </View>
            <Pressable
              onPress={() => setFilterOpen(true)}
              style={[styles.sortBtn, activeFilters && styles.sortBtnActive]}
              hitSlop={4}
            >
              <FilterIcon
                size={20}
                color={activeFilters ? theme.colors.accentDeep : theme.colors.text2}
              />
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Sort dropdown (Modal so it floats above FlatList) ── */}
      <Modal transparent visible={showSortMenu} animationType="none" onRequestClose={() => setShowSortMenu(false)}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowSortMenu(false)} />
        <View style={[styles.dropdown, { top: dropdownPos.top, right: dropdownPos.right }]}>
          <Pressable
            style={styles.dropdownItem}
            onPress={() => { setSortOrder('price_asc'); setShowSortMenu(false); }}
          >
            <Feather name="arrow-up" size={13} color={theme.colors.text2} />
            <Text style={styles.dropdownText}>Price: Low to High</Text>
            {sortOrder === 'price_asc' && <Feather name="check" size={13} color={theme.colors.accentDeep} />}
          </Pressable>
          <View style={styles.dropdownDivider} />
          <Pressable
            style={styles.dropdownItem}
            onPress={() => { setSortOrder('price_desc'); setShowSortMenu(false); }}
          >
            <Feather name="arrow-down" size={13} color={theme.colors.text2} />
            <Text style={styles.dropdownText}>Price: High to Low</Text>
            {sortOrder === 'price_desc' && <Feather name="check" size={13} color={theme.colors.accentDeep} />}
          </Pressable>
          <View style={styles.dropdownDivider} />
          <Pressable
            style={styles.dropdownItem}
            onPress={() => { setSortOrder('name_asc'); setShowSortMenu(false); }}
          >
            <Feather name="type" size={13} color={theme.colors.text2} />
            <Text style={styles.dropdownText}>Name: A to Z</Text>
            {sortOrder === 'name_asc' && <Feather name="check" size={13} color={theme.colors.accentDeep} />}
          </Pressable>
          <View style={styles.dropdownDivider} />
          <Pressable
            style={styles.dropdownItem}
            onPress={() => { setSortOrder('name_desc'); setShowSortMenu(false); }}
          >
            <Feather name="type" size={13} color={theme.colors.text2} />
            <Text style={styles.dropdownText}>Name: Z to A</Text>
            {sortOrder === 'name_desc' && <Feather name="check" size={13} color={theme.colors.accentDeep} />}
          </Pressable>
          {sortOrder !== null && (
            <>
              <View style={styles.dropdownDivider} />
              <Pressable
                style={styles.dropdownItem}
                onPress={() => { setSortOrder(null); setShowSortMenu(false); }}
              >
                <Feather name="x" size={13} color="#E53935" />
                <Text style={[styles.dropdownText, styles.dropdownCancel]}>Cancel sorting</Text>
              </Pressable>
            </>
          )}
        </View>
      </Modal>

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(filters) => setActiveFilters(filters)}
        onClear={() => { setActiveFilters(null); setFilterOpen(false); }}
      />

      {/* ── Body ──
          Every branch uses a ScrollView (or FlatList) with keyboardDismissMode
          so that a finger-drag downward dismisses the keyboard natively on
          iOS (interactive follow-finger) and Android (on-drag). */}
      {loading ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.center}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SnoopCharacter expression="thinking" size={120} />
          <Text style={styles.stateTitle}>Searching…</Text>
          <Text style={styles.stateBody}>Looking across stores for "{searched}"</Text>
          <ActivityIndicator color={theme.colors.text1} style={{ marginTop: 16 }} />
        </ScrollView>
      ) : error ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.center}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SnoopCharacter expression="surprised" size={120} />
          <Text style={styles.stateTitle}>Search failed</Text>
          <Text style={styles.stateBody}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => runSearch(query)}>
            <Feather name="refresh-cw" size={14} color={theme.colors.text1} />
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </ScrollView>
      ) : showEmpty ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.center}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SnoopCharacter expression="surprised" size={120} />
          <Text style={styles.stateTitle}>Nothing found</Text>
          <Text style={styles.stateBody}>Try a different search or filter</Text>
        </ScrollView>
      ) : !searched ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.center}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SnoopCharacter expression="waving" size={140} />
          <Text style={styles.stateTitle}>What are you looking for?</Text>
          <Text style={styles.stateBody}>Type a product above and tap Search.</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={displayedProducts}
          keyExtractor={(p) => p.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.list, { paddingBottom: NAV_TOTAL_HEIGHT + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews
          initialNumToRender={6}
          maxToRenderPerBatch={4}
          windowSize={5}
          ListFooterComponent={
            hasMore ? (
              <LoadMoreButton onPress={loadMore} loading={loadingMore} error={loadMoreError} />
            ) : null
          }
        />
      )}

      {/* Autocomplete dropdown — last child so it paints above everything on Android */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={[styles.suggestions, { top: headerHeight }]}>
          {suggestions.map((s, i) => (
            <Pressable
              key={i}
              style={[styles.suggestionRow, i < suggestions.length - 1 && styles.suggestionDivider]}
              onPress={() => {
                setQuery(s);
                setSuggestions([]);
                setShowSuggestions(false);
                runSearch(s);
              }}
            >
              <Feather name="search" size={14} color={theme.colors.text2} />
              <Text style={styles.suggestionText} numberOfLines={1}>{s}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  fill: { flex: 1 },
  header: {
    paddingHorizontal: theme.spacing.s4,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.bg1,
  },
  inputRow: {
    flex: 1,
    height: 44,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.bg2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  searchIcon: { flexShrink: 0 },
  attachmentBar: {
    paddingHorizontal: theme.spacing.s4,
    paddingTop: 10,
    backgroundColor: theme.colors.bg1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text1,
    letterSpacing: -0.06,
  },
  cancelBtn: {
    height: 44,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.accent,
  },
  countBar: {
    paddingHorizontal: theme.spacing.s5,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text2,
  },
  countBold: {
    fontWeight: '600',
    color: theme.colors.text1,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortBtnActive: {
    borderColor: theme.colors.accentDeep,
    backgroundColor: theme.colors.accentSoft,
  },
  dropdown: {
    position: 'absolute',
    minWidth: 190,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: theme.radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.divider,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  dropdownText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text1,
  },
  dropdownCancel: {
    color: '#E53935',
  },
  dropdownDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.divider,
    marginHorizontal: 14,
  },
  list: {
    paddingHorizontal: theme.spacing.s4,
    paddingTop: 12,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  gridCell: {
    flex: 1,
  },
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
    paddingBottom: NAV_TOTAL_HEIGHT,
  },
  stateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  stateBody: {
    fontSize: 15,
    color: theme.colors.text2,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
  },
  retryBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    height: 44,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.surface,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text1,
  },
  suggestions: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: theme.colors.bg1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
    ...theme.shadows.card,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: 14,
  },
  suggestionDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text1,
    letterSpacing: -0.06,
  },
});
