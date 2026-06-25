import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { SearchBar } from '../../components/SearchBar';
import { CategoryCard } from '../../components/CategoryCard';
import { TrendingCard } from '../../components/TrendingCard';
import { SnoopCharacter } from '../../components/SnoopCharacter';
import { theme } from '../../constants/theme';
import { CATEGORY_LIST } from '../../constants/data';
import type { Product } from '../../constants/data';
import { getTrending } from '../../services';

const NAV_TOTAL_HEIGHT = 114;

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'all-time';

const TIMEFRAME_TABS: { key: Timeframe; label: string }[] = [
  { key: 'all-time', label: 'All Time' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'daily', label: 'Daily' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [trending, setTrending] = useState<Product[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<Timeframe>('all-time');

  useEffect(() => {
    let cancelled = false;
    setTrendingLoading(true);
    getTrending(timeframe)
      .then((products) => { if (!cancelled) setTrending(products); })
      .catch(() => { if (!cancelled) setTrending([]); })
      .finally(() => { if (!cancelled) setTrendingLoading(false); });
    return () => { cancelled = true; };
  }, [timeframe]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg1 }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: NAV_TOTAL_HEIGHT + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          {Platform.OS === 'web' ? <View /> : <LogoWordmark />}
          <Pressable style={styles.iconBtn} hitSlop={8} onPress={() => router.push('/notifications')}>
            <Feather name="bell" size={20} color={theme.colors.text1} />
          </Pressable>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <View style={styles.greetingText}>
            <Text style={styles.greetingTitle}>Good morning, Alex.</Text>
            <Text style={styles.greetingBody}>What are you looking for today?</Text>
          </View>
          <SnoopCharacter expression="waving" size={84} />
        </View>

        {/* Search bar */}
        <View style={styles.searchWrapper}>
          <SearchBar onTap={() => router.push({ pathname: '/browse', params: { focusAt: String(Date.now()) } })} />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesRow}>
            {CATEGORY_LIST.map((c) => (
              <CategoryCard key={c.label} icon={c.icon} label={c.label} />
            ))}
          </View>
        </View>

        {/* Trending */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: theme.spacing.s5 }]}>Trending</Text>

          {/* Timeframe filter pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeframePills}
          >
            {TIMEFRAME_TABS.map((tab) => {
              const active = tab.key === timeframe;
              return (
                <Pressable
                  key={tab.key}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setTimeframe(tab.key)}
                  hitSlop={4}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {trendingLoading ? (
            <ActivityIndicator
              style={styles.trendingLoader}
              color={theme.colors.text2}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingList}
            >
              {trending.map((p) => (
                <TrendingCard
                  key={p.id}
                  product={p}
                  onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id, name: p.name, price: p.price, store: p.store, storeLogo: p.storeLogo, category: p.category ?? '', imageUrl: p.imageUrl ?? p.imageUrls?.[0] ?? '', imageUrls: JSON.stringify(p.imageUrls ?? []), productUrl: p.productUrl ?? '' } })}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function LogoWordmark() {
  return (
    <View style={logoStyles.row}>
      <Text style={logoStyles.text}>Snoop</Text>
    </View>
  );
}

const logoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  text: { fontSize: 22, fontWeight: '600', color: theme.colors.text1, letterSpacing: -0.4 },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  topBar: {
    height: 52,
    paddingHorizontal: theme.spacing.s4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.bg2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    paddingHorizontal: theme.spacing.s5,
    paddingVertical: theme.spacing.s2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  greetingText: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.3,
  },
  greetingBody: {
    fontSize: 17,
    color: theme.colors.text2,
    marginTop: 2,
    letterSpacing: -0.08,
  },
  searchWrapper: {
    paddingHorizontal: theme.spacing.s5,
    paddingTop: theme.spacing.s2,
    paddingBottom: theme.spacing.s5,
  },
  section: {
    paddingTop: theme.spacing.s1,
    paddingBottom: theme.spacing.s5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text1,
    letterSpacing: -0.24,
    marginBottom: 12,
    paddingHorizontal: theme.spacing.s5,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: theme.spacing.s5,
  },
  trendingList: {
    paddingHorizontal: theme.spacing.s5,
    gap: 12,
    flexDirection: 'row',
  },
  trendingLoader: {
    marginTop: 24,
    alignSelf: 'center',
  },
  timeframePills: {
    paddingHorizontal: theme.spacing.s5,
    gap: 8,
    flexDirection: 'row',
    marginBottom: 12,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.bg2,
  },
  pillActive: {
    backgroundColor: theme.colors.accentDeep,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text2,
    letterSpacing: -0.04,
  },
  pillTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
});
