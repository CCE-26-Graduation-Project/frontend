import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ProductCard } from '../../components/ProductCard';
import { theme } from '../../constants/theme';
import { RESULTS_GRID } from '../../constants/data';

const NAV_TOTAL_HEIGHT = 114;
const SAVED_ITEMS = RESULTS_GRID.slice(0, 4).map((p) => ({ ...p, saved: true }));

export default function SavedScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg1 }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: NAV_TOTAL_HEIGHT + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.title}>Saved</Text>
          <View style={styles.topBarRight}>
            <Pressable style={styles.iconBtn} hitSlop={8}>
              <Feather name="grid" size={18} color={theme.colors.text1} />
            </Pressable>
            <Pressable style={styles.iconBtn} hitSlop={8}>
              <Feather name="sliders" size={18} color={theme.colors.text1} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.subtitle}>4 saved · last updated 2h ago</Text>

        {/* Product grid */}
        <View style={styles.grid}>
          {SAVED_ITEMS.map((product) => (
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
  topBarRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.bg2,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
});
