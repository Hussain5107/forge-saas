// Pure, testable logic for workout logging: 1RM estimation and streak math.
// Kept separate from Supabase calls so it can be unit tested in isolation.

/** Epley formula — same one used for the 1RM calculator in the original app. */
export function estimated1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null; // ISO yyyy-mm-dd
  totalWorkouts: number;
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function dayOfWeekUTC(iso: string): number {
  return parseISODate(iso).getUTCDay(); // 0 = Sunday
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = parseISODate(fromIso).getTime();
  const to = parseISODate(toIso).getTime();
  return Math.round((to - from) / 86_400_000);
}

/**
 * Updates streak state when a set is logged on `todayIso`. Idempotent for
 * repeated calls on the same day. Sunday (the program's rest day) doesn't
 * break a streak — training Sat, resting Sun, training Mon still counts as
 * continuous, matching the original app's behavior.
 */
export function updateStreak(prev: StreakState, todayIso: string): StreakState {
  if (prev.lastWorkoutDate === todayIso) {
    return prev; // already logged today, no change
  }

  let continued = false;
  if (prev.lastWorkoutDate) {
    const gap = daysBetween(prev.lastWorkoutDate, todayIso);
    if (gap === 1) continued = true;
    // Allow exactly one skipped day if it was a Sunday (rest day).
    if (gap === 2) {
      const between = new Date(parseISODate(prev.lastWorkoutDate).getTime() + 86_400_000);
      const betweenIso = between.toISOString().slice(0, 10);
      if (dayOfWeekUTC(betweenIso) === 0) continued = true;
    }
  }

  const currentStreak = continued ? prev.currentStreak + 1 : 1;
  return {
    currentStreak,
    longestStreak: Math.max(prev.longestStreak, currentStreak),
    lastWorkoutDate: todayIso,
    totalWorkouts: prev.totalWorkouts + 1,
  };
}
