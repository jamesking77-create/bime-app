import { StyleSheet } from "react-native";
import type { MomentumState } from "@bime/core";
import { Clay } from "./Clay";
import { StateIcon } from "./icons";
import { T } from "./type";
import { stateColor, stateName } from "./tokens";

/** The momentum state as a clay pebble: icon and word, never colour alone. */
export function StateChip({ state }: { state: MomentumState }) {
  return (
    <Clay small radius={999} style={styles.chip}>
      <StateIcon state={state} color={stateColor[state]} />
      <T v="strong" style={styles.word}>
        {stateName[state]}
      </T>
    </Clay>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 14, paddingVertical: 7, alignSelf: "center" },
  word: { fontSize: 14, lineHeight: 18 },
});
