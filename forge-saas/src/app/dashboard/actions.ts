"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
