import { abs, DAY } from "./time";
import type { Block, DayProfile, Item, PlanInput, PlanResult } from "./types";

// The planning rules from 04-data-model-and-scheduling.md, section 2.
export const RULES = {
  /** Never plan a session shorter than this. */
  minChunk: 15,
  /** A session may run this much over so an item is finished in one sitting. */
  stretch: 10,
  /** Sessions of one course per day, unless its deadline is close. */
  sameCoursePerDay: 2,
  /** "Close" means within this many days. */
  soonDays: 3,
  /** Free time before a live class, to log in. */
  liveBufferBefore: 10,
  liveBufferAfter: 5,
  /** Free time before a test, to settle. Nothing new is planned after a test. */
  testBufferBefore: 30,
};

const END_OF_WEEK = abs(7, 0);

/**
 * When an item must be finished. Test preparation is due by the end of the day
 * before the test; items with no deadline are paced within the week.
 */
export function deadline(item: Item, items: Item[]): number {
  if (item.due) return abs(item.due.day, item.due.min);
  if (item.prepFor) {
    const test = items.find(i => i.id === item.prepFor);
    if (test?.at) return abs(test.at.day, 0);
  }
  return END_OF_WEEK + item.order;
}

type Window = [number, number];

function subtract(wins: Window[], from: number, to: number): Window[] {
  return wins.flatMap(([a, b]): Window[] => {
    if (to <= a || from >= b) return [[a, b]];
    const left: Window[] = from > a ? [[a, from]] : [];
    const right: Window[] = to < b ? [[to, b]] : [];
    return [...left, ...right];
  });
}

/** Free study time on one day, after work, commitments and fixed events. */
export function freeWindows(day: number, input: PlanInput): Window[] {
  const p = input.profiles[day];
  let start = p.earliest;
  if (p.kind === "onsite" && p.workEnd !== undefined) start = p.workEnd + p.commute + p.unwind;
  if (p.kind === "remote" && p.workEnd !== undefined) start = p.workEnd + p.unwind;
  let wins: Window[] = [[start, p.latest]];
  for (const c of input.commitments.filter(c => c.weekday === day)) {
    wins = subtract(wins, c.start, c.end + c.restAfter);
  }
  for (const f of input.items.filter(i => i.at?.day === day)) {
    const isTest = f.kind === "test";
    const before = isTest ? RULES.testBufferBefore : RULES.liveBufferBefore;
    const after = isTest ? DAY : f.at!.min + f.mins + RULES.liveBufferAfter;
    wins = subtract(wins, f.at!.min - before, after);
  }
  return wins.filter(([a, b]) => b - a >= RULES.minChunk);
}

