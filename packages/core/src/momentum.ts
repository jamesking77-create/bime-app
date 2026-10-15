import { abs } from "./time";
import type { Block, Item, Moment, Momentum, MomentumState, Risk } from "./types";

export const THRESHOLDS = {
  /** Below this share of the plan: Danger. */
  danger: 50,
  /** Below this: Slipping. */
  slipping: 80,
  /** At or above this, with nothing at risk: Thriving. */
  thriving: 100,
  /** No verdict until this many minutes have been planned this week. */
  minPlannedMins: 60,
  /** A test this close with under half its prep done is Danger. */
  riskHours: 72,
};

/**
 * How the week is going: minutes studied over minutes planned in sessions that
 * have already ended, overridden by deadline risk.
 */
export function momentum(args: {
  plan: Block[];
  items: Item[];
  /** Minutes studied this week, per item id. */
  done: Record<string, number>;
  now: Moment;
  shortfalls: string[];
}): Momentum {
  const { plan, items, done, now, shortfalls } = args;
  const nowAbs = abs(now.day, now.min);
  const plannedMins = plan
    .filter(b => b.slot !== "fixed" && abs(b.day, b.end) <= nowAbs)
    .reduce((sum, b) => sum + (b.end - b.start), 0);
  const doneMins = Object.values(done).reduce((sum, m) => sum + m, 0);
  const pct = plannedMins < THRESHOLDS.minPlannedMins ? null : Math.round((doneMins / plannedMins) * 100);

  const risks: Risk[] = [];
  for (const test of items.filter(i => i.kind === "test" && i.at)) {
    const hoursAway = (abs(test.at!.day, test.at!.min) - nowAbs) / 60;
    if (hoursAway < 0 || hoursAway > THRESHOLDS.riskHours) continue;
    const prep = items.filter(i => i.prepFor === test.id);
    const prepTotal = prep.reduce((sum, i) => sum + i.mins, 0);
    const prepDone = prep.reduce((sum, i) => sum + Math.min(done[i.id] ?? 0, i.mins), 0);
    if (prepDone < prepTotal / 2) {
      risks.push({ itemId: test.id, title: test.title, hoursAway: Math.round(hoursAway), prepDone, prepTotal });
    }
  }

  let state: MomentumState;
  if (risks.length || (pct !== null && pct < THRESHOLDS.danger)) state = "danger";
  else if (shortfalls.length || (pct !== null && pct < THRESHOLDS.slipping)) state = "slipping";
  else if (pct === null || pct < THRESHOLDS.thriving) state = "ontrack";
  else state = "thriving";

  return { pct, doneMins, plannedMins, risks, state };
}
