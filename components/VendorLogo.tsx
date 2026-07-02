import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { getVendorLogo } from '../constants/vendorLogos';
import { theme } from '../constants/theme';

interface Props {
  vendorName: string;
  size: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Renders a vendor's logo in a square badge, sized and rounded per call site.
 * Falls back to an initial-letter badge when we don't have a logo on file
 * (constants/vendorLogos.ts) or the image fails to load (e.g. a hotlinked
 * URL starts rejecting requests).
 */
export function VendorLogo({ vendorName, size, borderRadius, style }: Props) {
  const [failed, setFailed] = useState(false);
  const logoUrl = getVendorLogo(vendorName);
  const radius = borderRadius ?? size / 4;
  const box = { width: size, height: size, borderRadius: radius };

  if (!logoUrl || failed) {
    return (
      <View style={[styles.fallback, box, style]}>
        <Text style={[styles.fallbackText, { fontSize: size * 0.5 }]}>
          {vendorName.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, box, style]}>
      <Image
        source={{ uri: logoUrl }}
        style={styles.image}
        resizeMode="contain"
        onError={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  fallback: {
    backgroundColor: theme.colors.bg2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontWeight: '700',
    color: theme.colors.text1,
  },
});
