import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { GeneratedProgram } from "@/lib/exercises/types";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.onboarded) redirect("/onboarding");

  const { data: programRow } = await supabase
    .from("programs")
    .select("program")
    .eq("user_id", user.id)
    .single();

  if (!programRow) redirect("/onboarding");

  const program = programRow.program as GeneratedProgram;

  // Progress for the current week (Sun..Sat), used for done-state + notes.
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  const { data: progressRows } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", user.id)
    .gte("log_date", weekDates[0])
    .lte("log_date", weekDates[6]);

  return (
    <DashboardClient
      email={user.email ?? ""}
      program={program}
      progressRows={progressRows ?? []}
      weekDates={weekDates}
    />
  );
}
