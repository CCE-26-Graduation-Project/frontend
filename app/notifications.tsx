import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { theme } from '../constants/theme';

type NotifType = 'price_drop' | 'back_in_stock' | 'deal' | 'info';

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL: Notif[] = [
  {
    id: '1',
    type: 'price_drop',
    title: 'Price drop — Nike Air Max 270',
    body: 'Dropped from EGP 4,200 to EGP 3,150 at FootLocker Egypt.',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'deal',
    title: 'Flash deal — Samsung 65" QLED',
    body: '24-hour deal at Noon. Save up to 35% while stock lasts.',
    time: '1 hr ago',
    read: false,
  },
  {
    id: '3',
    type: 'back_in_stock',
    title: 'Back in stock — Sony WH-1000XM5',
    body: 'Now available again on Amazon Egypt. Price: EGP 8,499.',
    time: '3 hr ago',
    read: false,
  },
  {
    id: '4',
    type: 'price_drop',
    title: 'Price drop — Dyson V12 Vacuum',
    body: 'Down EGP 600 at Carrefour Egypt. New price: EGP 7,999.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '5',
    type: 'info',
    title: 'Welcome to Snoop!',
    body: 'We track prices across 47 stores so you never overpay.',
    time: '2 days ago',
    read: true,
  },
];

const ICON: Record<NotifType, { name: React.ComponentProps<typeof Feather>['name']; color: string; bg: string }> = {
  price_drop:    { name: 'trending-down', color: theme.colors.savings,  bg: theme.colors.savingsSoft },
  back_in_stock: { name: 'refresh-cw',   color: theme.colors.accentDeep, bg: theme.colors.accentSoft },
  deal:          { name: 'zap',           color: '#E07A5F',              bg: 'rgba(224,122,95,0.12)' },
  info:          { name: 'info',          color: theme.colors.text2,     bg: theme.colors.bg2 },
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL);

  const unreadCount = notifs.filter((n) => !n.read).length;

  function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={theme.colors.text1} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 ? (
          <Pressable onPress={markAllRead} hitSlop={8}>
            <Text style={styles.markAll}>Mark all read</Text>
          </Pressable>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount} unread</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {notifs.map((n) => {
          const ic = ICON[n.type];
          return (
            <Pressable
              key={n.id}
              style={[styles.card, n.read && styles.cardRead]}
              onPress={() => markRead(n.id)}
            >
              {/* Icon */}
              <View style={[styles.iconWrap, { backgroundColor: ic.bg }]}>
                <Feather name={ic.name} size={18} color={ic.color} />
              </View>

              {/* Text */}
              <View style={styles.content}>
                <Text style={[styles.notifTitle, n.read && styles.notifTitleRead]}>
                  {n.title}
                </Text>
                <Text style={styles.notifBody} numberOfLines={2}>
                  {n.body}
                </Text>
                <Text style={styles.time}>{n.time}</Text>
              </View>

              {/* Unread dot */}
              {!n.read && <View style={styles.dot} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.s4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.2,
  },
  markAll: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.accentDeep,
    width: 80,
    textAlign: 'right',
  },
  badge: {
    marginHorizontal: theme.spacing.s4,
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.accentDeep,
  },
  list: {
    paddingHorizontal: theme.spacing.s4,
    paddingTop: 12,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: 14,
    ...theme.shadows.card,
  },
  cardRead: {
    backgroundColor: theme.colors.bg1,
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.divider,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.1,
  },
  notifTitleRead: {
    fontWeight: '500',
    color: theme.colors.text2,
  },
  notifBody: {
    fontSize: 13,
    color: theme.colors.text2,
    lineHeight: 18,
  },
  time: {
    fontSize: 12,
    color: theme.colors.text2,
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accentDeep,
    marginTop: 4,
    flexShrink: 0,
  },
});
