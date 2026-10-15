// Shapes the planner works with. Times of day are minutes from midnight in the
// user's local time; days are 0 (Monday) to 6 (Sunday) of the week being planned.
// The stored records (with ids and sync columns) are described in
// 04-data-model-and-scheduling.md; these are the planner's in-memory view of them.

export type Level = "gentle" | "focused" | "locked";
export type DayKind = "onsite" | "remote" | "off" | "review";
export type ItemKind = "reading" | "lecture" | "exercise" | "assignment" | "revision" | "live" | "test";
export type MomentumState = "thriving" | "ontrack" | "slipping" | "danger";

export interface DayProfile {
  kind: DayKind;
  workStart?: number;
  workEnd?: number;
  /** Each way, onsite days only. */
  commute: number;
  /** Dinner and rest after work, before the first session. */
  unwind: number;
  /** First possible study minute on days without work. */
  earliest: number;
  /** Every session must end by this. */
  latest: number;
  level: Level;
  sessionMins: number;
  breakMins: number;
  /** Evening sessions allowed; a live class counts as one. */
  maxSessions: number;
  /** Optional short slot during the working day. */
  lunch?: { start: number; mins: number };
  /** Sunday: only work that is late or due soon. */
  catchUpOnly?: boolean;
}

export interface Commitment {
  weekday: number;
  start: number;
  end: number;
  title: string;
  /** Rest needed after it before studying. */
  restAfter: number;
}

export interface Moment {
  day: number;
  min: number;
}

export interface Item {
  id: string;
  course: string;
  kind: ItemKind;
  title: string;
  /** Estimate for flexible work; length for live classes and tests. */
  mins: number;
  /** Live classes and tests only: fixed, never moved. */
  at?: Moment;
  /** Flexible work: finish before this. */
  due?: Moment;
  /** Id of the test this item prepares for. */
  prepFor?: string;
  /** Unit order within the course. */
  order: number;
}

export interface Block {
  day: number;
  start: number;
  end: number;
  itemId: string;
  title: string;
  course: string;
  slot: "evening" | "lunch" | "fixed";
  level?: Level;
  part?: number;
}

export interface PlanInput {
  /** Seven profiles, Monday first. */
  profiles: DayProfile[];
  commitments: Commitment[];
  items: Item[];
  /** Earlier courses win ties. */
  courseOrder: string[];
  /** Plan from this moment to the end of the week. */
  now: Moment;
  /** Minutes already studied, per item id. */
  done?: Record<string, number>;
  /** Items whose planned session was missed this week. */
  missed?: string[];
}

export interface PlanResult {
  blocks: Block[];
  /** Work that cannot be finished before its deadline. */
  shortfalls: string[];
  /** Fixed events that clash with work. */
  conflicts: string[];
}

export interface Momentum {
  /** Share of the plan done so far, or null before an hour has been planned. */
  pct: number | null;
  doneMins: number;
  plannedMins: number;
  risks: string[];
  state: MomentumState;
}
