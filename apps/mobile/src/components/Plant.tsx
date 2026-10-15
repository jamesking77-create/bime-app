import type { MomentumState } from "@bime/core";
import Svg, { G, Path } from "react-native-svg";
import { stateColor } from "../theme";

// BIME's companion. Its pose follows the momentum state; the top leaf shows
// when you're thriving. Same drawing as the prototype.
const pose: Record<MomentumState, { whole: string; l1: string; l2: string; opacity: number }> = {
  thriving: { whole: "", l1: "", l2: "", opacity: 1 },
  ontrack: { whole: "", l1: "", l2: "", opacity: 1 },
  slipping: { whole: "rotate(-8 20 38)", l1: "", l2: "", opacity: 0.75 },
  danger: { whole: "rotate(-10 20 38) translate(1.6 3) scale(0.92)", l1: "rotate(-24 20 31)", l2: "rotate(30 20 25)", opacity: 0.55 },
};

export function Plant({ state, size = 84, grown }: { state: MomentumState; size?: number; grown?: boolean }) {
  const color = stateColor[state];
  const p = pose[state];
  const showTop = grown || state === "thriving";
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" accessibilityLabel="Your study plant">
      <G transform={p.whole} opacity={p.opacity}>
        <Path d="M20 38V15" stroke={color} strokeWidth={2.6} strokeLinecap="round" fill="none" />
        <Path d="M20 31C12 31 7 26 6 19c7-1 13 4 14 12Z" fill={color} opacity={0.8} transform={p.l1} />
        <Path d="M20 25c8 0 13-5 14-12-7-1-13 4-14 12Z" fill={color} transform={p.l2} />
        {showTop && <Path d="M20 15c-3-3-3-8 0-12 3 4 3 9 0 12Z" fill={color} />}
      </G>
    </Svg>
  );
}
