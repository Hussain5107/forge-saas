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

export interface UpdateProfileInput {
  dateOfBirth: string | null;
  country: string | null;
  phoneNumber: string | null;
  hasDiabetes: boolean;
  hasHighBloodPressure: boolean;
  otherHealthNotes: string | null;
  waterReminderEnabled: boolean;
  waterReminderHour: number;
  workoutReminderEnabled: boolean;
  workoutReminderHour: number;
}

export async function updateProfile(input: UpdateProfileInput): Promise<{ error: string | null }> {
  const { supabase, userId } = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update({
      date_of_birth: input.dateOfBirth || null,
      country: input.country || null,
      phone_number: input.phoneNumber || null,
      has_diabetes: input.hasDiabetes,
      has_high_blood_pressure: input.hasHighBloodPressure,
      other_health_notes: input.otherHealthNotes || null,
      water_reminder_enabled: input.waterReminderEnabled,
      water_reminder_hour: input.waterReminderHour,
      workout_reminder_enabled: input.workoutReminderEnabled,
      workout_reminder_hour: input.workoutReminderHour,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateAvatarUrl(url: string): Promise<{ error: string | null }> {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function savePushSubscription(
  endpoint: string,
  p256dh: string,
  authKey: string,
): Promise<{ error: string | null }> {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert({ user_id: userId, endpoint, p256dh, auth_key: authKey }, { onConflict: "endpoint" });
  return { error: error?.message ?? null };
}

export async function logHealthMetric(
  logDate: string,
  systolic: number | null,
  diastolic: number | null,
  pulse: number | null,
  notes: string,
): Promise<{ error: string | null }> {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("health_metrics").insert({
    user_id: userId,
    log_date: logDate,
    systolic,
    diastolic,
    pulse,
    notes: notes.trim() || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { error: null };
}
