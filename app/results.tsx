import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ProductCard } from '../components/ProductCard';
import { ProductListCard } from '../components/ProductListCard';
import { SnoopCharacter } from '../components/SnoopCharacter';
import { theme } from '../constants/theme';
import type { Product, ListProduct } from '../constants/data';
// Backend service layer — see frontend/services. searchByText / searchByImage both hit
// POST /api/public/search; enrichResults turns the returned IDs+scores into cards.
import { searchByText, searchByImage, searchMultimodal, enrichResults, ApiError, NetworkError } from '../services';
import { useFavourites } from '../contexts/FavouritesContext';

type ViewMode = 'grid' | 'list';

const NAV_TOTAL_HEIGHT = 114;

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  // `query` drives a text search; `imageUri` (set by the camera screen) drives an
  // image search. Exactly one is normally present.
  const { query = '', imageUri = '' } = useLocalSearchParams<{ query?: string; imageUri?: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Bump this to re-run the search (used by the "Try again" buttons).
  const [reloadKey, setReloadKey] = useState(0);
  const { seedFavourites } = useFavourites();

  // ── Live backend search ──────────────────────────────────────────────────────
  // Runs whenever the query (or reloadKey) changes.
  //   searchByText(query)  → POST /api/public/search           (services/search.ts)
  //   enrichResults(hits)  → {productId, similarity}[] → cards (services/products.ts)
  // `cancelled` guards against setting state after the screen unmounts or the query
  // changes mid-flight (avoids a stale response overwriting a newer one).
  useEffect(() => {
    let cancelled = false;
    const q = ((query as string) ?? '').trim();
    const img = ((imageUri as string) ?? '').trim();

    async function run() {
      if (!q && !img) {
        setProducts([]);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Pick the search mode from what was provided: image + text → multimodal,
        // image only → image search, text only → text search.
        const hits = img
          ? (q ? await searchMultimodal(q, img) : await searchByImage(img))
          : await searchByText(q);
        const cards = await enrichResults(hits);
        if (!cancelled) {
          setProducts(cards);
          // Pre-seed the favourites context with products the backend already marked
          // as saved, so heart icons reflect the correct state immediately.
          seedFavourites(cards);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof NetworkError
              ? 'Can’t reach the server. Check your connection and that the API is running.'
              : err instanceof ApiError
                ? err.message
                : 'Something went wrong while searching.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [query, imageUri, reloadKey]);

  const retry = () => setReloadKey((k) => k + 1);
  const hasResults = products.length > 0;
  // What to show in the top search pill / banner. When a photo was attached alongside
  // text, show the text; a photo-only search shows "Visual search".
  const searchLabel = imageUri ? ((query as string)?.trim() || 'Visual search') : (query as string);

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg1 }]}>
      {/* Search top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={theme.colors.text1} />
        </Pressable>
        <Pressable
          style={styles.searchPill}
          onPress={() => router.push('/search')}
        >
          <Feather name={imageUri ? 'camera' : 'search'} size={18} color={theme.colors.text2} />
          <Text style={styles.searchQuery} numberOfLines={1}>{searchLabel}</Text>
        </Pressable>
        <Pressable style={styles.iconBtn} hitSlop={8}>
          <Feather name="sliders" size={20} color={theme.colors.text1} />
        </Pressable>
        <Pressable style={styles.iconBtn} hitSlop={8}>
          <Feather name="bar-chart-2" size={20} color={theme.colors.text1} />
        </Pressable>
      </View>

      {/* View toggle */}
      <View style={styles.toolbar}>
        <View style={styles.viewToggle}>
          {(['grid', 'list'] as ViewMode[]).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setViewMode(mode)}
              style={[styles.toggleBtn, viewMode === mode && styles.toggleBtnActive]}
            >
              <Feather
                name={mode === 'grid' ? 'grid' : 'list'}
                size={16}
                color={viewMode === mode ? theme.colors.text1 : theme.colors.text2}
              />
            </Pressable>
          ))}
        </View>
      </View>

      {loading ? (
        <LoadingState query={searchLabel} />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : !hasResults ? (
        <NoResultsState query={searchLabel} onRetry={retry} />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.results,
            { paddingBottom: NAV_TOTAL_HEIGHT + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Echo what the backend actually searched for */}
          <View style={styles.typoBar}>
            <Text style={styles.typoText}>
              Showing results for <Text style={styles.typoBold}>{searchLabel}</Text>
            </Text>
          </View>

          {/* Real count from the backend response */}
          <Text style={styles.countText}>
            {products.length} {products.length === 1 ? 'result' : 'results'}
          </Text>

          {viewMode === 'grid' ? (
            <View style={styles.grid}>
              {products.map((product) => (
                <View key={product.id} style={styles.gridCell}>
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
              ))}
            </View>
          ) : (
            <View style={styles.listView}>
              {products.map((product) => (
                <ProductListCard
                  key={product.id}
                  product={toListProduct(product)}
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
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function LoadingState({ query }: { query: string }) {
  return (
    <ScrollView contentContainerStyle={styles.stateContainer}>
      <SnoopCharacter expression="thinking" size={160} />
      <Text style={styles.stateTitle}>Finding deals…</Text>
      <Text style={styles.stateBody}>
        Searching across 47 stores. This usually takes about a second.
      </Text>
      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.dot} />
        ))}
      </View>
      {/* Skeleton cards */}
      <View style={[styles.listView, { marginTop: 24, width: '100%' }]}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.skeletonCard}>
            <View style={styles.skeletonImg} />
            <View style={styles.skeletonLines}>
              <View style={[styles.skeletonLine, { width: '85%' }]} />
              <View style={[styles.skeletonLine, { width: '55%', height: 12 }]} />
              <View style={[styles.skeletonLine, { width: '35%', height: 16 }]} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function NoResultsState({ query, onRetry }: { query: string; onRetry: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.stateContainer}>
      <SnoopCharacter expression="surprised" size={180} />
      <Text style={styles.stateTitle}>Nothing found.</Text>
      <Text style={styles.stateBody}>
        I couldn't match that. Try a different word or check the spelling.
      </Text>
      <View style={styles.actionRow}>
        <Pressable style={styles.secondaryBtn} onPress={onRetry}>
          <Feather name="refresh-cw" size={16} color={theme.colors.text1} />
          <Text style={styles.secondaryBtnText}>Try again</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => router.push('/search')}>
          <Feather name="search" size={16} color={theme.colors.text1} />
          <Text style={styles.secondaryBtnText}>New search</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// Shown when the backend call fails (server down, network error, or API error).
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.stateContainer}>
      <SnoopCharacter expression="surprised" size={160} />
      <Text style={styles.stateTitle}>Search failed</Text>
      <Text style={styles.stateBody}>{message}</Text>
      <View style={styles.actionRow}>
        <Pressable style={styles.secondaryBtn} onPress={onRetry}>
          <Feather name="refresh-cw" size={16} color={theme.colors.text1} />
          <Text style={styles.secondaryBtnText}>Try again</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// Adapt a search result Product to the list-card shape.
// specs stays empty until the backend exposes per-product spec data.
function toListProduct(p: Product): ListProduct {
  return {
    id: p.id,
    name: p.name,
    specs: '',
    priceRange: p.price,
    topStores: [p.store],
    stores: p.store,
    tone: p.tone,
  };
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    paddingHorizontal: theme.spacing.s4,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchPill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.bg2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchQuery: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text1,
    letterSpacing: -0.06,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.bg2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.s5,
    paddingTop: 4,
  },
  viewToggle: {
    flexDirection: 'row',
    padding: 3,
    backgroundColor: theme.colors.bg2,
    borderRadius: 10,
    gap: 0,
  },
  toggleBtn: {
    padding: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: theme.colors.white,
    ...theme.shadows.rest,
  },
  results: {
    flexGrow: 1,
  },
  typoBar: {
    marginHorizontal: theme.spacing.s4,
    marginTop: 10,
    padding: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.compact,
    backgroundColor: theme.colors.bg2,
  },
  typoText: {
    fontSize: 15,
    color: theme.colors.text2,
  },
  typoBold: {
    fontWeight: '600',
    color: theme.colors.text1,
  },
  countText: {
    fontSize: 15,
    color: theme.colors.text2,
    paddingHorizontal: theme.spacing.s5,
    paddingTop: 10,
    paddingBottom: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.s4,
    gap: 12,
  },
  gridCell: {
    width: '47%',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 140,
  },
  listView: {
    paddingHorizontal: theme.spacing.s4,
    gap: 10,
  },
  stateContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 40,
    gap: 12,
  },
  stateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.3,
    marginTop: 4,
  },
  stateBody: {
    fontSize: 17,
    color: theme.colors.text2,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.text1,
    opacity: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 20,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.white,
    ...theme.shadows.rest,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text1,
    letterSpacing: -0.05,
  },
  skeletonCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    ...theme.shadows.card,
  },
  skeletonImg: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: theme.colors.bg2,
    flexShrink: 0,
  },
  skeletonLines: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  skeletonLine: {
    height: 14,
    borderRadius: 4,
    backgroundColor: theme.colors.bg2,
  },
});
