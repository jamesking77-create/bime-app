import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Clay } from "./Clay";
import { T } from "./type";
import { alpha, colors, font } from "./tokens";

export interface DayBar {
  short: string;
  name: string;
  /** Minutes planned that day. */
  planned: number;
  /** Minutes studied that day. */
  done: number;
  isToday: boolean;
  isFuture: boolean;
}

const WELL = 72;
const TUBE_MAX = WELL - 14;

/**
 * The week as seven glass vials set in clay. A vial's height is the time
 * planned that day; the light inside is the time studied. Days still ahead show
 * the empty vial, so the plan reads as a plan. The light is neutral: a day you
 * kept stays bright whatever the rest of the week is doing.
 */
export function Vials({ days, selected, onSelect }: { days: DayBar[]; selected: number; onSelect: (i: number) => void }) {
  const most = Math.max(60, ...days.map(d => d.planned));
  return (
    <View style={styles.row}>
      {days.map((d, i) => {
        const height = d.planned ? 12 + (d.planned / most) * (TUBE_MAX - 12) : 0;
        const fill = d.planned ? Math.min(d.done / d.planned, 1) : 0;
        return (
          <Pressable
            key={d.name}
            onPress={() => onSelect(i)}
            style={styles.col}
            accessibilityRole="button"
            accessibilityState={{ selected: selected === i }}
            accessibilityLabel={describeDay(d)}
          >
            <Clay pressed small radius={13} style={[styles.well, selected === i && styles.selected]}>
              {d.planned > 0 ? (
                <View style={[styles.tube, { height }, d.isFuture && styles.ahead]}>
                  {fill > 0 && (
                    <LinearGradient
                      colors={[colors.lamplight, alpha(colors.lamplight, 0.62)]}
                      style={[styles.fill, { height: `${fill * 100}%` }]}
                    />
                  )}
                </View>
              ) : (
                <View style={styles.rest} />
              )}
            </Clay>
            <T v="meta" style={[styles.day, d.isToday && styles.today]}>
              {d.short}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

export function describeDay(d: DayBar): string {
  if (!d.planned && !d.done) return `${d.name}: nothing planned`;
  if (d.isFuture) return `${d.name}: ${d.planned} min planned`;
  if (d.done > d.planned) return `${d.name}: ${d.done} min studied, ${d.planned} planned`;
  return `${d.name}: ${d.done} of ${d.planned} min studied`;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  col: { flex: 1, alignItems: "center", gap: 8, minHeight: 44, paddingVertical: 2 },
  well: { width: 28, height: WELL, alignItems: "center", justifyContent: "flex-end", paddingBottom: 7, borderWidth: 1, borderColor: "transparent" },
  selected: { borderColor: alpha(colors.lamplight, 0.45) },
  tube: {
    width: 14,
    borderRadius: 7,
    overflow: "hidden",
    justifyContent: "flex-end",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderTopColor: "rgba(255,255,255,0.32)",
  },
  ahead: { opacity: 0.6 },
  fill: { width: "100%", boxShadow: `0px 0px 10px ${alpha(colors.lamplight, 0.45)}` },
  rest: { width: 10, height: 2, borderRadius: 1, backgroundColor: colors.faint, marginBottom: 6 },
  day: { fontSize: 12 },
  today: { color: colors.ink, fontFamily: font.bold },
});
