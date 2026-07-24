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

export async function saveProgressPhoto(photoUrl: string, takenAt: string, note: string) {
  const { supabase, userId } = await requireUser();
  await supabase.from("progress_photos").insert({
    user_id: userId,
    photo_url: photoUrl,
    taken_at: takenAt,
    note: note.trim() || null,
  });
  revalidatePath("/dashboard/progress");
}

export async function deleteProgressPhoto(id: string) {
  const { supabase, userId } = await requireUser();
  await supabase.from("progress_photos").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/dashboard/progress");
}
