import React, { useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
  PanResponder,
  NativeSyntheticEvent,
  NativeScrollEvent,
  NativeTouchEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { theme } from '../constants/theme';

const { width: SW, height: SH } = Dimensions.get('window');
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_MS = 280;
const TAP_MOVE_TOLERANCE = 6;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function touchDistance(touches: NativeTouchEvent[]) {
  const [a, b] = touches;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

function ZoomableImage({
  uri,
  onZoomChange,
  onClose,
}: {
  uri: string;
  onZoomChange: (zoomed: boolean) => void;
  onClose: () => void;
}) {
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);

  const box = useMemo(() => {
    if (!natural) return { width: SW, height: SH };
    const ratio = Math.min(SW / natural.width, SH / natural.height);
    return { width: natural.width * ratio, height: natural.height * ratio };
  }, [natural]);

  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const scaleRef = useRef(1);
  const translateXRef = useRef(0);
  const translateYRef = useRef(0);
  const pinchStartDist = useRef<number | null>(null);
  const pinchStartScale = useRef(1);
  const panStart = useRef({ x: 0, y: 0 });
  const lastTapAt = useRef(0);
  const movedDuringGesture = useRef(false);

  function setScale(v: number) {
    scaleRef.current = v;
    scale.setValue(v);
  }
  function setTranslate(x: number, y: number) {
    translateXRef.current = x;
    translateYRef.current = y;
    translateX.setValue(x);
    translateY.setValue(y);
  }

  function resetZoom(animated: boolean) {
    scaleRef.current = 1;
    translateXRef.current = 0;
    translateYRef.current = 0;
    if (animated) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);
    }
    onZoomChange(false);
  }

  function toggleDoubleTapZoom() {
    if (scaleRef.current > 1) {
      resetZoom(true);
    } else {
      scaleRef.current = DOUBLE_TAP_SCALE;
      Animated.spring(scale, { toValue: DOUBLE_TAP_SCALE, useNativeDriver: true }).start();
      onZoomChange(true);
    }
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length > 1) return true;
        if (scaleRef.current > 1) return true;
        return Math.abs(gestureState.dx) > TAP_MOVE_TOLERANCE || Math.abs(gestureState.dy) > TAP_MOVE_TOLERANCE;
      },
      onPanResponderGrant: evt => {
        movedDuringGesture.current = false;
        if (evt.nativeEvent.touches.length === 2) {
          pinchStartDist.current = touchDistance(evt.nativeEvent.touches);
          pinchStartScale.current = scaleRef.current;
        }
        panStart.current = { x: translateXRef.current, y: translateYRef.current };
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        if (Math.abs(gestureState.dx) > TAP_MOVE_TOLERANCE || Math.abs(gestureState.dy) > TAP_MOVE_TOLERANCE) {
          movedDuringGesture.current = true;
        }
        if (touches.length === 2 && pinchStartDist.current) {
          const dist = touchDistance(touches);
          const nextScale = clamp(pinchStartScale.current * (dist / pinchStartDist.current), 1, MAX_SCALE);
          setScale(nextScale);
        } else if (touches.length === 1 && scaleRef.current > 1) {
          setTranslate(panStart.current.x + gestureState.dx, panStart.current.y + gestureState.dy);
        }
      },
      onPanResponderRelease: () => {
        pinchStartDist.current = null;
        if (scaleRef.current <= 1) {
          resetZoom(true);
        } else {
          onZoomChange(true);
        }
        if (!movedDuringGesture.current) {
          const now = Date.now();
          if (now - lastTapAt.current < DOUBLE_TAP_MS) {
            lastTapAt.current = 0;
            toggleDoubleTapZoom();
          } else {
            lastTapAt.current = now;
          }
        }
      },
      // Let the parent horizontal pager steal the gesture (for page-swipe) whenever
      // we're not zoomed in or mid-pinch; refuse to yield once zoomed so panning
      // the image doesn't get interrupted by the pager.
      onPanResponderTerminationRequest: () => scaleRef.current <= 1,
    })
  ).current;

  return (
    <View style={styles.page}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close fullscreen image" />
      <View style={styles.imageCenterer} pointerEvents="box-none">
        <Animated.View
          {...panResponder.panHandlers}
          style={[box, { transform: [{ translateX }, { translateY }, { scale }] }]}
        >
          <Image
            source={{ uri }}
            style={styles.fullImage}
            resizeMode="contain"
            onLoad={e => {
              const src = (e.nativeEvent as any).source;
              if (src?.width && src?.height) setNatural({ width: src.width, height: src.height });
            }}
            accessibilityLabel="Product photo, zoomable"
          />
        </Animated.View>
      </View>
    </View>
  );
}

export function FullscreenGallery({
  visible,
  images,
  initialIndex,
  onClose,
}: {
  visible: boolean;
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [zoomed, setZoomed] = useState(false);
  const [index, setIndex] = useState(initialIndex);

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / SW));
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <ScrollView
          horizontal
          pagingEnabled
          scrollEnabled={!zoomed}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          contentOffset={{ x: initialIndex * SW, y: 0 }}
        >
          {images.map(uri => (
            <ZoomableImage key={uri} uri={uri} onZoomChange={setZoomed} onClose={onClose} />
          ))}
        </ScrollView>

        <Pressable
          style={[styles.closeBtn, { top: insets.top + 10 }]}
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Feather name="x" size={22} color="#fff" />
        </Pressable>

        {images.length > 1 && (
          <View style={[styles.dotsRow, { bottom: insets.bottom + 18 }]} pointerEvents="none">
            {images.map((_, idx) => (
              <View key={idx} style={[styles.dot, idx === index && styles.dotActive]} />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
  },
  page: {
    width: SW,
    height: SH,
  },
  imageCenterer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.s2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 18,
  },
});
