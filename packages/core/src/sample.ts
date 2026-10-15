import { hm } from "./time";
import type { Block, Commitment, DayProfile, Item, Moment, MomentumState, PlanInput } from "./types";

// King's sample week (12 to 18 October 2026), used by the tests and by the app
// until real data entry exists. Work hours and chores times are assumptions.

export const SAMPLE_DAYS = ["Mon 12 Oct", "Tue 13 Oct", "Wed 14 Oct", "Thu 15 Oct", "Fri 16 Oct", "Sat 17 Oct", "Sun 18 Oct"];

const onsite: DayProfile = {
  kind: "onsite", workStart: hm(9), workEnd: hm(17), commute: 60, unwind: 60,
  earliest: hm(6), latest: hm(22, 30), level: "focused",
  sessionMins: 40, breakMins: 10, maxSessions: 2, lunch: { start: hm(12, 30), mins: 25 },
};
const remote: DayProfile = { ...onsite, kind: "remote", commute: 0, unwind: 30, level: "locked", sessionMins: 50, maxSessions: 3, lunch: undefined };
const saturday: DayProfile = { kind: "off", commute: 0, unwind: 0, earliest: hm(9), latest: hm(21), level: "gentle", sessionMins: 45, breakMins: 10, maxSessions: 1 };
const sunday: DayProfile = { kind: "review", commute: 0, unwind: 0, earliest: hm(17, 40), latest: hm(21), level: "gentle", sessionMins: 45, breakMins: 10, maxSessions: 1, catchUpOnly: true };

const commitments: Commitment[] = [
  { weekday: 5, start: hm(9), end: hm(14), title: "Chores", restAfter: 60 },
  { weekday: 6, start: hm(8, 30), end: hm(13, 30), title: "Church", restAfter: 0 },
  { weekday: 6, start: hm(17), end: hm(17, 30), title: "Weekly review", restAfter: 10 },
];

const items: Item[] = [
  { id: "mth-live", course: "MTH 101", kind: "live", title: "MTH 101 live class", mins: 60, at: { day: 2, min: hm(20) }, order: 0 },
  { id: "gst-test", course: "GST 101", kind: "test", title: "GST 101 test", mins: 45, at: { day: 4, min: hm(19) }, order: 0 },
  { id: "gst-u1", course: "GST 101", kind: "reading", title: "GST 101 Unit 1", mins: 30, prepFor: "gst-test", order: 1 },
  { id: "gst-u2", course: "GST 101", kind: "reading", title: "GST 101 Unit 2", mins: 30, prepFor: "gst-test", order: 2 },
  { id: "gst-u3", course: "GST 101", kind: "reading", title: "GST 101 Unit 3", mins: 30, prepFor: "gst-test", order: 3 },
  { id: "mth-lec4", course: "MTH 101", kind: "lecture", title: "MTH 101 recorded lecture 4", mins: 50, due: { day: 2, min: hm(20) }, order: 1 },
  { id: "mth-ex4", course: "MTH 101", kind: "exercise", title: "MTH 101 Unit 4 exercises", mins: 60, due: { day: 6, min: hm(23, 59) }, order: 2 },
  { id: "csc-u3", course: "CSC 101", kind: "reading", title: "CSC 101 Unit 3", mins: 80, order: 1 },
  { id: "phy-lec3", course: "PHY 101", kind: "lecture", title: "PHY 101 recorded lecture 3", mins: 25, order: 1 },
  { id: "phy-u2", course: "PHY 101", kind: "reading", title: "PHY 101 Unit 2", mins: 40, order: 2 },
];

/** The week as planned on Monday at 6am. */
export const sampleWeek: PlanInput = {
  profiles: [onsite, onsite, onsite, onsite, remote, saturday, sunday],
  commitments,
  items,
  courseOrder: ["GST 101", "MTH 101", "CSC 101", "PHY 101"],
  now: { day: 0, min: hm(6) },
};

/** Wednesday at 7:42pm, the moment the prototype and doc 04 use. */
export const SAMPLE_NOW: Moment = { day: 2, min: hm(19, 42) };

/**
 * Four ways the sample week could have gone by SAMPLE_NOW, one per momentum
 * state (doc 04, section 4). Each picks out the planned sessions that were skipped.
 */
export const SAMPLE_SKIPPED: Record<MomentumState, (b: Block) => boolean> = {
  thriving: () => false,
  ontrack: b => b.day === 2 && b.slot === "evening",
  slipping: b => b.day === 0 && b.slot === "evening",
  danger: b => b.day === 1 && b.slot === "evening",
};
