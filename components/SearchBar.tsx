import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Icon } from './Icon';
import { theme } from '../constants/theme';

interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onTap?: () => void;
  focused?: boolean;
  showIcons?: boolean;
}

export function SearchBar({
  value = '',
  placeholder = 'Search any product…',
  onTap,
  focused = false,
  showIcons = true,
}: SearchBarProps) {
  return (
    <Pressable
      onPress={onTap}
      style={[
        styles.container,
        focused ? styles.focused : styles.resting,
      ]}
    >
      <Icon name="search" size={20} color={theme.colors.text2} />
      <Text
        style={[styles.text, { color: value ? theme.colors.text1 : theme.colors.text2 }]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      {showIcons && (
        <>
          <Icon name="mic" size={20} color={theme.colors.text1} />
          <Icon name="camera" size={20} color={theme.colors.text1} />
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s4,
    gap: 10,
  },
  resting: {
    backgroundColor: theme.colors.bg2,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...theme.shadows.rest,
  },
  focused: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.accent,
    ...theme.shadows.card,
  },
  text: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.08,
  },
});
