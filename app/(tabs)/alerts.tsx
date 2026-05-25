import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SnoopCharacter } from '../../components/SnoopCharacter';
import { theme } from '../../constants/theme';
import { NOTIFICATIONS } from '../../constants/data';

const NAV_TOTAL_HEIGHT = 114;

export default function AlertsScreen() {
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
          <Text style={styles.title}>Alerts</Text>
          <Pressable hitSlop={8}>
            <Text style={styles.markAll}>Mark all read</Text>
          </Pressable>
        </View>

        {/* Notifications */}
        <View style={styles.list}>
          {NOTIFICATIONS.map((n) => (
            <Pressable
              key={n.id}
              style={[styles.item, n.unread && styles.itemUnread]}
            >
              <View style={styles.avatar}>
                <SnoopCharacter expression={n.expression} size={56} />
              </View>
              <View style={styles.itemContent}>
                <View style={styles.itemTitle}>
                  <Text style={styles.itemTitleText} numberOfLines={1}>{n.title}</Text>
                  {n.unread && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.itemBody} numberOfLines={2}>{n.body}</Text>
              </View>
              <Text style={styles.time}>{n.time}</Text>
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
  markAll: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text1,
  },
  list: {
    paddingHorizontal: theme.spacing.s4,
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 14,
  },
  itemUnread: {
    backgroundColor: theme.colors.bg2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.bg1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  itemTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemTitleText: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text1,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.text1,
    flexShrink: 0,
  },
  itemBody: {
    fontSize: 15,
    color: theme.colors.text2,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: theme.colors.text2,
    flexShrink: 0,
    marginTop: 2,
  },
});
