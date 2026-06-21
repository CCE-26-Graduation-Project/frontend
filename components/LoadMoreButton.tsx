import React from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../constants/theme';

/**
 * "Load more" button shown at the bottom of a paginated result list.
 * Driven by usePaginatedSearch: pass `loading` while the next page is in flight and
 * `error` when the last page failed (the label then becomes a tap-to-retry).
 */
interface Props {
  onPress: () => void;
  loading: boolean;
  error?: boolean;
}

export function LoadMoreButton({ onPress, loading, error }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.button, error && styles.buttonError, pressed && styles.pressed]}
        onPress={onPress}
        disabled={loading}
        hitSlop={6}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.text1} />
        ) : (
          <>
            <Feather
              name={error ? 'refresh-cw' : 'chevron-down'}
              size={16}
              color={theme.colors.text1}
            />
            <Text style={styles.label}>{error ? 'Couldn’t load more — tap to retry' : 'Load more'}</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 160,
    height: 48,
    paddingHorizontal: 24,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.rest,
  },
  buttonError: {
    borderColor: theme.colors.accentDeep,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text1,
    letterSpacing: -0.05,
  },
});
