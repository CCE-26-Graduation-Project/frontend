import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Icon } from './Icon';
import { theme } from '../constants/theme';

interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onTap?: () => void;
  onCameraPress?: () => void;
  onAttachPress?: () => void;
  focused?: boolean;
  showIcons?: boolean;
}

export function SearchBar({
  value = '',
  placeholder = 'Search any product…',
  onTap,
  onCameraPress,
  onAttachPress,
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
        <View style={styles.iconRow}>
          <Pressable onPress={onAttachPress} hitSlop={8}>
            <Feather name="paperclip" size={19} color={theme.colors.text1} />
          </Pressable>
          <Pressable onPress={onCameraPress} hitSlop={8}>
            <Icon name="camera" size={20} color={theme.colors.text1} />
          </Pressable>
        </View>
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
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
