import { describe, expect, it } from "vitest";
import { hm, mergeWeek, momentum, planWeek, SAMPLE_NOW, SAMPLE_SKIPPED, sampleWeek } from "../src";
import type { Block, MomentumState, PlanInput } from "../src";

const week = planWeek(sampleWeek);
const study = (blocks: Block[]) => blocks.filter(b => b.slot !== "fixed");
const mins = (blocks: Block[]) => study(blocks).reduce((sum, b) => sum + b.end - b.start, 0);
const on = (day: number, blocks = week.blocks) => blocks.filter(b => b.day === day);

describe("planWeek on the sample week", () => {
  it("fits everything due this week", () => {
    expect(week.shortfalls).toEqual([]);
    expect(week.conflicts).toEqual([]);
    expect(mins(week.blocks)).toBe(345);
  });

  it("uses the lunch slot for a short lecture", () => {
    const lunch = week.blocks.find(b => b.slot === "lunch");
    expect(lunch).toMatchObject({ day: 0, start: hm(12, 30), itemId: "phy-lec3" });
  });

  it("puts a lecture due before a live class ahead of it", () => {
    const lecture = week.blocks.find(b => b.itemId === "mth-lec4")!;
    expect(lecture).toMatchObject({ day: 0, start: hm(19) });
  });

  it("finishes test prep by the end of the day before the test", () => {
    const prep = week.blocks.filter(b => b.itemId.startsWith("gst-u"));
    expect(prep).toHaveLength(3);
    for (const b of prep) expect(b.day).toBeLessThan(4);
  });

  it("counts a live class as one of the day's sessions", () => {
    expect(study(on(2)).filter(b => b.slot === "evening")).toHaveLength(1);
  });

  it("keeps 30 minutes clear before a test and plans nothing after it", () => {
    for (const b of study(on(4))) expect(b.end).toBeLessThanOrEqual(hm(18, 30));
  });

  it("never splits an item that fits in one session", () => {
    for (const id of ["gst-u1", "gst-u2", "gst-u3", "mth-lec4", "phy-lec3", "phy-u2"]) {
      expect(week.blocks.filter(b => b.itemId === id)).toHaveLength(1);
    }
  });

  it("splits long items into parts of at least 15 minutes", () => {
    const parts = week.blocks.filter(b => b.itemId === "csc-u3");
    expect(parts.map(b => b.part)).toEqual([1, 2]);
    for (const b of study(week.blocks)) expect(b.end - b.start).toBeGreaterThanOrEqual(15);
  });

  it("respects each day's session limit and latest finish", () => {
    for (let day = 0; day < 7; day++) {
      const p = sampleWeek.profiles[day];
      const evening = on(day).filter(b => b.slot === "evening" || (b.slot === "fixed" && b.itemId === "mth-live"));
      expect(evening.length).toBeLessThanOrEqual(p.maxSessions);
      for (const b of study(on(day))) expect(b.end).toBeLessThanOrEqual(p.latest);
    }
  });

  it("leaves Sunday for the review when nothing is late", () => {
    expect(study(on(6))).toEqual([]);
  });
});

