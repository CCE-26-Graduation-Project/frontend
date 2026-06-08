import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../constants/theme';

const NAV_TOTAL_HEIGHT = 114;

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  // Prevents double-launches while a picker/camera dialog is open.
  const [busy, setBusy] = useState(false);

  // ── Image search entry point ─────────────────────────────────────────────────
  // Hands a local image URI to the results screen, which runs
  // searchByImage(uri) → POST /api/public/search (img_emb) → enrichResults → cards.
  // (see app/results.tsx and services/search.ts)
  function runImageSearch(uri: string) {
    router.push({ pathname: '/results', params: { imageUri: uri } });
  }

  // Capture a fresh photo with the device camera.
  async function handleTakePhoto() {
    if (busy) return;
    setBusy(true);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Camera permission needed',
          'Enable camera access in Settings to search by photo.',
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'], // expo-image-picker v16+ API (array of strings)
        quality: 0.7, // smaller upload → faster embedding
        allowsEditing: true, // let the user crop to the product
      });
      // result.canceled === true when the user backs out.
      if (!result.canceled && result.assets[0]?.uri) {
        runImageSearch(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Couldn’t open the camera', 'Please try again, or pick from your gallery.');
    } finally {
      setBusy(false);
    }
  }

  // Pick an existing photo from the gallery.
  async function handlePickFromGallery() {
    if (busy) return;
    setBusy(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Photos permission needed',
          'Enable photo access in Settings to search from your gallery.',
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        runImageSearch(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Couldn’t open your gallery', 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

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

      {/* Viewfinder — tapping it opens the camera */}
      <Pressable style={styles.viewfinder} onPress={handleTakePhoto} disabled={busy}>
        <View style={styles.reticle}>
          {busy && <ActivityIndicator color={theme.colors.surface} />}
        </View>
        <Text style={styles.hint}>
          {busy ? 'Opening…' : 'Tap to photograph a product, then I’ll find it'}
        </Text>
      </Pressable>

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: NAV_TOTAL_HEIGHT + 8 }]}>
        {/* Shutter — primary capture action */}
        <Pressable
          style={({ pressed }) => [styles.shutterOuter, pressed && styles.shutterPressed]}
          onPress={handleTakePhoto}
          disabled={busy}
        >
          <View style={styles.shutterInner}>
            <Feather name="camera" size={26} color="#0A0A0A" />
          </View>
        </Pressable>

        {/* Secondary actions: gallery + text search */}
        <View style={styles.secondaryRow}>
          <Pressable style={styles.secondaryBtn} onPress={handlePickFromGallery} disabled={busy}>
            <Feather name="image" size={18} color={theme.colors.surface} />
            <Text style={styles.secondaryLabel}>Gallery</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => router.push('/search')}
            disabled={busy}
          >
            <Feather name="search" size={18} color={theme.colors.surface} />
            <Text style={styles.secondaryLabel}>Search by name</Text>
          </Pressable>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  controls: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 20,
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterPressed: {
    opacity: 0.7,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.pill,
  },
  secondaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.surface,
    letterSpacing: -0.06,
  },
});
