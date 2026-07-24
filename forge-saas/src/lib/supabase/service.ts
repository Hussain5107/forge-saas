import { createClient } from "@supabase/supabase-js";

// Server-only: bypasses RLS with the service role key. Never import this
// from a Client Component or expose the key to the browser. Used only by
// trusted server contexts like the cron reminder route.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
