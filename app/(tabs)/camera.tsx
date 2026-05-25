import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../../constants/theme';

const NAV_TOTAL_HEIGHT = 114;

export default function CameraScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Close button */}
      <Pressable
        onPress={() => router.back()}
        style={[styles.closeBtn, { top: insets.top + 16 }]}
        hitSlop={8}
      >
        <Feather name="x" size={22} color={theme.colors.text1} />
      </Pressable>

      {/* Viewfinder placeholder */}
      <View style={styles.viewfinder}>
        <View style={styles.reticle} />
        <Text style={styles.hint}>Point your camera at a product or barcode</Text>
      </View>

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: NAV_TOTAL_HEIGHT + 8 }]}>
        <Text style={styles.orText}>or search by text</Text>
        <Pressable
          style={styles.textSearchBtn}
          onPress={() => router.push('/search')}
        >
          <Feather name="search" size={18} color={theme.colors.surface} />
          <Text style={styles.textSearchLabel}>Search by name</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  reticle: {
    width: 240,
    height: 240,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    opacity: 0.7,
  },
  hint: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  controls: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
  },
  orText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  textSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.accentDeep,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
  },
  textSearchLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.surface,
    letterSpacing: -0.08,
  },
});
