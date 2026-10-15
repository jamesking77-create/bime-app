import type { MomentumState } from "@bime/core";

// Colours from the design prototype. Every state colour always comes with an
// icon and a word, so nothing depends on colour alone.
export const colors = {
  ink: "#0d0e18",
  panel: "#151726",
  raise: "#1d2034",
  line: "#2b2f4a",
  text: "#eeecf7",
  muted: "#a7a4c0",
  lime: "#a8e64a",
  teal: "#3fd6ae",
  amber: "#ffa53a",
  red: "#ff4d61",
  live: "#8f7bff",
};

export const stateColor: Record<MomentumState, string> = {
  thriving: colors.lime,
  ontrack: colors.teal,
  slipping: colors.amber,
  danger: colors.red,
};

export const stateName: Record<MomentumState, string> = {
  thriving: "Thriving",
  ontrack: "On track",
  slipping: "Slipping",
  danger: "Danger",
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

/** Smallest comfortable touch target. */
export const TOUCH = 44;
