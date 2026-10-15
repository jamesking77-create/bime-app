import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { clock, planWeek, sampleWeek, SAMPLE_DAYS } from "@bime/core";
import type { Block } from "@bime/core";
import { Plant } from "../components/Plant";
import { StateIcon } from "../components/StateIcon";
import { colors, space, stateColor, stateName, TOUCH } from "../theme";

// Today, driven by the shared planner. Until course entry exists it shows the
// sample week, on the same weekday as today.
export default function Today() {
  const day = (new Date().getDay() + 6) % 7; // Monday = 0
  const { blocks, profile } = useMemo(() => {
    const plan = planWeek(sampleWeek);
    return { blocks: plan.blocks.filter(b => b.day === day), profile: sampleWeek.profiles[day] };
  }, [day]);

  const study = blocks.filter(b => b.slot !== "fixed");
  const next = study.find(b => b.slot === "evening") ?? study[0];
  const state = "ontrack" as const;
  const headline = study.length
    ? `${study.length} ${study.length === 1 ? "session" : "sessions"} today. First: ${next?.title} at ${clock(next!.start)}.`
    : "Nothing planned today. Enjoy the rest.";

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.date}>{SAMPLE_DAYS[day]} · {profile.kind === "onsite" ? "Onsite day" : profile.kind === "remote" ? "Work from home" : "Day off"}</Text>

        <View style={styles.hero}>
          <Plant state={state} />
          <View style={styles.heroText}>
            <View style={[styles.chip, { backgroundColor: stateColor[state] + "26" }]}>
              <StateIcon state={state} color={stateColor[state]} />
              <Text style={[styles.chipText, { color: stateColor[state] }]}>{stateName[state]}</Text>
            </View>
            <Text style={styles.headline}>{headline}</Text>
          </View>
        </View>

        <Text style={styles.notice}>This is the sample week. Your own courses come next.</Text>

        <View style={styles.timeline}>
          {profile.workStart !== undefined && (
            <Row time={clock(profile.workStart)} title="Work" sub={`Until ${clock(profile.workEnd!)}`} dim />
          )}
          {blocks.map(b => (
            <Row key={`${b.itemId}-${b.start}`} time={clock(b.start)} title={b.title + (b.part ? ` (part ${b.part})` : "")} sub={subFor(b)} live={b.slot === "fixed"} />
          ))}
        </View>

        {next && (
          <Pressable style={({ pressed }) => [styles.cta, pressed && { transform: [{ scale: 0.97 }] }]} onPress={() => router.push("/lock-in")} accessibilityRole="button">
            <Text style={styles.ctaTitle}>Start {next.course}</Text>
            <Text style={styles.ctaSub}>{next.end - next.start} min · {next.title}</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function subFor(b: Block): string {
  if (b.slot === "fixed") return "Fixed · reminder 10 min before";
  if (b.slot === "lunch") return `Lunch break · ${b.end - b.start} min`;
  return `${b.level === "locked" ? "Locked" : b.level === "focused" ? "Focused" : "Gentle"} · ${b.end - b.start} min`;
}

function Row({ time, title, sub, dim, live }: { time: string; title: string; sub: string; dim?: boolean; live?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.time}>{time}</Text>
      <View style={[styles.slot, dim && { opacity: 0.6 }, live && { borderColor: colors.live }]}>
        <Text style={styles.slotTitle}>{title}</Text>
        <Text style={styles.slotSub}>{sub}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: space.lg, gap: space.md },
  date: { color: colors.muted, fontSize: 14 },
  hero: { flexDirection: "row", gap: space.md, alignItems: "center", backgroundColor: colors.panel, borderRadius: 20, padding: space.lg },
  heroText: { flex: 1, gap: space.sm },
  chip: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontSize: 13, fontWeight: "700" },
  headline: { color: colors.text, fontSize: 20, fontWeight: "700", lineHeight: 26 },
  notice: { color: colors.muted, fontSize: 13 },
  timeline: { gap: space.sm },
  row: { flexDirection: "row", gap: space.md, alignItems: "stretch" },
  time: { color: colors.muted, width: 64, paddingTop: 12, fontSize: 13, fontVariant: ["tabular-nums"] },
  slot: { flex: 1, backgroundColor: colors.panel, borderRadius: 14, padding: space.md, borderWidth: 1, borderColor: "transparent", minHeight: TOUCH },
  slotTitle: { color: colors.text, fontSize: 15, fontWeight: "600" },
  slotSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  cta: { backgroundColor: colors.teal, borderRadius: 16, paddingVertical: 14, alignItems: "center", minHeight: TOUCH, marginTop: space.sm },
  ctaTitle: { color: colors.ink, fontSize: 17, fontWeight: "700" },
  ctaSub: { color: colors.ink, fontSize: 13, opacity: 0.8 },
});
