import type { MomentumState } from "@bime/core";
import Svg, { Circle, Path } from "react-native-svg";

// One icon per momentum state, so the state reads without colour.
export function StateIcon({ state, color, size = 14 }: { state: MomentumState; color: string; size?: number }) {
  const stroke = { stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      {state === "thriving" && <Path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" {...stroke} />}
      {state === "ontrack" && <Path d="m3 8.5 3 3 7-7" {...stroke} />}
      {state === "slipping" && <Path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" {...stroke} />}
      {state === "danger" && (
        <>
          <Path d="M8 1.8 15 14H1z" fill={color} />
          <Path d="M8 6v3.6" stroke="#0d0e18" strokeWidth={1.8} strokeLinecap="round" />
          <Circle cx={8} cy={11.6} r={1} fill="#0d0e18" />
        </>
      )}
    </Svg>
  );
}
