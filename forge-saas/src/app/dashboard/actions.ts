"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { estimated1RM, updateStreak, type StreakState } from "@/lib/tracking";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

export async function toggleExerciseDone(
  logDate: string,
  dayNumber: number,
  exerciseSlug: string,
  done: boolean,
) {
  const { supabase, userId } = await requireUser();

  await supabase.from("progress").upsert(
    {
      user_id: userId,
      log_date: logDate,
      day_number: dayNumber,
      exercise_slug: exerciseSlug,
      done,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,log_date,exercise_slug" },
  );

  revalidatePath("/dashboard");
}

export async function saveExerciseNote(
  logDate: string,
  dayNumber: number,
  exerciseSlug: string,
  note: string,
) {
  const { supabase, userId } = await requireUser();

  await supabase.from("progress").upsert(
    {
      user_id: userId,
      log_date: logDate,
      day_number: dayNumber,
      exercise_slug: exerciseSlug,
      note,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,log_date,exercise_slug" },
  );

  revalidatePath("/dashboard");
}

export interface LogSetResult {
  isNewPR: boolean;
  estimated1RM: number;
  streak: { current: number; longest: number };
}

export async function logSet(
  logDate: string,
  dayNumber: number,
  exerciseSlug: string,
  exerciseName: string,
  setNumber: number,
  weightKg: number,
  reps: number,
  rpe: number | null,
): Promise<LogSetResult> {
  const { supabase, userId } = await requireUser();

  await supabase.from("workout_sets").insert({
    user_id: userId,
    log_date: logDate,
    day_number: dayNumber,
    exercise_slug: exerciseSlug,
    exercise_name: exerciseName,
    set_number: setNumber,
    weight_kg: weightKg,
    reps,
    rpe,
  });

  // PR detection: compare against the best estimated 1RM ever logged for
  // this exercise.
  const oneRM = estimated1RM(weightKg, reps);
  let isNewPR = false;

  if (oneRM > 0) {
    const { data: bestRows } = await supabase
      .from("personal_records")
      .select("estimated_1rm")
      .eq("user_id", userId)
      .eq("exercise_slug", exerciseSlug)
      .order("estimated_1rm", { ascending: false })
      .limit(1);

    const currentBest = bestRows?.[0]?.estimated_1rm ?? 0;
    if (oneRM > currentBest) {
      isNewPR = true;
      await supabase.from("personal_records").insert({
        user_id: userId,
        exercise_slug: exerciseSlug,
        exercise_name: exerciseName,
        weight_kg: weightKg,
        reps,
        estimated_1rm: oneRM,
      });
    }
  }

  // Streak update (idempotent per calendar day).
  const { data: streakRow } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const prevState = {
    currentStreak: streakRow?.current_streak ?? 0,
    longestStreak: streakRow?.longest_streak ?? 0,
    lastWorkoutDate: streakRow?.last_workout_date ?? null,
    totalWorkouts: streakRow?.total_workouts ?? 0,
  };
  const nextState = updateStreak(prevState, logDate);

  await supabase.from("streaks").upsert({
    user_id: userId,
    current_streak: nextState.currentStreak,
    longest_streak: nextState.longestStreak,
    last_workout_date: nextState.lastWorkoutDate,
    total_workouts: nextState.totalWorkouts,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/progress");

  return {
    isNewPR,
    estimated1RM: oneRM,
    streak: { current: nextState.currentStreak, longest: nextState.longestStreak },
  };
}

export async function getStreak(): Promise<StreakState> {
  const { supabase, userId } = await requireUser();
  const { data } = await supabase.from("streaks").select("*").eq("user_id", userId).maybeSingle();
  return {
    currentStreak: data?.current_streak ?? 0,
    longestStreak: data?.longest_streak ?? 0,
    lastWorkoutDate: data?.last_workout_date ?? null,
    totalWorkouts: data?.total_workouts ?? 0,
  };
}

export async function submitReview(rating: number, comment: string): Promise<{ error: string | null }> {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("reviews").insert({
    user_id: userId,
    rating,
    comment: comment.trim() || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { error: null };
}