/** Plan the rest of the week. Pure: the same input always gives the same plan. */
export function planWeek(input: PlanInput): PlanResult {
  const { items, profiles, courseOrder, now } = input;
  const done = input.done ?? {};
  const missed = new Set(input.missed ?? []);
  const remaining = new Map(items.filter(i => !i.at).map(i => [i.id, i.mins - (done[i.id] ?? 0)]));
  const parts = new Map<string, number>();
  const late = new Set<string>();
  const blocks: Block[] = [];
  const nowAbs = abs(now.day, now.min);

  for (let day = now.day; day < 7; day++) {
    const p: DayProfile = profiles[day];
    const perCourse = new Map<string, number>();
    const fixedToday = items.filter(i => i.at?.day === day);
    for (const f of fixedToday) {
      blocks.push({ day, start: f.at!.min, end: f.at!.min + f.mins, itemId: f.id, title: f.title, course: f.course, slot: "fixed" });
    }
    let sessions = fixedToday.filter(f => f.kind === "live").length;

    const pick = (start: number, room: number, lunch: boolean, windowEnd: number): Item | undefined => {
      const at = abs(day, start);
      const candidates = items.filter(i => {
        const left = remaining.get(i.id) ?? 0;
        if (i.at || left <= 0) return false;
        if (lunch) return (i.kind === "lecture" || i.kind === "reading") && left <= room;
        // Items that fit in one session are never split; they wait for a slot that fits.
        if (left <= p.sessionMins + RULES.stretch && (left > room + RULES.stretch || start + left > windowEnd)) return false;
        const soon = deadline(i, items) - at <= RULES.soonDays * DAY;
        if (p.catchUpOnly && !(soon || missed.has(i.id))) return false;
        if (!soon && (perCourse.get(i.course) ?? 0) >= RULES.sameCoursePerDay) return false;
        // Test prep may spill into test day as a last resort, never past the test itself.
        if (i.prepFor) {
          const test = items.find(t => t.id === i.prepFor);
          if (test?.at) return at + Math.min(left, room) <= abs(test.at.day, test.at.min);
        }
        return true; // overdue work stays in the plan, first in line
      });
      // Earliest deadline first. Deadlines on the same day: on remote days and days
      // off prefer deep work (reading, exercises); then course order, then unit order.
      const deep = (i: Item) => (p.kind !== "onsite" && i.kind !== "lecture" ? 0 : 1);
      const dayOf = (i: Item) => Math.floor(deadline(i, items) / DAY);
      candidates.sort((a, b) =>
        dayOf(a) - dayOf(b) ||
        deep(a) - deep(b) ||
        deadline(a, items) - deadline(b, items) ||
        courseOrder.indexOf(a.course) - courseOrder.indexOf(b.course) ||
        a.order - b.order);
      return candidates[0];
    };

    const place = (item: Item, start: number, len: number, slot: Block["slot"]) => {
      const left = remaining.get(item.id)!;
      const n = (parts.get(item.id) ?? 0) + 1;
      parts.set(item.id, n);
      const split = len < left || n > 1;
      blocks.push({ day, start, end: start + len, itemId: item.id, title: item.title, course: item.course, slot, level: p.level, part: split ? n : undefined });
      remaining.set(item.id, left - len);
      if (abs(day, start + len) > deadline(item, items)) late.add(item.id);
      perCourse.set(item.course, (perCourse.get(item.course) ?? 0) + 1);
    };

    if (p.lunch && abs(day, p.lunch.start) >= nowAbs) {
      const item = pick(p.lunch.start, p.lunch.mins, true, p.lunch.start + p.lunch.mins);
      if (item) place(item, p.lunch.start, remaining.get(item.id)!, "lunch");
    }

    for (const [a, b] of freeWindows(day, input)) {
      let cursor = day === now.day ? Math.max(a, now.min) : a;
      while (sessions < p.maxSessions) {
        const room = Math.min(p.sessionMins, b - cursor);
        if (room < RULES.minChunk) break;
        const item = pick(cursor, room, false, b);
        if (!item) break;
        const left = remaining.get(item.id)!;
        // Finish an item in one go if it only overruns a little.
        let len = left <= room + RULES.stretch && cursor + left <= b ? left : Math.min(left, room);
        // Never leave a scrap shorter than the minimum for another day.
        if (left - len > 0 && left - len < RULES.minChunk) len = left - RULES.minChunk;
        place(item, cursor, len, "evening");
        cursor += len + p.breakMins;
        sessions++;
      }
    }
  }

  const shortfalls = items
    .filter(i => !i.at && deadline(i, items) < END_OF_WEEK && ((remaining.get(i.id) ?? 0) > 0 || late.has(i.id)))
    .map(i => `${i.title} cannot be finished before its deadline`);

  const conflicts = items
    .filter(i => {
      if (!i.at) return false;
      const p = profiles[i.at.day];
      if (p.workStart === undefined || p.workEnd === undefined) return false;
      return i.at.min < p.workEnd + p.commute && i.at.min + i.mins > p.workStart - p.commute;
    })
    .map(i => `${i.title} clashes with work`);

  blocks.sort((x, y) => abs(x.day, x.start) - abs(y.day, y.start));
  return { blocks, shortfalls, conflicts };
}
