import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { theme } from '../constants/theme';

interface Props {
  name: string;
  websiteUrl: string;
}

function domainLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function VendorCard({ name, websiteUrl }: Props) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <Pressable
      style={styles.card}
      onPress={() => Linking.openURL(websiteUrl)}
    >
      <View style={styles.avatar}>
        <Text style={styles.initial}>{initial}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      <Text style={styles.url} numberOfLines={1}>{domainLabel(websiteUrl)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 96,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.bg2,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.accentSoft,
    borderWidth: 1.5,
    borderColor: theme.colors.accentDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.accentDeep,
    letterSpacing: -0.3,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text1,
    textAlign: 'center',
    letterSpacing: -0.04,
  },
  url: {
    fontSize: 11,
    color: theme.colors.text2,
    textAlign: 'center',
  },
});
