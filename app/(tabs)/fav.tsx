import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ProductCard } from '../../components/ProductCard';
import { SnoopCharacter } from '../../components/SnoopCharacter';
import { theme } from '../../constants/theme';
import { useFavourites } from '../../contexts/FavouritesContext';

const NAV_TOTAL_HEIGHT = 114;

export default function FavScreen() {
  const insets = useSafeAreaInsets();
  const { favourites, isAuthenticated } = useFavourites();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg1 }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: NAV_TOTAL_HEIGHT + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Text style={styles.title}>Favourites</Text>
        </View>

        {/* Warning banner — shown whenever the user is not signed in */}
        {!isAuthenticated && (
          <Pressable
            style={styles.authBanner}
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityRole="button"
          >
            <Feather name="alert-triangle" size={16} color="#92400E" />
            <View style={styles.authBannerTextWrap}>
              <Text style={styles.authBannerText}>
                Favourites will be lost when you close the app.{' '}
              </Text>
              <Text style={styles.authBannerLink}>Log in to save your changes.</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#92400E" />
          </Pressable>
        )}

        {favourites.length === 0 ? (
          <View style={styles.emptyState}>
            <SnoopCharacter expression="thinking" size={140} />
            <Text style={styles.emptyTitle}>No favourites yet</Text>
            <Text style={styles.emptyBody}>
              Tap the heart on any product to add it to your favourites.
            </Text>
            <Pressable style={styles.searchBtn} onPress={() => router.push({ pathname: '/(tabs)/browse', params: { focusAt: String(Date.now()) } })}>
              <Feather name="search" size={16} color="#fff" />
              <Text style={styles.searchBtnText}>Start searching</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              {favourites.length} {favourites.length === 1 ? 'item' : 'items'} saved
            </Text>
            <View style={styles.grid}>
              {favourites.map((product) => (
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
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1 },
  topBar: {
    height: 52,
    paddingHorizontal: theme.spacing.s4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.3,
  },
  // ── Auth warning banner ────────────────────────────────────────────────────
  authBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: theme.spacing.s4,
    marginBottom: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: theme.radius.compact,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  authBannerTextWrap: {
    flex: 1,
  },
  authBannerText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
  authBannerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    lineHeight: 18,
  },

  // ── Results ────────────────────────────────────────────────────────────────
  subtitle: {
    fontSize: 15,
    color: theme.colors.text2,
    paddingHorizontal: theme.spacing.s5,
    marginBottom: theme.spacing.s2,
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

  // ── Empty state ────────────────────────────────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.3,
    marginTop: 4,
  },
  emptyBody: {
    fontSize: 16,
    color: theme.colors.text2,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
  },
  searchBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 24,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.text1,
  },
  searchBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.05,
  },
});
