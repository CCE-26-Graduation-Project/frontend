import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../constants/theme';
import { FavouritesProvider } from '../contexts/FavouritesContext';

export default function RootLayout() {
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
      </FavouritesProvider>
    </SafeAreaProvider>
  );
}
