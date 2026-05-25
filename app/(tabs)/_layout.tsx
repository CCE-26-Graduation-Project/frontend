import { Tabs } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // hidden — BottomNav renders instead
      }}
      tabBar={(props) => <BottomNav {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="saved" />
      <Tabs.Screen name="camera" />
      <Tabs.Screen name="alerts" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
