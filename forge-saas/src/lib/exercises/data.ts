import raw from "./_data.json";
import type { DayTemplate } from "./types";

// The 6-day Push/Pull/Legs template, ported from the original FORGE app.
// Exercise selection is fixed (a well-balanced PPL split works across goals);
// the generator personalizes sets/reps/rest and nutrition on top of this.
export const DAY_TEMPLATES = raw as unknown as DayTemplate[];

export function getDayTemplate(dayNumber: number): DayTemplate | undefined {
  return DAY_TEMPLATES.find((d) => d.dayNumber === dayNumber);
}
