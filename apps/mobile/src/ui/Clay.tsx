import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius as R, shadow } from "./tokens";

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /** Pressed into the surface (a well, a track) instead of standing out of it. */
  pressed?: boolean;
  small?: boolean;
};

/** Soft clay: the material of things you press. */
export function Clay({ children, style, radius = R.md, pressed, small }: Props) {
  const boxShadow = pressed ? (small ? shadow.pressedSm : shadow.pressed) : small ? shadow.raisedSm : shadow.raised;
  return (
    <View style={[{ borderRadius: radius, boxShadow, backgroundColor: pressed ? colors.clayLo : colors.clay }, style]}>
      {!pressed && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: "hidden" }]}>
          <LinearGradient
            colors={[colors.clayHi, colors.clay, colors.clayLo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
      {children}
    </View>
  );
}
