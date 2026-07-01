import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

const NAV_TOTAL_HEIGHT = 114;

type NotifType = 'price_drop' | 'back_in_stock' | 'deal' | 'info';

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const ICON: Record<NotifType, { name: React.ComponentProps<typeof Feather>['name']; color: string; bg: string }> = {
  price_drop:    { name: 'trending-down', color: theme.colors.savings,   bg: theme.colors.savingsSoft },
  back_in_stock: { name: 'refresh-cw',   color: theme.colors.accentDeep, bg: theme.colors.accentSoft },
  deal:          { name: 'zap',           color: '#E07A5F',               bg: 'rgba(224,122,95,0.12)' },
  info:          { name: 'info',          color: theme.colors.text2,      bg: theme.colors.bg2 },
};

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const [notifs, setNotifs] = useState<Notif[]>([]);

  const unreadCount = notifs.filter((n) => !n.read).length;

  function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg1 }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>Alerts</Text>
        {unreadCount > 0 && (
          <Pressable onPress={markAllRead} hitSlop={8}>
            <Text style={styles.markAll}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount} unread</Text>
        </View>
      )}

      {notifs.length === 0 ? (
        <View style={[styles.emptyState, { paddingBottom: NAV_TOTAL_HEIGHT }]}>
          <Feather name="bell-off" size={48} color={theme.colors.text2} />
          <Text style={styles.emptyTitle}>No alerts yet</Text>
          <Text style={styles.emptyBody}>
            Save products to your favourites and we'll notify you when their prices drop.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: NAV_TOTAL_HEIGHT + 24 }]}
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
                <View style={[styles.iconWrap, { backgroundColor: ic.bg }]}>
                  <Feather name={ic.name} size={18} color={ic.color} />
                </View>
                <View style={styles.content}>
                  <Text style={[styles.notifTitle, n.read && styles.notifTitleRead]}>
                    {n.title}
                  </Text>
                  <Text style={styles.notifBody} numberOfLines={2}>
                    {n.body}
                  </Text>
                  <Text style={styles.time}>{n.time}</Text>
                </View>
                {!n.read && <View style={styles.dot} />}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.s4,
    paddingBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.3,
  },
  markAll: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.accentDeep,
  },
  badge: {
    marginHorizontal: theme.spacing.s4,
    marginBottom: 8,
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
    paddingTop: 4,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.3,
    marginTop: 8,
  },
  emptyBody: {
    fontSize: 15,
    color: theme.colors.text2,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
