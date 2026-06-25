import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { BottomNav } from '../../components/BottomNav';
import { TopNav } from '../../components/TopNav';

export default function TabsLayout() {
  // Web gets a top navigation bar (TopNav); native (iOS/Android) keeps the
  // floating bottom bar (BottomNav). This is the ONLY place the two layouts diverge.
  const isWeb = Platform.OS === 'web';

  return (
    <View style={{ flex: 1 }}>
      {/* WEB ONLY: top nav rendered above the screens, in normal flow. */}
      {isWeb && <TopNav />}

      <Tabs
        screenOptions={{
          headerShown: false,
          // Hide the default tab bar; BottomNav is rendered via the tabBar prop below.
          tabBarStyle: { display: 'none', backgroundColor: 'transparent' },
          // Remove React Navigation's own background surface behind the tab bar area
          // so our transparent BottomNav container doesn't have an opaque backdrop.
          tabBarBackground: () => null,
        }}
        // On web we render no bottom bar (TopNav handles navigation);
        // on native, BottomNav renders as before.
        tabBar={(props) => (isWeb ? null : <BottomNav {...props} />)}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="browse" />
        <Tabs.Screen name="fav" />
        {/* Camera is removed from web navigation (image capture is native-only).
            href: null drops it from the tab navigator on web. */}
        <Tabs.Screen name="camera" options={isWeb ? { href: null } : undefined} />
        <Tabs.Screen name="alerts" options={{ href: null }} />
        <Tabs.Screen name="profile" />
      </Tabs>
    </View>
  );
}
