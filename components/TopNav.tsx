import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { theme } from '../constants/theme';

/**
 * TopNav — WEB ONLY top navigation bar.
 *
 * Rendered by app/(tabs)/_layout.tsx exclusively when Platform.OS === 'web'
 * (native keeps components/BottomNav.tsx). The camera tab is intentionally
 * omitted on web — image capture is a native-only feature.
 *
 * Unlike BottomNav (which receives tab navigator props), this lives above the
 * <Tabs> in the layout tree, so it drives navigation through expo-router's
 * `router` + `usePathname` instead of the bottom-tab navigation prop.
 */

const MAX_WIDTH = 1100; // centered content cap so the bar doesn't sprawl on wide screens
const NAV_HEIGHT = 64;

type NavItem = {
  href: '/' | '/browse' | '/fav' | '/profile';
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
};

// NOTE: 'camera' is deliberately absent here — removed on web per platform requirement.
const ITEMS: NavItem[] = [
  { href: '/',       icon: 'home',   label: 'Home' },
  { href: '/browse', icon: 'search', label: 'Search' },
  { href: '/fav',  icon: 'heart',  label: 'Favourites' },
  { href: '/profile', icon: 'user',  label: 'Profile' },
];

export function TopNav() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const compact = width < 640; // tighten spacing on narrow (mobile) browser widths

  return (
    // role="navigation" → renders as a <nav> landmark on web.
    <View style={styles.bar} role="navigation">
      <View style={[styles.inner, { paddingHorizontal: compact ? 16 : 28 }]}>
        {/* Brand → Home */}
        <Pressable
          onPress={() => router.navigate('/')}
          accessibilityRole="link"
          accessibilityLabel="Snoop home"
          style={styles.brandBtn}
        >
          <Text style={styles.brand}>Snoop</Text>
        </Pressable>

        {/* Nav items */}
        <View style={[styles.navRow, { gap: compact ? 2 : 6 }]}>
          {ITEMS.map((item) => {
            // index route is '/'; others match exactly.
            const isActive = pathname === item.href;
            return (
              <Pressable
                key={item.href}
                onPress={() => router.navigate(item.href)}
                accessibilityRole="link"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: isActive }}
                // RNW exposes hovered/focused/pressed at runtime; RN's types only
                // declare `pressed`, so we widen the type to read the web-only flags.
                style={(state) => {
                  const s = state as { hovered?: boolean; pressed?: boolean; focused?: boolean };
                  return [
                    styles.item,
                    { paddingHorizontal: compact ? 10 : 14 },
                    s.hovered && styles.itemHover,
                    s.pressed && styles.itemPressed,
                    s.focused && styles.itemFocused,
                  ];
                }}
              >
                <View style={styles.itemRow}>
                  <Feather
                    name={item.icon}
                    size={18}
                    color={isActive ? theme.colors.text1 : theme.colors.text2}
                  />
                  {/* Hide labels on very narrow screens to avoid crowding */}
                  {!compact && (
                    <Text style={[styles.label, isActive && styles.labelActive]}>
                      {item.label}
                    </Text>
                  )}
                </View>
                {/* Active underline — second indicator so color isn't the only cue */}
                <View style={[styles.underline, isActive && styles.underlineActive]} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: NAV_HEIGHT,
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
    flexDirection: 'row',
    justifyContent: 'center', // centers the max-width inner container
    zIndex: 20, // defined scale (10/20/30/50), not an arbitrary value
    ...theme.shadows.rest,
  },
  inner: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandBtn: {
    paddingVertical: 8,
    paddingRight: 12,
  },
  brand: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.text1,
    letterSpacing: -0.4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    height: 44, // ≥44px touch target
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemHover: {
    backgroundColor: theme.colors.bg2,
  },
  itemPressed: {
    opacity: 0.7,
  },
  itemFocused: {
    // Visible keyboard-focus ring.
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text2,
    letterSpacing: -0.06,
  },
  labelActive: {
    color: theme.colors.text1,
    fontWeight: '600',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: 22,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  underlineActive: {
    backgroundColor: theme.colors.accent,
  },
});
