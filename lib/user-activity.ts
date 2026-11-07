import "server-only";

import { getSupabaseAdminClient } from "@/lib/lovely-store";

/**
 * Best-effort activity tracking for abandonment cleanup.
 *
 * Failures are swallowed so cleanup bookkeeping can never block the page or
 * image operation the guest actually asked for. Missing tables (migration not
 * applied yet) are ignored for the same reason.
 */
export async function recordUserActivity(
  userIds: Array<string | null | undefined>,
) {
  const uniqueIds = [
    ...new Set(
      userIds.filter(
        (id): id is string => typeof id === "string" && id.length > 0,
      ),
    ),
  ];

  if (uniqueIds.length === 0) return;

  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const now = new Date().toISOString();

  try {
    const { error } = await supabase.from("lovely_user_activity").upsert(
      uniqueIds.map((userId) => ({
        user_id: userId,
        last_activity_at: now,
        updated_at: now,
      })),
      { onConflict: "user_id" },
    );

    if (error) {
      if (error.code === "42P01" || error.code === "42703") return;
      console.error("Failed to record Lovely user activity", error.message);
    }
  } catch (error) {
    console.error(
      "Failed to record Lovely user activity",
      error instanceof Error ? error.message : error,
    );
  }
}
