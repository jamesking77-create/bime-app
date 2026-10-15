import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Clay } from "./Clay";
import { tap, warn } from "./haptics";
import { T } from "./type";
import { alpha, stateColor } from "./tokens";

/**
 * Friction before quitting: hold the track while it fills, or let go to stay.
 * Slow where you decide (a linear fill), quick where BIME answers (a 200ms release).
 */
export function HoldToEnd({ holdMs, onEnd }: { holdMs: number; onEnd: () => void }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fill = useSharedValue(0);
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: fill.get() }] }));

  useEffect(() => () => clearTimeout(timer.current), []);

  const begin = () => {
    tap();
    setHolding(true);
    fill.set(withTiming(1, { duration: holdMs, easing: Easing.linear }));
    timer.current = setTimeout(() => {
      timer.current = undefined;
      setHolding(false);
      fill.set(0);
      warn();
      onEnd();
    }, holdMs);
  };

  const release = () => {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = undefined;
    setHolding(false);
    fill.set(withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) }));
  };

  const seconds = Math.round(holdMs / 1000);
  return (
    <Pressable
      onPressIn={begin}
      onPressOut={release}
      accessibilityRole="button"
      accessibilityLabel="End the session early"
      accessibilityHint={`Hold for ${seconds} seconds`}
      accessibilityActions={[{ name: "activate", label: "End the session early" }]}
      onAccessibilityAction={e => e.nativeEvent.actionName === "activate" && onEnd()}
    >
      <Clay pressed radius={22} style={styles.track}>
        <Animated.View pointerEvents="none" style={[styles.fill, fillStyle]} />
        <T v="strong" style={styles.label}>
          {holding ? "Keep holding to end" : `Hold ${seconds} seconds to end early`}
        </T>
      </Clay>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { minHeight: 60, justifyContent: "center", alignItems: "center", overflow: "hidden", paddingHorizontal: 16 },
  fill: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: alpha(stateColor.danger, 0.3), transformOrigin: "left" },
  label: { fontSize: 15 },
});
