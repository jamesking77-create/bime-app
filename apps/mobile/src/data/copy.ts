import type { Moment } from "@bime/core";
import { clock } from "@bime/core";
import { WEEKDAYS, type Week } from "./week";

// What BIME says about the week, in the user's own units: sessions, minutes,
// days. Coach tone for now; Supportive and Drill sergeant come with Settings.

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function dayWord(day: number, now: Moment): string {
  if (day === now.day) return "tonight";
  if (day === now.day + 1) return "tomorrow";
  return WEEKDAYS[day];
}

/** The hero line on Today. */
export function headline(w: Week): string {
  const { momentum: m, now } = w;
  const risk = m.risks[0];
  if (risk) {
    const test = w.items.find(i => i.id === risk.itemId);
    const day = test?.at ? dayWord(test.at.day, now) : "soon";
    return `${risk.title} ${day}. ${risk.prepDone} of ${risk.prepTotal} prep minutes done.`;
  }
  if (m.state === "danger") return "Under half of this week's plan is done. One session turns it.";
  if (m.state === "slipping") {
    if (!w.behind) return "A little behind the plan this week.";
    const when = w.catchUp ? dayWord(w.catchUp.day, now) : undefined;
    const fix = !when ? "Your plan needs more room." : when === "tonight" ? "Your plan catches up tonight." : `Your plan catches up by ${when}.`;
    return `${plural(w.behind, "session")} behind. ${fix}`;
  }
  if (m.state === "thriving") {
    return m.pct !== null && m.pct > 100 ? `Ahead of the plan at ${m.pct}%.` : "Every planned session so far, done.";
  }
  if (w.behind && w.catchUp?.day === now.day) {
    return `Steady week. Tonight's missed session moved to ${clock(w.catchUp.start)}.`;
  }
  return m.pct === null ? "Fresh week. Your first session sets the pace." : `On track at ${m.pct}% of the plan so far.`;
}

/** The numbers under the headline. */
export function scoreLine(w: Week): string {
  const { pct, doneMins, plannedMins } = w.momentum;
  if (pct === null) return "Less than an hour planned so far this week";
  return `${doneMins} of ${plannedMins} planned min done so far · ${pct}%`;
}
