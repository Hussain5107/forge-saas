// Spreads the fixed 6-day Push/Pull/Legs cycle differently across each
// user's week, so colleagues sharing the app don't all land on the same
// body part on the same weekday. The underlying program's dayNumber
// assignment (1=Push A ... 6=Legs B) never changes — only which weekday
// maps to which dayNumber does, via a per-user offset.

const CYCLE_LENGTH = 6;

/** Weekday: 0=Sun ... 6=Sat, matching JS Date#getDay(). Sunday is always a
 * full rest day regardless of offset. Returns null for Sunday, otherwise
 * the rotated PPL dayNumber (1-6) that applies for this user. */
export function weekdayToDayNumber(weekday: number, offset: number): number | null {
  if (weekday === 0) return null;
  const normalizedOffset = ((offset % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH;
  return (((weekday - 1 + normalizedOffset) % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH + 1;
}

/** Deterministic offset (0-5) derived from the user's id, computed once at
 * onboarding and stored so it stays stable across sessions. */
export function deriveDayOffset(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return hash % CYCLE_LENGTH;
}
