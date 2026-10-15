import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import type { MomentumState } from "@bime/core";
import { colors, stateColor, STATES } from "./tokens";

// The night, lit from behind the plant by the momentum state's colour. When the
// state changes the light crossfades; in danger it breathes slowly, unless the
// phone asks for reduced motion.

export function Backdrop({ state }: { state: MomentumState }) {
  const reduce = useReducedMotion();
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.night }]}>
      {STATES.map(s => (
        <Animated.View
          key={s}
          style={[
            StyleSheet.absoluteFill,
            { opacity: s === state ? 1 : 0, transitionProperty: "opacity", transitionDuration: reduce ? 0 : 700 },
          ]}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              s === "danger" && !reduce
                ? {
                    animationName: { from: { opacity: 0.7 }, to: { opacity: 1 } },
                    animationDuration: "2.6s",
                    animationIterationCount: "infinite",
                    animationDirection: "alternate",
                    animationTimingFunction: "ease-in-out",
                  }
                : null,
            ]}
          >
            <Light color={stateColor[s]} />
          </Animated.View>
        </Animated.View>
      ))}
    </View>
  );
}

function Light({ color }: { color: string }) {
  const { width, height } = useWindowDimensions();
  const id = `light-${color.slice(1)}`;
  return (
    <Svg width={width} height={height}>
      <Defs>
        <RadialGradient id={id} cx={width / 2} cy={height * 0.2} r={Math.max(width, 420) * 0.85} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={color} stopOpacity={0.3} />
          <Stop offset="0.4" stopColor={color} stopOpacity={0.1} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`${id}-low`} cx={width * 0.1} cy={height * 0.95} r={width * 0.9} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={colors.live} stopOpacity={0.09} />
          <Stop offset="1" stopColor={colors.live} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={width} height={height} fill={`url(#${id})`} />
      <Rect width={width} height={height} fill={`url(#${id}-low)`} />
    </Svg>
  );
}
