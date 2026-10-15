import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useGlobalSearchParams } from "expo-router";
import {
  abs,
  clock,
  mergeWeek,
  momentum,
  planWeek,
  SAMPLE_NOW,
  SAMPLE_SKIPPED,
  sampleWeek,
  type Block,
  type DayProfile,
  type Item,
  type Level,
  type Moment,
  type Momentum,
  type MomentumState,
} from "@bime/core";
import type { DayBar } from "../ui/Vials";

// The sample week as the app sees it, until course entry and the local
// database exist. It is frozen at Wednesday 7:42pm and can be previewed in each
// of the four momentum states. Lock-in sessions finished in the app count
// toward it, so finishing one can move the state.

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT = ["M", "T", "W", "T", "F", "S", "S"];
const DATES = ["12 October", "13 October", "14 October", "15 October", "16 October", "17 October", "18 October"];

export const LEVEL_NAME: Record<Level, string> = { gentle: "Gentle", focused: "Focused", locked: "Locked" };

/** A lock-in session ended in the app. Kept in memory for now. */
export interface Held {
  itemId: string;
  title: string;
  course: string;
  mins: number;
  early: boolean;
}

export type RowKind = "work" | "fixed" | "done" | "missed" | "next" | "upcoming";

/** One line of today's timeline. */
export interface Row {
  key: string;
  kind: RowKind;
  start: number;
  title: string;
  meta: string;
  justNow?: boolean;
}

export interface Week {
  preview: MomentumState;
  now: Moment;
  date: string;
  profile: DayProfile;
  items: Item[];
  momentum: Momentum;
  shortfalls: string[];
  rows: Row[];
  /** The next study session in the plan, today or later. */
  next?: Block;
  days: DayBar[];
  /** Missed sessions whose work isn't done yet. */
  behind: number;
  /** When the plan has fitted the missed work back in. */
  catchUp?: Block;
}

/** "9:05pm", "tomorrow 7:00pm" or "Friday 5:30pm", seen from `now`. */
export function when(b: { day: number; start: number }, now: Moment): string {
  if (b.day === now.day) return clock(b.start);
  return `${b.day === now.day + 1 ? "tomorrow" : WEEKDAYS[b.day]} ${clock(b.start)}`;
}

