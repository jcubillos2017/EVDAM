import React, { useMemo, useRef, useState } from 'react';
import { Text, Pressable, View, StyleSheet, LayoutChangeEvent, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

type Props = {
  label: string;
  onPress?: () => void;
  color?: string;        // color “neón”
  disabled?: boolean;
};

export default function NeonButton({ label, onPress, color = '#a945c7', disabled }: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  const top = useRef(new Animated.Value(0)).current;
  const right = useRef(new Animated.Value(0)).current;
  const bottom = useRef(new Animated.Value(0)).current;
  const left = useRef(new Animated.Value(0)).current;

  const w = size.w || 220;  // fallback para la 1a medida
  const h = size.h || 48;

  const animTopTx = useMemo(
    () => top.interpolate({ inputRange: [0, 1], outputRange: [-w, w] }),
    [top, w]
  );
  const animRightTy = useMemo(
    () => right.interpolate({ inputRange: [0, 1], outputRange: [-h, h] }),
    [right, h]
  );
  const animBottomTx = useMemo(
    () => bottom.interpolate({ inputRange: [0, 1], outputRange: [w, -w] }),
    [bottom, w]
  );
  const animLeftTy = useMemo(
    () => left.interpolate({ inputRange: [0, 1], outputRange: [h, -h] }),
    [left, h]
  );

  const animateOnce = () => {
    top.setValue(0); right.setValue(0); bottom.setValue(0); left.setValue(0);
    Animated.parallel([
      Animated.timing(top,    { toValue: 1, duration: 1000, delay:   0,  useNativeDriver: true }),
      Animated.timing(right,  { toValue: 1, duration: 1000, delay: 250,  useNativeDriver: true }),
      Animated.timing(bottom, { toValue: 1, duration: 1000, delay: 500,  useNativeDriver: true }),
      Animated.timing(left,   { toValue: 1, duration: 1000, delay: 750,  useNativeDriver: true }),
    ]).start();
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={animateOnce}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? '#2b0b34' : '#1a0321',
          shadowColor: color,
        },
        disabled && { opacity: 0.6 },
      ]}
    >
      <View onLayout={onLayout} style={styles.inner}>
        {/* 4 líneas animadas */}
        <AnimatedGradient
          colors={['transparent', color]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.lineH, { top: 0, transform: [{ translateX: animTopTx }] }]}
        />
        <AnimatedGradient
          colors={['transparent', color]}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={[styles.lineV, { right: 0, transform: [{ translateY: animRightTy }] }]}
        />
        <AnimatedGradient
          colors={['transparent', color]}
          start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}
          style={[styles.lineH, { bottom: 0, transform: [{ translateX: animBottomTx }] }]}
        />
        <AnimatedGradient
          colors={['transparent', color]}
          start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
          style={[styles.lineV, { left: 0, transform: [{ translateY: animLeftTy }] }]}
        />

        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    // “brillo” neón
    shadowOpacity: 0.8,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12, // Android
  },
  inner: {
    minWidth: 220,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#fff',
    letterSpacing: 1,
    fontWeight: '700',
    fontSize: 16,
  },
  lineH: {
    position: 'absolute',
    width: '100%',
    height: 2,
  },
  lineV: {
    position: 'absolute',
    width: 2,
    height: '100%',
  },
});
