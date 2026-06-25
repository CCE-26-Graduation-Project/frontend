import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, Filter, FeDropShadow } from 'react-native-svg';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const NAV_BG = '#0D0B61';
const NAV_ACTIVE = '#FFF9D2';
const NAV_INACTIVE = 'rgba(255, 249, 210, 0.55)';
const NAV_HEIGHT = 66;
const CAMERA_SIZE = 53;
const CAMERA_FLOAT = 4; // pt the camera button floats above nav bar top
const CAMERA_GRADIENT = ['#6C7CF0', '#4734C6'] as const;

const BORDER_R = 26;
const NOTCH_PAD = 22;    // gap between camera circle edge and notch arc
const SHADOW_BLEED = 28; // extra SVG canvas on all sides so the shadow isn't clipped

/**
 * Returns the SVG `d` attribute for the nav bar shape with a smooth concave
 * circular notch cut into the top centre. The notch is a circular arc whose
 * centre sits CAMERA_FLOAT pts above the bar top and whose radius is the
 * camera button radius + NOTCH_PAD.  Two cubic-bezier curves blend the
 * horizontal top edge into the arc bottom so the transition is seamless.
 */
function makeNotchPath(W: number, H: number): string {
  const camR = CAMERA_SIZE / 2;                                             // 28
  const notchR = camR + NOTCH_PAD;                                          // 36
  // Half-width where the notch circle crosses y = 0 (bar top edge)
  const nx = Math.sqrt(Math.max(0, notchR * notchR - CAMERA_FLOAT * CAMERA_FLOAT)); // ≈ 29.9
  const nd = notchR - CAMERA_FLOAT;                                         // depth below top ≈ 16
  const ctrl = nx * 0.38;                                                   // bezier arm length
  const cx = W / 2;

  return [
    `M 0 ${BORDER_R}`,
    `Q 0 0 ${BORDER_R} 0`,
    `L ${cx - nx} 0`,
    `C ${cx - nx + ctrl} 0 ${cx - ctrl} ${nd} ${cx} ${nd}`,
    `C ${cx + ctrl} ${nd} ${cx + nx - ctrl} 0 ${cx + nx} 0`,
    `L ${W - BORDER_R} 0`,
    `Q ${W} 0 ${W} ${BORDER_R}`,
    `L ${W} ${H - BORDER_R}`,
    `Q ${W} ${H} ${W - BORDER_R} ${H}`,
    `L ${BORDER_R} ${H}`,
    `Q 0 ${H} 0 ${H - BORDER_R}`,
    `Z`,
  ].join(' ');
}

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
  const [navWidth, setNavWidth] = useState(0);

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
    if (!event.defaultPrevented) navigation.navigate(routeName);
  }

  const currentRouteName = state.routes[state.index]?.name;

  const handleNavLayout = (e: LayoutChangeEvent) => {
    setNavWidth(e.nativeEvent.layout.width);
  };

  const notchPath = navWidth > 0 ? makeNotchPath(navWidth, NAV_HEIGHT) : null;

  return (
    <View style={[styles.container, { height: containerHeight }]} pointerEvents="box-none">
      {/* Floating camera button */}
      <View style={styles.cameraAnchor} pointerEvents="box-none">
        <Animated.View style={[styles.cameraShadow, { transform: [{ scale: pulseAnim }] }]}>
          <Pressable onPress={() => navigate('camera')} style={styles.cameraBtn}>
            <LinearGradient
              colors={CAMERA_GRADIENT}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.cameraGradient}
            >
              <Feather name="camera" size={24} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>

      {/* Nav bar */}
      <View
        style={[styles.navBar, { bottom: insets.bottom, height: NAV_HEIGHT }]}
        onLayout={handleNavLayout}
      >
        {/* SVG background: custom notch shape + floating shadow via feDropShadow.
            The canvas is extended by SHADOW_BLEED on every side so the blurred
            shadow isn't clipped by the SVG viewport, then shifted back so the
            path appears at the correct visual position. */}
        {notchPath && (
          <Svg
            width={navWidth + SHADOW_BLEED * 2}
            height={NAV_HEIGHT + SHADOW_BLEED * 2}
            style={styles.svgBg}
            pointerEvents="none"
          >
            <Defs>
              <Filter
                id="navShadow"
                x={`-${Math.round((SHADOW_BLEED / navWidth) * 100)}%`}
                y={`-${Math.round((SHADOW_BLEED / NAV_HEIGHT) * 100)}%`}
                width={`${Math.round(((navWidth + SHADOW_BLEED * 2) / navWidth) * 100)}%`}
                height={`${Math.round(((NAV_HEIGHT + SHADOW_BLEED * 2) / NAV_HEIGHT) * 100)}%`}
              >
                <FeDropShadow
                  dx="0"
                  dy="6"
                  stdDeviation="10"
                  floodColor="#000000"
                  floodOpacity={0.28}
                />
              </Filter>
            </Defs>
            {/* Path is shifted by SHADOW_BLEED to sit within the expanded canvas */}
            <Path
              d={notchPath}
              fill={NAV_BG}
              filter="url(#navShadow)"
              transform={`translate(${SHADOW_BLEED}, ${SHADOW_BLEED})`}
            />
          </Svg>
        )}

        {TABS.map((tab) => {
          if (tab.name === 'camera') {
            return (
              <View key="camera" style={styles.tab} pointerEvents="none">
             
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
  cameraShadow: {
    borderRadius: CAMERA_SIZE / 2,
    backgroundColor: CAMERA_GRADIENT[1],
    shadowColor: CAMERA_GRADIENT[1],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 12,
  },
  cameraBtn: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: CAMERA_SIZE / 2,
    overflow: 'hidden',
  },
  cameraGradient: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
    // Background and rounding are handled entirely by the SVG path below so
    // that the notch cutout is genuinely transparent.
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  svgBg: {
    position: 'absolute',
    top: -SHADOW_BLEED,
    left: -SHADOW_BLEED,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    gap: 3,
    minHeight: 44,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '500',
  },
});
