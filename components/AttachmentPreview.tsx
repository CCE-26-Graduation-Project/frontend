import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface AttachmentPreviewProps {
  uri: string;
  onRemove: () => void;
}

/**
 * Compact chip showing the single attached search image with a remove button.
 * Rendered just below the search bar on app/(tabs)/browse.tsx and app/search.tsx.
 */
export function AttachmentPreview({ uri, onRemove }: AttachmentPreviewProps) {
  return (
    <View style={styles.chip}>
      <Image source={{ uri }} style={styles.thumb} />
      <Text style={styles.label} numberOfLines={1}>Image attached</Text>
      <Pressable onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
        <Feather name="x" size={14} color={theme.colors.text2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.bg2,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.colors.divider,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text1,
    letterSpacing: -0.06,
    maxWidth: 160,
  },
  removeBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
