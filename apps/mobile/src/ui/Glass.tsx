import type { ReactNode, RefObject } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { alpha, glass, radius as R, shadow } from "./tokens";

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /** clear: what's still to come. frost: what's already behind you. */
  tone?: "clear" | "frost";
  /** Lights the top edge in this colour: the next session, a live class. */
  lit?: string;
  /** Blur what's behind the pane. Costly, so only for panes that float over scrolling content. */
  blur?: boolean;
  /** Android blurs the content of this view (see expo-blur's BlurTargetView). */
  blurTarget?: RefObject<View | null>;
};

/** A pane of glass: holds information and lets the plant's light through. */
export function Glass({ children, style, radius = R.md, tone = "clear", lit, blur, blurTarget }: Props) {
  return (
    <View style={[{ borderRadius: radius, boxShadow: lit ? `${shadow.glass}, 0px 0px 26px ${alpha(lit, 0.16)}` : shadow.glass }, style]}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: "hidden" }]}>
        {blur && (
          <BlurView
            intensity={40}
            tint="dark"
            blurMethod="dimezisBlurViewSdk31Plus"
            blurTarget={blurTarget}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: tone === "frost" ? glass.frost : glass.fill }]} />
        <LinearGradient
          colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0)", "rgba(255,255,255,0.03)"]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {lit && (
          <LinearGradient
            colors={[alpha(lit, 0.2), alpha(lit, 0)]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.7 }}
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: radius, borderWidth: 1, borderColor: glass.edge, borderTopColor: lit ? alpha(lit, 0.65) : glass.edgeTop },
        ]}
      />
      {children}
    </View>
  );
}
