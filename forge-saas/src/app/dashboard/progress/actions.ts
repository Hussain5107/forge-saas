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

export async function saveProgressPhoto(
  photoUrl: string,
  takenAt: string,
  note: string,
): Promise<{ error: string | null }> {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("progress_photos").insert({
    user_id: userId,
    photo_url: photoUrl,
    taken_at: takenAt,
    note: note.trim() || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/progress");
  return { error: null };
}

export async function deleteProgressPhoto(id: string): Promise<{ error: string | null }> {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("progress_photos").delete().eq("id", id).eq("user_id", userId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/progress");
  return { error: null };
}
