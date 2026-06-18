import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const NAV_BG = '#0D0B61';
const NAV_ACTIVE = '#FFF9D2';
const NAV_INACTIVE = 'rgba(255, 249, 210, 0.55)';
const NAV_HEIGHT = 66;
const CAMERA_SIZE = 56;
const CAMERA_FLOAT = 20; // pt the camera button floats above nav bar

type TabKey = 'index' | 'browse' | 'fav' | 'camera' | 'profile';

const TABS: { name: TabKey; icon: React.ComponentProps<typeof Feather>['name']; label: string }[] = [
  { name: 'index',  icon: 'home',   label: 'Home' },
  { name: 'browse', icon: 'search', label: 'Search' },
  { name: 'camera', icon: 'camera', label: 'Camera' },
  { name: 'fav',  icon: 'heart',  label: 'Favourites' },
  { name: 'profile', icon: 'user',  label: 'Profile' },
];

export function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const containerHeight = CAMERA_FLOAT + CAMERA_SIZE / 2 + NAV_HEIGHT + insets.bottom;

  function navigate(routeName: string) {
    const route = state.routes.find((r) => r.name === routeName);
    if (!route) return;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  }

  const currentRouteName = state.routes[state.index]?.name;

  return (
    <View style={[styles.container, { height: containerHeight }]} pointerEvents="box-none">
      {/* Floating camera button */}
      <View style={styles.cameraAnchor} pointerEvents="box-none">
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable
            onPress={() => navigate('camera')}
            style={[
              styles.cameraBtn,
              { borderColor: theme.colors.bg1 },
            ]}
          >
            <Feather name="camera" size={22} color={NAV_BG} />
          </Pressable>
        </Animated.View>
      </View>

      {/* Nav bar */}
      <View
        style={[
          styles.navBar,
          {
            bottom: insets.bottom,
            height: NAV_HEIGHT,
          },
        ]}
      >
        {TABS.map((tab) => {
          if (tab.name === 'camera') {
            return (
              <View key="camera" style={styles.tab} pointerEvents="none">
                <Text style={[styles.tabLabel, { color: currentRouteName === 'camera' ? NAV_ACTIVE : NAV_INACTIVE }]}>
                  Camera
                </Text>
              </View>
            );
          }

          const isActive = currentRouteName === tab.name;
          const color = isActive ? NAV_ACTIVE : NAV_INACTIVE;

          return (
            <Pressable
              key={tab.name}
              style={styles.tab}
              onPress={() => navigate(tab.name)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Feather name={tab.icon} size={22} color={color} />
              <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    backgroundColor: 'transparent',
  },
  cameraAnchor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 25,
  },
  cameraBtn: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: CAMERA_SIZE / 2,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    shadowColor: NAV_BG,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.40,
    shadowRadius: 12,
    elevation: 12,
  },
  navBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 26,
    backgroundColor: NAV_BG,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: NAV_BG,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    gap: 3,
    minHeight: 44, // iOS minimum touch target
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '500',
  },
});
