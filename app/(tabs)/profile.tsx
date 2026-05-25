import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { SnoopCharacter } from '../../components/SnoopCharacter';
import { theme } from '../../constants/theme';

const NAV_TOTAL_HEIGHT = 114;

const MENU_ITEMS = [
  { icon: 'bell' as const, label: 'Price alert settings' },
  { icon: 'bookmark' as const, label: 'Saved products' },
  { icon: 'globe' as const, label: 'Preferred stores' },
  { icon: 'star' as const, label: 'Snoop Plus' },
  { icon: 'user' as const, label: 'Account' },
];

export default function ProfileScreen() {
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
        <View style={styles.topBar}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Avatar + name */}
        <View style={styles.hero}>
          <View style={styles.avatarRing}>
            <SnoopCharacter expression="happy" size={80} />
          </View>
          <Text style={styles.name}>Alex</Text>
          <Text style={styles.email}>alex@example.com</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[['4', 'Saved'], ['47', 'Stores checked'], ['3', 'Alerts set']].map(([val, lbl]) => (
            <View key={lbl} style={styles.stat}>
              <Text style={styles.statVal}>{val}</Text>
              <Text style={styles.statLbl}>{lbl}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item, i) => (
            <Pressable key={item.label} style={[styles.menuRow, i < MENU_ITEMS.length - 1 && styles.menuDivider]}>
              <View style={styles.menuIcon}>
                <Feather name={item.icon} size={18} color={theme.colors.text1} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={18} color={theme.colors.text2} />
            </Pressable>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.3,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: theme.spacing.s6,
    gap: 8,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.bg2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.26,
  },
  email: {
    fontSize: 15,
    color: theme.colors.text2,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.s4,
    backgroundColor: theme.colors.bg2,
    borderRadius: theme.radius.card,
    paddingVertical: theme.spacing.s4,
    marginBottom: theme.spacing.s5,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statVal: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.26,
  },
  statLbl: {
    fontSize: 12,
    color: theme.colors.text2,
    textAlign: 'center',
  },
  menu: {
    marginHorizontal: theme.spacing.s4,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    ...theme.shadows.rest,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.s4,
    minHeight: 44,
    gap: 12,
  },
  menuDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.compact,
    backgroundColor: theme.colors.bg2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 17,
    color: theme.colors.text1,
    letterSpacing: -0.08,
  },
});
