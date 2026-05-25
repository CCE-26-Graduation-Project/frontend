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
import { RESULTS_GRID, RESULTS_LIST } from '../constants/data';

type ViewMode = 'grid' | 'list';

const NAV_TOTAL_HEIGHT = 114;

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const { query = 'iPhone 15 Pro' } = useLocalSearchParams<{ query?: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  const hasResults = true; // toggle to false to show empty state

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
          <Feather name="search" size={18} color={theme.colors.text2} />
          <Text style={styles.searchQuery} numberOfLines={1}>{query}</Text>
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
        <LoadingState query={query as string} />
      ) : !hasResults ? (
        <NoResultsState query={query as string} />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.results,
            { paddingBottom: NAV_TOTAL_HEIGHT + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Typo correction banner */}
          <View style={styles.typoBar}>
            <Text style={styles.typoText}>
              Showing results for <Text style={styles.typoBold}>{query}</Text>
            </Text>
          </View>

          <Text style={styles.countText}>
            {viewMode === 'grid' ? '2,340 results across 47 stores' : '412 results across 31 stores'}
          </Text>

          {viewMode === 'grid' ? (
            <View style={styles.grid}>
              {RESULTS_GRID.map((product) => (
                <View key={product.id} style={styles.gridCell}>
                  <ProductCard
                    product={product}
                    onPress={() =>
                      router.push({ pathname: '/product/[id]', params: { id: product.id } })
                    }
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.listView}>
              {RESULTS_LIST.map((product) => (
                <ProductListCard
                  key={product.id}
                  product={product}
                  onPress={() =>
                    router.push({ pathname: '/product/[id]', params: { id: product.id } })
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

function NoResultsState({ query }: { query: string }) {
  return (
    <ScrollView contentContainerStyle={styles.stateContainer}>
      <SnoopCharacter expression="surprised" size={180} />
      <Text style={styles.stateTitle}>Nothing found.</Text>
      <Text style={styles.stateBody}>
        I checked 47 stores but couldn't match that. Try a different word or check the spelling.
      </Text>
      <View style={styles.actionRow}>
        <Pressable style={styles.secondaryBtn} onPress={() => {}}>
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