export function buildWeek(preview: MomentumState, held: Held[]): Week {
  const now = SAMPLE_NOW;
  const nowAbs = abs(now.day, now.min);
  const items = sampleWeek.items;
  const byId = new Map(items.map(i => [i.id, i]));
  const profile = sampleWeek.profiles[now.day];
  const skipped = SAMPLE_SKIPPED[preview];
  const started = (b: Block) => abs(b.day, b.start) < nowAbs;

  // The plan as made on Monday morning, and what happened to it since.
  const original = planWeek(sampleWeek);
  const past = original.blocks.filter(b => b.slot !== "fixed" && started(b));
  const kept = past.filter(b => !skipped(b));
  const missed = past.filter(skipped);

  const done: Record<string, number> = {};
  const add = (id: string, mins: number) => (done[id] = (done[id] ?? 0) + mins);
  for (const b of kept) add(b.itemId, b.end - b.start);
  for (const h of held) add(h.itemId, h.mins);

  // Re-plan the rest of the week from now.
  const heldBlocks: Block[] = held.map(h => ({
    day: now.day, start: now.min - h.mins, end: now.min, itemId: h.itemId, title: h.title, course: h.course, slot: "evening",
  }));
  const fresh = planWeek({
    ...sampleWeek,
    now,
    done,
    missed: missed.map(b => b.itemId),
    earlier: [...kept.filter(b => b.day === now.day), ...heldBlocks],
  });
  const plan = mergeWeek(original.blocks, fresh.blocks, now);
  const m = momentum({ plan, items, done, now, shortfalls: fresh.shortfalls });

  const ahead = plan.filter(b => b.slot !== "fixed" && !started(b));
  const next = ahead[0];
  const finished = (id: string) => (done[id] ?? 0) >= (byId.get(id)?.mins ?? Infinity);
  const movedTo = (b: Block) => ahead.find(f => f.itemId === b.itemId);
  const stillMissed = missed.filter(b => !finished(b.itemId));
  const catchUp = stillMissed
    .map(movedTo)
    .filter((b): b is Block => !!b)
    .sort((x, y) => abs(y.day, y.start) - abs(x.day, x.start))[0];

  const rows: Row[] = [];
  if (profile.workStart !== undefined && profile.workEnd !== undefined) {
    rows.push({
      key: "work",
      kind: "work",
      start: profile.workStart,
      title: "Work",
      meta: `Until ${clock(profile.workEnd)} · ${profile.kind === "onsite" ? "onsite" : "from home"}`,
    });
  }
  for (const b of plan.filter(b => b.day === now.day)) {
    const len = b.end - b.start;
    const key = `${b.itemId}-${b.start}`;
    const part = b.part ? ` · part ${b.part}` : "";
    if (b.slot === "fixed") {
      const test = byId.get(b.itemId)?.kind === "test";
      rows.push({ key, kind: "fixed", start: b.start, title: b.title, meta: test ? "Test · fixed time" : "Live class · fixed time" });
    } else if (started(b) && skipped(b)) {
      const moved = movedTo(b);
      const meta = finished(b.itemId) ? "Missed · made up since" : moved ? `Missed · moved to ${when(moved, now)}` : "Missed";
      rows.push({ key, kind: "missed", start: b.start, title: b.title, meta });
    } else if (started(b)) {
      rows.push({ key, kind: "done", start: b.start, title: b.title, meta: `Done · ${len} min${part}` });
    } else {
      const how = b.slot === "lunch" ? "Lunch break" : LEVEL_NAME[b.level ?? profile.level];
      rows.push({ key, kind: b === next ? "next" : "upcoming", start: b.start, title: b.title, meta: `${how} · ${len} min${part}` });
    }
  }
  held.forEach((h, i) => {
    rows.push({
      key: `held-${i}`,
      kind: "done",
      start: now.min,
      title: h.title,
      meta: h.early ? `Ended early · ${h.mins} min counted` : `Done · ${h.mins} min`,
      justNow: true,
    });
  });
  rows.sort((x, y) => x.start - y.start);

  const days: DayBar[] = WEEKDAYS.map((name, d) => {
    const study = plan.filter(b => b.day === d && b.slot !== "fixed");
    // A session missed and moved later the same day is one plan, not two.
    const counted = study.filter(b => !(started(b) && skipped(b) && movedTo(b)?.day === d));
    const planned = counted.reduce((sum, b) => sum + b.end - b.start, 0);
    const heldMins = d === now.day ? held.reduce((sum, h) => sum + h.mins, 0) : 0;
    const studied = study.filter(b => started(b) && !skipped(b)).reduce((sum, b) => sum + b.end - b.start, 0) + heldMins;
    return { short: DAY_SHORT[d], name, planned, done: studied, isToday: d === now.day, isFuture: d > now.day };
  });

  return {
    preview,
    now,
    date: `${WEEKDAYS[now.day]} ${DATES[now.day]}`,
    profile,
    items,
    momentum: m,
    shortfalls: fresh.shortfalls,
    rows,
    next,
    days,
    behind: stillMissed.length,
    catchUp,
  };
}

type WeekApi = Week & {
  setPreview: (state: MomentumState) => void;
  addHeld: (h: Held) => void;
};

const WeekContext = createContext<WeekApi | null>(null);

const isState = (s: unknown): s is MomentumState => s === "thriving" || s === "ontrack" || s === "slipping" || s === "danger";

export function WeekProvider({ children }: { children: ReactNode }) {
  // On the web, opening /?preview=danger starts the sample week in that state.
  const { preview: asked } = useGlobalSearchParams<{ preview?: string }>();
  const [preview, setPreviewState] = useState<MomentumState>(isState(asked) ? asked : "ontrack");
  const [held, setHeld] = useState<Held[]>([]);

  const setPreview = useCallback((state: MomentumState) => {
    setPreviewState(state);
    setHeld([]);
  }, []);

  const addHeld = useCallback((h: Held) => setHeld(list => [...list, h]), []);
  const week = useMemo(() => buildWeek(preview, held), [preview, held]);
  const value = useMemo(() => ({ ...week, setPreview, addHeld }), [week, setPreview, addHeld]);
  return <WeekContext.Provider value={value}>{children}</WeekContext.Provider>;
}

export function useWeek(): WeekApi {
  const value = useContext(WeekContext);
  if (!value) throw new Error("useWeek must be used inside WeekProvider");
  return value;
}
