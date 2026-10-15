import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { router } from "expo-router";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import type { Level, MomentumState } from "@bime/core";
import { targetFor, useLockIn, useNow, type Target } from "../data/lockin";
import { LEVEL_NAME, useWeek, when } from "../data/week";
import { Clay } from "../ui/Clay";
import { Cloche } from "../ui/Cloche";
import { Dial } from "../ui/Dial";
import { Glass } from "../ui/Glass";
import { HoldToEnd } from "../ui/HoldToEnd";
import { Glyph, StateIcon } from "../ui/icons";
import { Key } from "../ui/Key";
import { Screen, useDockSpace } from "../ui/Screen";
import { TextButton } from "../ui/TextButton";
import { T } from "../ui/type";
import { colors, stateColor, stateName, STATES } from "../ui/tokens";

const KEEP_AWAKE = "bime-lockin";

/** How long you hold to end early: no friction, some, more. */
const HOLD_MS: Record<Level, number> = { gentle: 0, focused: 3000, locked: 6000 };

const LEVEL_NOTE: Record<Level, string> = {
  gentle: "Gentle: just the timer. End whenever you need to.",
  focused: "Focused: turn on Do Not Disturb before you start. Ending early takes a 3-second hold.",
  locked: "Locked: app blocking comes in a later version. Until then, ending early takes a 6-second hold.",
};

const clockText = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
const wholeMins = (ms: number) => Math.floor(ms / 60_000);

export default function LockIn() {
  const week = useWeek();
  const lock = useLockIn();
  const { width } = useWindowDimensions();
  const now = useNow(lock.phase === "running");
  const light = stateColor[week.momentum.state];
  const target: Target | undefined = lock.target ?? (week.next ? targetFor(week.next, week.profile.level) : undefined);

  // Keep the screen on while the clock runs.
  useEffect(() => {
    if (lock.phase !== "running") return;
    activateKeepAwakeAsync(KEEP_AWAKE).catch(() => {});
    return () => {
      deactivateKeepAwake(KEEP_AWAKE).catch(() => {});
    };
  }, [lock.phase]);

  if (!target) {
    return (
      <Screen footer={<Key title="Back to Today" color={light} onPress={() => router.navigate("/")} />}>
        <View style={styles.empty}>
          <T v="title" style={styles.center}>
            Nothing left to study this week.
          </T>
          <T v="meta" style={styles.center}>
            Every session in the plan is done. Enjoy the evening.
          </T>
        </View>
      </Screen>
    );
  }

  const total = target.mins * 60_000;
  const focused = lock.target ? lock.elapsed(now) : 0;
  const left = Math.max(0, total - focused);

  let footer;
  if (lock.phase === "idle") {
    footer = <Key title={`Start ${target.mins} min lock-in`} sub={target.title} color={light} onPress={() => lock.start(target)} />;
  } else if (lock.phase === "running") {
    footer = HOLD_MS[target.level] ? (
      <HoldToEnd holdMs={HOLD_MS[target.level]} onEnd={lock.endEarly} />
    ) : (
      <TextButton label="End the session" onPress={lock.endEarly} />
    );
  } else if (lock.phase === "ended") {
    footer = (
      <View style={styles.stack}>
        <Key title="Keep going" sub={`${Math.ceil(left / 60_000)} min left in this session`} color={light} onPress={lock.resume} />
        <TextButton
          label={wholeMins(focused) ? `Stop here and count ${wholeMins(focused)} min` : "Stop here"}
          onPress={lock.stop}
        />
      </View>
    );
  }

  const status = {
    idle: "Ready when you are.",
    running: `Stay with it. ${Math.ceil(left / 60_000)} min to go.`,
    ended: `Paused at ${clockText(focused)}. The rest goes back in your plan if you stop.`,
    complete: "",
  }[lock.phase];

  const overlay =
    lock.phase === "complete" && lock.finished ? (
      <Complete
        mins={lock.finished.mins}
        course={target.course}
        before={lock.finished.before}
        after={week.momentum.state}
        next={week.next ? `${week.next.title}, ${when(week.next, week.now)}` : undefined}
        onDone={() => {
          lock.dismiss();
          router.navigate("/");
        }}
      />
    ) : undefined;

  return (
    <Screen footer={lock.phase === "complete" ? undefined : footer} overlay={overlay}>
      <View style={styles.head}>
        <Clay small radius={999} style={styles.level}>
          <Glyph name="lock" color={light} size={14} />
          <T v="meta" style={styles.levelText}>
            {LEVEL_NAME[target.level]} lock-in
          </T>
        </Clay>
        <T v="title" style={styles.center}>
          {target.title}
        </T>
        <T v="meta" style={styles.center}>
          {target.part ? `Part ${target.part} · ` : ""}
          {target.mins} min · {target.course}
        </T>
      </View>

      <Dial
        size={Math.min(width - 64, 300)}
        progress={focused / total}
        color={light}
        time={clockText(left)}
        caption={lock.phase === "running" ? "focus left" : lock.phase === "ended" ? "paused" : "ready"}
      />

      <T v="meta" style={styles.center} accessibilityLiveRegion="polite">
        {status}
      </T>

      <Glass radius={18} style={styles.note}>
        <T v="meta">{LEVEL_NOTE[target.level]}</T>
      </Glass>

      {__DEV__ && lock.phase === "running" && <TextButton label="Skip to the end (preview only)" onPress={lock.finish} />}
    </Screen>
  );
}

