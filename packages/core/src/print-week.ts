// Prints the sample week's plan:  npm run plan
import { clock, planWeek, sampleWeek, SAMPLE_DAYS } from "./index";

const result = planWeek(sampleWeek);
for (let day = 0; day < 7; day++) {
  const blocks = result.blocks.filter(b => b.day === day);
  if (!blocks.length) continue;
  console.log(`\n${SAMPLE_DAYS[day]} (${sampleWeek.profiles[day].kind}, ${sampleWeek.profiles[day].level})`);
  for (const b of blocks) {
    const tag = b.slot === "fixed" ? "fixed" : b.slot === "lunch" ? "lunch" : `${b.end - b.start} min`;
    console.log(`  ${clock(b.start)}-${clock(b.end)}  ${b.title}${b.part ? ` (part ${b.part})` : ""}  [${tag}]`);
  }
}
const studyMins = result.blocks.filter(b => b.slot !== "fixed").reduce((sum, b) => sum + b.end - b.start, 0);
console.log(`\nStudy planned: ${(studyMins / 60).toFixed(1)} h`);
console.log(result.shortfalls.length ? `Will not fit: ${result.shortfalls.join("; ")}` : "Everything due this week fits.");
