export const DAY = 24 * 60;

/** Minutes from midnight for a clock time. */
export const hm = (h: number, m = 0) => h * 60 + m;

/** Minutes from the start of the week. */
export const abs = (day: number, min: number) => day * DAY + min;

/** "7:05pm" style clock text. */
export function clock(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")}${h >= 12 ? "pm" : "am"}`;
}
