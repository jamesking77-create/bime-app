import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Clay } from "./Clay";
import { T } from "./type";
import { alpha, colors, font } from "./tokens";

type Props = {
  size: number;
  /** Share of the session focused so far, 0 to 1. */
  progress: number;
  color: string;
  time: string;
  caption: string;
};

const RIM = 18;
const GROOVE = 22;

/**
 * The lock-in dial: a clay disc like a kitchen timer, with a groove pressed into
 * it. Light fills the groove as you focus.
 */
export function Dial({ size, progress, color, time, caption }: Props) {
  const c = size / 2;
  const track = size - RIM * 2;
  const face = track - GROOVE * 2;
  const r = track / 2 - GROOVE / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(Math.max(progress, 0), 1));
  const arc = { cx: c, cy: c, r, fill: "none", strokeLinecap: "round", strokeDasharray: `${circumference} ${circumference}`, strokeDashoffset: offset, transform: `rotate(-90 ${c} ${c})` } as const;

  return (
    <View style={{ width: size, height: size, alignSelf: "center" }} accessible accessibilityRole="timer" accessibilityLabel={`${time} ${caption}`}>
      <Clay radius={c} style={[styles.center, { width: size, height: size }]}>
        <Clay pressed radius={track / 2} style={[styles.center, { width: track, height: track }]}>
          <Clay small radius={face / 2} style={[styles.center, { width: face, height: face }]}>
            <T style={[styles.time, { fontSize: Math.round(face * 0.27), lineHeight: Math.round(face * 0.32) }]}>{time}</T>
            <T v="meta">{caption}</T>
          </Clay>
        </Clay>
      </Clay>
      <Svg pointerEvents="none" width={size} height={size} style={StyleSheet.absoluteFill}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
          const rr = c - RIM / 2;
          return <Circle key={i} cx={c + rr * Math.cos(a)} cy={c + rr * Math.sin(a)} r={i % 3 === 0 ? 2 : 1.3} fill="rgba(0,0,0,0.6)" />;
        })}
        {progress > 0 && (
          <>
            <Circle {...arc} stroke={alpha(color, 0.22)} strokeWidth={GROOVE - 2} />
            <Circle {...arc} stroke={color} strokeWidth={GROOVE - 12} />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  time: { fontFamily: font.display, color: colors.ink, letterSpacing: -0.5, fontVariant: ["tabular-nums"] },
});