describe("re-planning", () => {
  it("moves a missed session to later the same evening when it still fits", () => {
    const replan = planWeek({ ...sampleWeek, now: { day: 0, min: hm(20, 5) }, done: { "phy-lec3": 25 }, missed: ["mth-lec4"] });
    expect(replan.blocks.find(b => b.itemId === "mth-lec4")).toMatchObject({ day: 0, start: hm(20, 5) });
    expect(replan.blocks.find(b => b.itemId === "gst-u1")).toMatchObject({ day: 0, start: hm(21, 5) });
    expect(on(1, replan.blocks)).toEqual(on(1));
    expect(replan.shortfalls).toEqual([]);
  });

  it("warns early when the work cannot fit before its deadline", () => {
    const heavy: PlanInput = {
      ...sampleWeek,
      items: sampleWeek.items.map(i => (i.id === "gst-u3" ? { ...i, mins: 400 } : i)),
    };
    expect(planWeek(heavy).shortfalls).toEqual(["GST 101 Unit 3 cannot be finished before its deadline"]);
  });

  it("flags a live class that clashes with work", () => {
    const clash: PlanInput = {
      ...sampleWeek,
      items: [...sampleWeek.items, { id: "csc-live", course: "CSC 101", kind: "live", title: "CSC 101 live class", mins: 60, at: { day: 1, min: hm(11) }, order: 0 }],
    };
    expect(planWeek(clash).conflicts).toEqual(["CSC 101 live class clashes with work"]);
  });

  it("counts sessions held earlier today toward the day's limit", () => {
    const first = on(0).find(b => b.slot === "evening")!;
    const replan = planWeek({
      ...sampleWeek,
      now: { day: 0, min: hm(19, 55) },
      done: { "phy-lec3": 25, [first.itemId]: first.end - first.start },
      earlier: [first],
    });
    expect(on(0, replan.blocks).filter(b => b.slot === "evening")).toHaveLength(1);
  });

  it("keeps sessions that already started and takes the rest from the re-plan", () => {
    const now = { day: 0, min: hm(20, 5) };
    const fresh = planWeek({ ...sampleWeek, now, done: { "phy-lec3": 25 }, missed: ["mth-lec4"] });
    const merged = mergeWeek(week.blocks, fresh.blocks, now);
    expect(on(0, merged).map(b => [b.itemId, b.start])).toEqual([
      ["phy-lec3", hm(12, 30)],
      ["mth-lec4", hm(19)],
      ["gst-u1", hm(20)],
      ["mth-lec4", hm(20, 5)],
      ["gst-u1", hm(21, 5)],
    ]);
  });

  it("never repeats a fixed event that is under way", () => {
    const now = { day: 2, min: hm(20, 30) };
    const merged = mergeWeek(week.blocks, planWeek({ ...sampleWeek, now }).blocks, now);
    expect(merged.filter(b => b.itemId === "mth-live")).toHaveLength(1);
  });
});

describe("momentum on Wednesday at 7:42pm", () => {
  const now = { day: 2, min: hm(19, 42) };
  const doneExcept = (skip: (b: Block) => boolean) => {
    const done: Record<string, number> = {};
    for (const b of study(week.blocks)) {
      if (b.day * 1440 + b.end > now.day * 1440 + now.min || skip(b)) continue;
      done[b.itemId] = (done[b.itemId] ?? 0) + b.end - b.start;
    }
    return done;
  };
  const stateIf = (skip: (b: Block) => boolean) =>
    momentum({ plan: week.blocks, items: sampleWeek.items, done: doneExcept(skip), now, shortfalls: week.shortfalls });

  it("is Thriving when every session so far is done", () => {
    expect(stateIf(() => false)).toMatchObject({ pct: 100, state: "thriving" });
  });

  it("is On track at 80%", () => {
    expect(stateIf(b => b.day === 2)).toMatchObject({ pct: 80, state: "ontrack" });
  });

  it("is Slipping below 80%", () => {
    expect(stateIf(b => b.day === 0 && b.slot === "evening")).toMatchObject({ pct: 61, state: "slipping" });
  });

  it("is Danger when a test is close and its prep is behind, whatever the score", () => {
    const m = stateIf(b => b.day === 1 && b.slot === "evening");
    expect(m).toMatchObject({ pct: 71, state: "danger" });
    expect(m.risks).toEqual([{ itemId: "gst-test", title: "GST 101 test", hoursAway: 47, prepDone: 30, prepTotal: 90 }]);
  });

  it.each<MomentumState>(["thriving", "ontrack", "slipping", "danger"])("has a sample scenario that lands on %s", state => {
    expect(SAMPLE_NOW).toEqual(now);
    expect(stateIf(SAMPLE_SKIPPED[state]).state).toBe(state);
  });

  it("gives no verdict before an hour has been planned", () => {
    const monday = momentum({ plan: week.blocks, items: sampleWeek.items, done: {}, now: { day: 0, min: hm(13) }, shortfalls: [] });
    expect(monday).toMatchObject({ pct: null, state: "ontrack" });
  });
});
