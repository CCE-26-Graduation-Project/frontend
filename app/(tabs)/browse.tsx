import React, { useState, useRef, useCallback } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ProductCard } from '../../components/ProductCard';
import { SnoopCharacter } from '../../components/SnoopCharacter';
import { AttachmentPreview } from '../../components/AttachmentPreview';
import { theme } from '../../constants/theme';
import type { Product } from '../../constants/data';
import { searchByText, searchByImage, searchMultimodal, enrichResults, ApiError, NetworkError } from '../../services';
import { useImageAttachment } from '../../hooks/useImageAttachment';

const NAV_TOTAL_HEIGHT = 114;

export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const { focusAt } = useLocalSearchParams<{ focusAt?: string }>();
  const lastFocusAt = useRef<string | undefined>(undefined);

  const [query, setQuery]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [products, setProducts]         = useState<Product[]>([]);
  const [searched, setSearched]         = useState('');
  const [error, setError]               = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const attachment                      = useImageAttachment();

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
  // "search" key and the retry button both include any attached photo.
  const runSearch = useCallback(async (text: string, imageUri: string | null = attachment.uri) => {
    const q = text.trim();
    const img = imageUri;
    if (!q && !img) return;
    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    setSearched(q || 'Visual search');
    try {
      const hits = img
        ? (q ? await searchMultimodal(q, img) : await searchByImage(img))
        : await searchByText(q);
      const cards = await enrichResults(hits);
      setProducts(cards);
    } catch (err) {
      setError(
        err instanceof NetworkError
          ? "Can't reach the server. Check your connection and that the API is running."
          : err instanceof ApiError
            ? (err as ApiError).message
            : 'Something went wrong while searching.',
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [attachment.uri]);

  const handleClear = () => {
    setQuery('');
    setError(null);
    inputRef.current?.focus();
  };

  // Attach a single photo, then immediately run the search (combined with any text
  // already typed). One tap = search by photo; type first to refine it.
  const handleAttach = useCallback(async () => {
    const picked = await attachment.pick();
    if (picked) runSearch(query, picked);
  }, [attachment, query, runSearch]);

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

  const showEmpty  = !loading && !error && searched && products.length === 0;
  const showResult = !loading && !error && products.length > 0;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg1 }]}>
      {/* ── Search bar ── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.inputRow}>
          <Feather name="search" size={18} color={theme.colors.text2} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search any product…"
            placeholderTextColor={theme.colors.text2}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => runSearch(query)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
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
            <Text style={styles.countBold}>{products.length}</Text>
            {products.length === 1 ? ' result' : ' results'} for{' '}
            <Text style={styles.countBold}>{searched}</Text>
          </Text>
        </View>
      )}

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
          <Text style={styles.stateBody}>Try a different word or check the spelling.</Text>
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
          data={products}
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
        />
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
  },
  countText: {
    fontSize: 14,
    color: theme.colors.text2,
  },
  countBold: {
    fontWeight: '600',
    color: theme.colors.text1,
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
});
