import { StyleSheet, Text, type TextProps } from "react-native";
import { colors, font } from "./tokens";

// Fraunces carries BIME's voice (headlines, the timer); Instrument Sans does
// the work. Text follows the phone's text size, up to double.
const variants = StyleSheet.create({
  hero: { fontFamily: font.display, fontSize: 27, lineHeight: 33, letterSpacing: -0.3, color: colors.ink },
  title: { fontFamily: font.display, fontSize: 23, lineHeight: 29, letterSpacing: -0.2, color: colors.ink },
  body: { fontFamily: font.regular, fontSize: 16, lineHeight: 22, color: colors.ink },
  strong: { fontFamily: font.semibold, fontSize: 16, lineHeight: 21, color: colors.ink },
  meta: { fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: colors.muted },
  label: { fontFamily: font.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 1.1, textTransform: "uppercase", color: colors.muted },
  key: { fontFamily: font.bold, fontSize: 17, lineHeight: 22, color: colors.onLight },
});

export type Variant = keyof typeof variants;

export function T({ v = "body", style, ...rest }: TextProps & { v?: Variant }) {
  const display = v === "hero" || v === "title";
  return <Text maxFontSizeMultiplier={display ? 1.6 : 2} {...rest} style={[variants[v], style]} />;
}
