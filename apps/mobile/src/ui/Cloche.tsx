import { useId } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from "react-native-svg";
import type { MomentumState } from "@bime/core";
import { stateColor, stateName } from "./tokens";

// BIME's signature: your study plant under a glass cloche, on a clay plinth.
// The glass is the protected time. It stays clear while you keep your sessions,
// fogs over when you slip, and cracks in danger. The plant grows a top leaf
// when you're thriving and wilts in danger, but never dies.

const DOME =
  "M44,184 C44,150 42,118 46,96 C52,62 74,44 100,44 C126,44 148,62 154,96 C158,118 156,150 156,184 A56,9 0 0,1 44,184 Z";

const pose: Record<MomentumState, { whole: string; l1: string; l2: string; opacity: number; glow: number }> = {
  thriving: { whole: "", l1: "", l2: "", opacity: 1, glow: 0.7 },
  ontrack: { whole: "", l1: "", l2: "", opacity: 1, glow: 0.55 },
  slipping: { whole: "rotate(-8 20 38)", l1: "", l2: "", opacity: 0.8, glow: 0.42 },
  danger: {
    whole: "rotate(-10 20 38) translate(1.6 3) scale(0.92)",
    l1: "rotate(-24 20 31)",
    l2: "rotate(30 20 25)",
    opacity: 0.6,
    glow: 0.38,
  },
};

const DROPLETS = [
  [62, 150, 1.6], [70, 166, 1.2], [138, 158, 1.5], [130, 171, 1.1],
  [66, 128, 1.1], [142, 136, 1.3], [58, 175, 1], [147, 177, 1.2], [75, 112, 0.9], [134, 116, 1],
];

export function Cloche({ state, size = 196, grown }: { state: MomentumState; size?: number; grown?: boolean }) {
  // Gradient ids are global on the web, so each cloche gets its own.
  const id = "c" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const c = stateColor[state];
  const p = pose[state];
  const showTop = grown || state === "thriving";
  const url = (name: string) => `url(#${id}${name})`;

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`Your study plant: ${stateName[state]}`}>
      <Svg width={size} height={size * 1.1} viewBox="0 0 200 220">
        <Defs>
          <RadialGradient id={`${id}floor`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#000" stopOpacity={0.75} />
            <Stop offset="1" stopColor="#000" stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id={`${id}side`} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#0D0E17" />
            <Stop offset="0.42" stopColor="#1F2134" />
            <Stop offset="1" stopColor="#0B0C14" />
          </LinearGradient>
          <LinearGradient id={`${id}top`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#2B2E47" />
            <Stop offset="1" stopColor="#141623" />
          </LinearGradient>
          <RadialGradient id={`${id}glow`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={c} stopOpacity={p.glow} />
            <Stop offset="0.55" stopColor={c} stopOpacity={p.glow * 0.35} />
            <Stop offset="1" stopColor={c} stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id={`${id}glass`} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#fff" stopOpacity={0.2} />
            <Stop offset="0.16" stopColor="#fff" stopOpacity={0.05} />
            <Stop offset="0.5" stopColor="#fff" stopOpacity={0.015} />
            <Stop offset="0.84" stopColor="#fff" stopOpacity={0.05} />
            <Stop offset="1" stopColor="#fff" stopOpacity={0.16} />
          </LinearGradient>
          <LinearGradient id={`${id}streak`} x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor="#fff" stopOpacity={0} />
            <Stop offset="0.5" stopColor="#fff" stopOpacity={0.55} />
            <Stop offset="1" stopColor="#fff" stopOpacity={0.06} />
          </LinearGradient>
          <RadialGradient id={`${id}knob`} cx="40%" cy="35%" r="65%">
            <Stop offset="0" stopColor="#fff" stopOpacity={0.7} />
            <Stop offset="1" stopColor="#fff" stopOpacity={0.08} />
          </RadialGradient>
        </Defs>

        {/* Shadow on the floor, then the clay plinth: side band, top face, groove. */}
        <Ellipse cx="100" cy="203" rx="90" ry="13" fill={url("floor")} />
        <Path d="M26,184 V193 A74,13 0 0,0 174,193 V184 Z" fill={url("side")} />
        <Ellipse cx="100" cy="184" rx="74" ry="13" fill={url("top")} />
        <Ellipse cx="100" cy="184" rx="74" ry="13" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
        <Ellipse cx="100" cy="183.5" rx="58" ry="9.5" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth={3} />
        <Ellipse cx="100" cy="184.6" rx="58" ry="9.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />

        {/* The back of the glass rim, seen through the dome. */}
        <Path d="M44,184 A56,9 0 0,1 156,184" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

        {/* The plant and its light. */}
        <Ellipse cx="100" cy="128" rx="66" ry="70" fill={url("glow")} />
        <G transform="translate(48 83.2) scale(2.6)">
          <G transform={p.whole} opacity={p.opacity}>
            <Path d="M20 38V15" stroke={c} strokeWidth={2.2} strokeLinecap="round" fill="none" />
            <Path d="M20 31C12 31 7 26 6 19c7-1 13 4 14 12Z" fill={c} opacity={0.8} transform={p.l1} />
            <Path d="M20 25c8 0 13-5 14-12-7-1-13 4-14 12Z" fill={c} transform={p.l2} />
            {showTop && <Path d="M20 15c-3-3-3-8 0-12 3 4 3 9 0 12Z" fill={c} />}
          </G>
        </G>

        {/* The glass: brighter at the edges, like real glass. */}
        <Path d={DOME} fill={url("glass")} stroke="rgba(255,255,255,0.3)" strokeWidth={1.2} />
        {state === "slipping" && (
          <G>
            <Path d={DOME} fill="rgba(220,226,255,0.09)" />
            {DROPLETS.map(([x, y, r]) => (
              <Circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="rgba(255,255,255,0.3)" />
            ))}
          </G>
        )}
        <Path
          d="M57,168 C55,140 55,112 60,93 C64,79 71,67 81,59"
          fill="none"
          stroke={url("streak")}
          strokeWidth={3.2}
          strokeLinecap="round"
        />
        <Path d="M145,104 C147,116 147,128 146,140" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={2} strokeLinecap="round" />
        <Path d="M44,184 A56,9 0 0,0 156,184" fill="none" stroke="rgba(255,255,255,0.34)" strokeWidth={1.2} />
        <Path d="M96,47 h8 v-6 h-8 Z" fill="rgba(255,255,255,0.18)" />
        <Circle cx="100" cy="35" r="7" fill={url("knob")} stroke="rgba(255,255,255,0.35)" strokeWidth={0.8} />

        {state === "danger" && (
          <G>
            <Path
              d="M128,62 L121,84 L130,95 L117,121 L123,134"
              fill="none"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={3.4}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Path
              d="M128,62 L121,84 L130,95 L117,121 L123,134 M121,84 L108,90 M130,95 L142,103 M117,121 L106,126"
              fill="none"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth={1.1}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </G>
        )}
      </Svg>
    </View>
  );
}
