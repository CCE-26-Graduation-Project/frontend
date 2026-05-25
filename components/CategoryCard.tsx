import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { theme } from '../constants/theme';

interface Props {
  icon: string;
  label: string;
  onPress?: () => void;
}

export function CategoryCard({ icon, label, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.wrapper}>
      <View style={styles.iconBox}>
        <Icon name={icon as IconName} size={28} color={theme.colors.text1} />
      </View>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  iconBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.bg2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text1,
    textAlign: 'center',
  },
});
