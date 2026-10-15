import type { ColorValue } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import type { MomentumState } from "@bime/core";
import { colors } from "./tokens";

// One stroke weight throughout, matching the prototype.

// Positioned, so on the web the icons paint above the gradient layers of the
// clay and glass they sit on.
const above = { position: "relative" } as const;

/** One icon per momentum state, so the state reads without colour. */
export function StateIcon({ state, color, size = 14 }: { state: MomentumState; color: string; size?: number }) {
  const stroke = { stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" style={above}>
      {state === "thriving" && <Path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" {...stroke} />}
      {state === "ontrack" && <Path d="M3 8.5l3 3 7-7" {...stroke} />}
      {state === "slipping" && <Path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" {...stroke} />}
      {state === "danger" && (
        <>
          <Path d="M8 1.8 15 14H1z" fill={color} />
          <Path d="M8 6v3.6" stroke={colors.night} strokeWidth={1.8} strokeLinecap="round" />
          <Circle cx={8} cy={11.6} r={1} fill={colors.night} />
        </>
      )}
    </Svg>
  );
}

export type TabName = "today" | "lockin" | "progress" | "plan";

export function TabIcon({ name, color, size = 22 }: { name: TabName; color: ColorValue; size?: number }) {
  const stroke = { stroke: color, strokeWidth: 2, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={above}>
      {name === "today" && (
        <>
          <Circle cx={12} cy={12} r={9} {...stroke} />
          <Path d="M12 7v5l3 2" {...stroke} />
        </>
      )}
      {name === "lockin" && (
        <>
          <Rect x={5} y={10} width={14} height={10} rx={2} {...stroke} />
          <Path d="M8 10V7a4 4 0 0 1 8 0v3" {...stroke} />
        </>
      )}
      {name === "progress" && <Path d="M4 20V10M10 20V4M16 20v-7M22 20H2" {...stroke} />}
      {name === "plan" && (
        <>
          <Rect x={3} y={5} width={18} height={16} rx={2} {...stroke} />
          <Path d="M3 10h18M8 3v4M16 3v4" {...stroke} />
        </>
      )}
    </Svg>
  );
}

export type GlyphName = "check" | "pin" | "moved" | "lock" | "rest";

/** Small marks for timeline rows and badges. */
export function Glyph({ name, color, size = 16 }: { name: GlyphName; color: ColorValue; size?: number }) {
  const stroke = { stroke: color, strokeWidth: 1.8, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" style={above}>
      {name === "check" && <Path d="M3.5 8.5l3 3 6-6.5" {...stroke} />}
      {name === "pin" && <Path d="M6 2.5h4l-.6 3.8 2.4 2.4H4.2l2.4-2.4zM8 8.7v4.8" {...stroke} />}
      {name === "moved" && <Path d="M2.5 8h9.5M9 4.8 12.2 8 9 11.2" {...stroke} />}
      {name === "lock" && (
        <>
          <Rect x={3.5} y={7} width={9} height={6.5} rx={1.5} {...stroke} />
          <Path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" {...stroke} />
        </>
      )}
      {name === "rest" && <Path d="M4 8h8" {...stroke} />}
    </Svg>
  );
}
