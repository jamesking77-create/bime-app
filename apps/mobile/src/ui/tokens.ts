import type { MomentumState } from "@bime/core";

// Glasshouse: BIME's look. Study time sits under glass like a plant under a
// cloche; the controls are soft clay you press in. Three materials:
//   night - the background, lit by the plant's light (the momentum state)
//   glass - panes that hold information and let the light through
//   clay  - things you press: keys, wells, the lock-in dial
// Every state colour also comes with an icon and a word.

export const colors = {
  night: "#0B0C14",
  clay: "#181A27",
  clayHi: "#272A42",
  clayLo: "#12131E",
  ink: "#F3F1FA",
  muted: "#ABA8C3",
  faint: "#6E6B86",
  /** Neutral light: study done, in charts and marks that aren't about state. */
  lamplight: "#F1EAD8",
  /** Live classes and tests: fixed events. */
  live: "#A08CFF",
  /** Text on lit (state-coloured) surfaces. */
  onLight: "#0B0C14",
};

// Checked with the dataviz palette validator against the night surface:
// colour-blind separation and the normal-vision floor pass.
export const stateColor: Record<MomentumState, string> = {
  thriving: "#B4F05C",
  ontrack: "#52C2FF",
  slipping: "#FF9A3C",
  danger: "#FF5A6E",
};

export const stateName: Record<MomentumState, string> = {
  thriving: "Thriving",
  ontrack: "On track",
  slipping: "Slipping",
  danger: "Danger",
};

export const STATES: MomentumState[] = ["thriving", "ontrack", "slipping", "danger"];

export const glass = {
  fill: "rgba(28, 30, 48, 0.46)",
  frost: "rgba(44, 46, 70, 0.52)",
  edge: "rgba(255, 255, 255, 0.09)",
  edgeTop: "rgba(255, 255, 255, 0.22)",
};

export const shadow = {
  /** Clay standing out of the surface. */
  raised: "-6px -6px 16px rgba(255, 255, 255, 0.075), 8px 10px 22px rgba(0, 0, 0, 0.65)",
  raisedSm: "-3px -3px 9px rgba(255, 255, 255, 0.075), 4px 5px 12px rgba(0, 0, 0, 0.6)",
  /** Clay pressed into the surface. */
  pressed: "inset 5px 6px 12px rgba(0, 0, 0, 0.65), inset -3px -3px 9px rgba(255, 255, 255, 0.065)",
  pressedSm: "inset 2px 3px 6px rgba(0, 0, 0, 0.62), inset -2px -2px 5px rgba(255, 255, 255, 0.06)",
  /** Glass floating over the night. */
  glass: "0px 16px 36px rgba(0, 0, 0, 0.32)",
};

export const font = {
  display: "Fraunces_600SemiBold",
  displayItalic: "Fraunces_500Medium_Italic",
  regular: "InstrumentSans_400Regular",
  medium: "InstrumentSans_500Medium",
  semibold: "InstrumentSans_600SemiBold",
  bold: "InstrumentSans_700Bold",
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };
export const radius = { sm: 12, md: 18, lg: 24, xl: 30 };

/** Smallest comfortable touch target. */
export const TOUCH = 44;

/** Dock height; screens leave room for it. */
export const DOCK_HEIGHT = 68;

/** `#rrggbb` plus an alpha from 0 to 1. */
export function alpha(hex: string, a: number): string {
  return hex + Math.round(a * 255).toString(16).padStart(2, "0");
}

/** Mixes two `#rrggbb` colours; t = 0 gives a, t = 1 gives b. */
export function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  return (
    "#" +
    [16, 8, 0]
      .map(shift => {
        const x = (pa >> shift) & 255;
        const y = (pb >> shift) & 255;
        return Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
      })
      .join("")
  );
}
