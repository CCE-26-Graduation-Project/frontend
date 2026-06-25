import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { FavouritesProvider } from '../contexts/FavouritesContext';
import { onSessionExpired } from '../services/sessionEvents';

export default function RootLayout() {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Register for session-expiry events emitted by apiClient when a token
    // refresh fails. Returns a cleanup function that removes the listener.
    return onSessionExpired(() => setSessionExpired(true));
  }, []);

  function handleSignIn() {
    setSessionExpired(false);
    router.push('/(tabs)/profile');
  }

  return (
    <SafeAreaProvider>
      <FavouritesProvider>
        <StatusBar style="dark" backgroundColor={theme.colors.bg1} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg1 } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="search"
            options={{
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="results" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="product/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
        </Stack>

        {/* Session-expired modal — rendered after Stack so expo-router is ready */}
        <Modal
          visible={sessionExpired}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setSessionExpired(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.card}>
              <View style={styles.iconWrap}>
                <Feather name="lock" size={28} color={theme.colors.text1} />
              </View>
              <Text style={styles.cardTitle}>Session expired</Text>
              <Text style={styles.cardBody}>
                Your session has expired. Please sign in again to keep your favourites
                and continue using your account.
              </Text>
              <Pressable style={styles.primaryBtn} onPress={handleSignIn}>
                <Text style={styles.primaryBtnText}>Sign in</Text>
              </Pressable>
              <Pressable style={styles.dismissBtn} onPress={() => setSessionExpired(false)}>
                <Text style={styles.dismissBtnText}>Dismiss</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </FavouritesProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    ...theme.shadows.card,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.bg2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.25,
  },
  cardBody: {
    fontSize: 15,
    color: theme.colors.text2,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 6,
  },
  primaryBtn: {
    width: '100%',
    height: 50,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.text1,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.card,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.1,
  },
  dismissBtn: {
    width: '100%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissBtnText: {
    fontSize: 15,
    color: theme.colors.text2,
    fontWeight: '500',
  },
});
