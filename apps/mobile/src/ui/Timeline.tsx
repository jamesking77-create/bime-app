import { StyleSheet, View } from "react-native";
import { clock } from "@bime/core";
import type { Row } from "../data/week";
import { Clay } from "./Clay";
import { Glass } from "./Glass";
import { Glyph } from "./icons";
import { T } from "./type";
import { colors } from "./tokens";

/**
 * Today, told in materials. Work is pressed into the clay: it's there, but it
 * isn't yours to move. Study sessions are glass, frosted once they're behind
 * you. Live classes and tests are lit violet, and the next session is lit by
 * the plant's light.
 */
export function Timeline({ rows, light }: { rows: Row[]; light: string }) {
  return (
    <View style={styles.list}>
      {rows.map(row => (
        <View key={row.key} style={styles.row}>
          <T v="meta" style={styles.time}>
            {row.justNow ? "Just now" : clock(row.start)}
          </T>
          <View style={styles.cell}>
            <Entry row={row} light={light} />
          </View>
        </View>
      ))}
    </View>
  );
}

function Entry({ row, light }: { row: Row; light: string }) {
  const behind = row.kind === "done" || row.kind === "missed" || row.kind === "work";
  const text = (
    <View style={styles.text}>
      <T v="strong" numberOfLines={2} style={behind && styles.quiet}>
        {row.title}
      </T>
      <T v="meta">{row.meta}</T>
    </View>
  );

  if (row.kind === "work") {
    return (
      <Clay pressed radius={16} style={styles.pane}>
        {text}
      </Clay>
    );
  }

  return (
    <Glass
      radius={16}
      tone={row.kind === "done" ? "frost" : "clear"}
      lit={row.kind === "next" ? light : row.kind === "fixed" ? colors.live : undefined}
      style={styles.pane}
    >
      <View style={styles.inner}>
        {text}
        {row.kind === "done" && <Glyph name="check" color={colors.lamplight} size={18} />}
        {row.kind === "missed" && <Glyph name="moved" color={colors.muted} size={18} />}
        {row.kind === "fixed" && <Glyph name="pin" color={colors.live} size={18} />}
        {row.kind === "next" && (
          <Clay small radius={999} style={styles.tag}>
            <View style={[styles.dot, { backgroundColor: light }]} />
            <T v="meta" style={styles.tagText}>
              Next
            </T>
          </Clay>
        )}
      </View>
    </Glass>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: { flexDirection: "row", gap: 12 },
  time: { width: 62, paddingTop: 15, fontVariant: ["tabular-nums"] },
  cell: { flex: 1 },
  pane: { paddingVertical: 12, paddingHorizontal: 14, minHeight: 56, justifyContent: "center" },
  inner: { flexDirection: "row", alignItems: "center", gap: 10 },
  text: { flex: 1, gap: 2 },
  quiet: { color: colors.muted },
  tag: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  tagText: { color: colors.ink, fontSize: 12, lineHeight: 15 },
});
