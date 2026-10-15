import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { clock } from "@bime/core";
import { headline, scoreLine } from "../data/copy";
import { targetFor, useLockIn } from "../data/lockin";
import { LEVEL_NAME, useWeek, when } from "../data/week";
import { Cloche } from "../ui/Cloche";
import { Glass } from "../ui/Glass";
import { Key } from "../ui/Key";
import { PreviewSwitch } from "../ui/PreviewSwitch";
import { Screen } from "../ui/Screen";
import { StateChip } from "../ui/StateChip";
import { Timeline } from "../ui/Timeline";
import { T } from "../ui/type";
import { describeDay, Vials } from "../ui/Vials";
import { stateColor } from "../ui/tokens";

const DAY_KIND = { onsite: "Onsite day", remote: "Work from home", off: "Day off", review: "Review day" } as const;

// Today: how the week is going, and the one next thing to do.
export default function Today() {
  const week = useWeek();
  const lock = useLockIn();
  const [day, setDay] = useState(week.now.day);
  const { momentum: m, profile, next, now } = week;
  const light = stateColor[m.state];
  const planned = week.days.reduce((sum, d) => sum + d.planned, 0);
  const studied = week.days.reduce((sum, d) => sum + d.done, 0);

  let footer;
  if (lock.phase !== "idle" && lock.target) {
    footer = <Key title="Back to lock-in" sub={lock.target.title} color={light} onPress={() => router.navigate("/lock-in")} />;
  } else if (next) {
    footer = (
      <Key
        title={`Start ${next.title}`}
        sub={`${next.end - next.start} min · planned ${when(next, now)}`}
        color={light}
        onPress={() => {
          lock.start(targetFor(next, profile.level));
          router.navigate("/lock-in");
        }}
      />
    );
  }

  return (
    <Screen footer={footer}>
      <View style={styles.top}>
        <T v="label">{week.date}</T>
        <T v="meta">
          {clock(now.min)} · {DAY_KIND[profile.kind]} · {LEVEL_NAME[profile.level]} lock-in
        </T>
      </View>

      <View style={styles.hero}>
        <Cloche state={m.state} size={172} />
        <StateChip state={m.state} />
        <T v="hero" style={styles.center}>
          {headline(week)}
        </T>
        <T v="meta" style={styles.center}>
          {scoreLine(week)}
        </T>
      </View>

      <Glass radius={22} style={styles.pane}>
        <View style={styles.paneHead}>
          <T v="label">This week</T>
          <T v="meta">
            {studied} of {planned} min studied
          </T>
        </View>
        <Vials days={week.days} selected={day} onSelect={setDay} />
        <T v="meta" style={styles.center}>
          {describeDay(week.days[day])}
        </T>
      </Glass>

      <View style={styles.section}>
        <T v="label">Today</T>
        <Timeline rows={week.rows} light={light} />
      </View>

      {__DEV__ && <PreviewSwitch value={week.preview} onChange={week.setPreview} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { gap: 4 },
  hero: { alignItems: "center", gap: 10 },
  center: { textAlign: "center" },
  pane: { padding: 16, gap: 14 },
  paneHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  section: { gap: 12 },
});
