import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { theme } from '../constants/theme';

interface Props {
  label: string;
  onRemove?: () => void;
  onPress?: () => void;
}

export function RecentChip({ label, onRemove, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.chip}>
      <Icon name="clock" size={14} color={theme.colors.text2} />
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <Pressable onPress={onRemove} hitSlop={8}>
        <Icon name="close" size={14} color={theme.colors.text2} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.bg2,
    flexShrink: 0,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '400',
    color: theme.colors.text1,
  },
});