type CompleteProps = {
  mins: number;
  course: string;
  before: MomentumState;
  after: MomentumState;
  next?: string;
  onDone: () => void;
};

/** The reward: the plant grows a leaf, and you see what the session did for your week. */
function Complete({ mins, course, before, after, next, onDone }: CompleteProps) {
  const reduce = useReducedMotion();
  const dock = useDockSpace();
  const improved = STATES.indexOf(after) < STATES.indexOf(before);
  const grow = reduce
    ? null
    : ({
        animationName: { from: { opacity: 0, transform: [{ scale: 0.94 }] }, to: { opacity: 1, transform: [{ scale: 1 }] } },
        animationDuration: "600ms",
        animationDelay: "350ms",
        animationFillMode: "both",
        animationTimingFunction: "ease-out",
      } as const);

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay, { paddingBottom: dock + 12 }]} accessibilityViewIsModal>
      <Glass blur radius={0} style={StyleSheet.absoluteFill} />
      <View style={styles.reward}>
        <View>
          <Cloche state={after} size={176} />
          <Animated.View style={[StyleSheet.absoluteFill, grow]}>
            <Cloche state={after} size={176} grown />
          </Animated.View>
        </View>
        <T v="hero" style={styles.center}>
          Session done. Your plant grew a leaf.
        </T>
        <View style={styles.gains}>
          <Clay small radius={999} style={styles.gain}>
            <Glyph name="check" color={colors.lamplight} size={14} />
            <T v="meta" style={styles.gainText}>
              {mins} min · {course}
            </T>
          </Clay>
          {improved && (
            <Clay small radius={999} style={styles.gain}>
              <StateIcon state={after} color={stateColor[after]} />
              <T v="meta" style={styles.gainText}>
                Up to {stateName[after]}
              </T>
            </Clay>
          )}
        </View>
        {next && (
          <T v="meta" style={styles.center}>
            Next: {next}
          </T>
        )}
      </View>
      <View style={styles.overlayKey}>
        <Key title="Back to Today" color={stateColor[after]} onPress={onDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: "center" },
  head: { alignItems: "center", gap: 10 },
  level: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6 },
  levelText: { color: colors.ink },
  note: { padding: 14 },
  stack: { gap: 2 },
  empty: { paddingTop: 120, gap: 10 },
  overlay: { justifyContent: "space-between" },
  reward: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 28 },
  gains: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10 },
  gain: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7 },
  gainText: { color: colors.ink },
  overlayKey: { width: "100%", maxWidth: 560, alignSelf: "center", paddingHorizontal: 20 },
});
