import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProgressClient from "@/components/ProgressClient";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: allSets } = await supabase
    .from("workout_sets")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: true });

  const { data: prRows } = await supabase
    .from("personal_records")
    .select("*")
    .eq("user_id", user.id)
    .order("achieved_at", { ascending: false });

  const { data: streakRow } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <ProgressClient
      sets={allSets ?? []}
      personalRecords={prRows ?? []}
      streak={{
        current: streakRow?.current_streak ?? 0,
        longest: streakRow?.longest_streak ?? 0,
        total: streakRow?.total_workouts ?? 0,
      }}
    />
  );
}
