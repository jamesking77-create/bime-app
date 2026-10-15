import { Pressable, StyleSheet, View } from "react-native";
import type { MomentumState } from "@bime/core";
import { Clay } from "./Clay";
import { tap } from "./haptics";
import { StateIcon } from "./icons";
import { T } from "./type";
import { colors, stateColor, stateName, STATES } from "./tokens";

/** Development only: play the sample week through each momentum state. */
export function PreviewSwitch({ value, onChange }: { value: MomentumState; onChange: (s: MomentumState) => void }) {
  return (
    <View style={styles.wrap}>
      <T v="label">Preview the sample week</T>
      <Clay pressed radius={22} style={styles.track}>
        {STATES.map(s => {
          const on = s === value;
          const content = (
            <>
              <StateIcon state={s} color={on ? stateColor[s] : colors.muted} size={13} />
              <T v="meta" numberOfLines={1} style={[styles.word, on && styles.wordOn]}>
                {stateName[s]}
              </T>
            </>
          );
          return (
            <Pressable
              key={s}
              style={styles.cell}
              onPress={() => {
                if (on) return;
                tap();
                onChange(s);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`Preview ${stateName[s]}`}
            >
              {on ? (
                <Clay small radius={17} style={styles.knob}>
                  {content}
                </Clay>
              ) : (
                <View style={styles.knob}>{content}</View>
              )}
            </Pressable>
          );
        })}
      </Clay>
      <T v="meta">Sample data, frozen at Wednesday 7:42pm. Your own courses come next.</T>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  track: { flexDirection: "row", padding: 4, gap: 2 },
  cell: { flex: 1, minHeight: 44 },
  knob: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 4 },
  word: { fontSize: 12 },
  wordOn: { color: colors.ink },
});
