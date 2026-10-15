import { Pressable, StyleSheet } from "react-native";
import { T } from "./type";
import { colors } from "./tokens";

/** A quiet secondary action under a key. */
export function TextButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={6} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
      <T v="meta" style={styles.text}>
        {label}
      </T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { minHeight: 44, justifyContent: "center", alignSelf: "center", paddingHorizontal: 14 },
  pressed: { opacity: 0.6 },
  text: { color: colors.ink, textDecorationLine: "underline", fontSize: 14 },
});
