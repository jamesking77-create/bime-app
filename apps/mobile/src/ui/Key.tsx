import { Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Clay } from "./Clay";
import { tap } from "./haptics";
import { T } from "./type";
import { alpha, colors, mix } from "./tokens";

type Props = {
  title: string;
  sub?: string;
  /** The light behind the key: the momentum state's colour. */
  color: string;
  onPress: () => void;
  accessibilityHint?: string;
};

/** The one obvious next step: a key lit from inside, set in a clay well. */
export function Key({ title, sub, color, onPress, accessibilityHint }: Props) {
  return (
    <Clay pressed radius={28} style={styles.well}>
      <Pressable
        onPress={onPress}
        onPressIn={tap}
        accessibilityRole="button"
        accessibilityLabel={sub ? `${title}. ${sub}` : title}
        accessibilityHint={accessibilityHint}
      >
        {({ pressed }) => (
          <Animated.View
            style={[
              styles.gel,
              {
                boxShadow: pressed
                  ? `0px 2px 8px ${alpha(color, 0.22)}, inset 0px -2px 5px rgba(0,0,0,0.18)`
                  : `0px 8px 22px ${alpha(color, 0.3)}, inset 0px -3px 6px rgba(0,0,0,0.16)`,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                transitionProperty: "transform",
                transitionDuration: 140,
                transitionTimingFunction: "ease-out",
              },
            ]}
          >
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip]}>
              <LinearGradient
                colors={[mix(color, "#ffffff", 0.3), color, mix(color, "#000000", 0.1)]}
                locations={[0, 0.55, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                colors={["rgba(255,255,255,0.4)", "rgba(255,255,255,0)"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.gloss}
              />
            </View>
            <T v="key" numberOfLines={2} style={styles.center}>
              {title}
            </T>
            {sub ? (
              <T v="meta" numberOfLines={1} style={[styles.center, { color: alpha(colors.onLight, 0.72) }]}>
                {sub}
              </T>
            ) : null}
          </Animated.View>
        )}
      </Pressable>
    </Clay>
  );
}

const styles = StyleSheet.create({
  well: { padding: 6 },
  gel: { borderRadius: 22, minHeight: 60, paddingVertical: 12, paddingHorizontal: 20, alignItems: "center", justifyContent: "center", gap: 1 },
  clip: { borderRadius: 22, overflow: "hidden" },
  gloss: { position: "absolute", left: 0, right: 0, top: 0, height: "55%" },
  center: { textAlign: "center" },
});
