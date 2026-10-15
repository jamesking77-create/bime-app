import type { ColorValue } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

export type TabName = "today" | "lockin" | "progress" | "plan";

// Tab icons drawn in one stroke weight, matching the prototype.
export function TabIcon({ name, color, size = 24 }: { name: TabName; color: ColorValue; size?: number }) {
  const stroke = { stroke: color, strokeWidth: 2, fill: "none" } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
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
