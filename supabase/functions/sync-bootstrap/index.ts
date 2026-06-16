import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return json({ error: "Unauthorized" }, 401);

    const payload = await req.json();
    const stateRows = Array.isArray(payload.userStoryState) ? payload.userStoryState : [];
    const noteRows = Array.isArray(payload.notes) ? payload.notes : [];
    const achievementRows = Array.isArray(payload.achievements) ? payload.achievements : [];
    const now = new Date().toISOString();

    if (stateRows.length) {
      await supabase.from("user_story_state").upsert(stateRows.map((row) => ({
        user_id: userData.user.id,
        story_id: row.story_id,
        favorite: Boolean(row.favorite),
        bookmarked: Boolean(row.bookmarked),
        read: Boolean(row.read),
        read_progress: Number(row.read_progress ?? 0),
        rating: row.rating ?? null,
        comment: row.comment ?? null,
        updated_at: row.updated_at ?? now,
      })), { onConflict: "user_id,story_id" });
    }

    if (noteRows.length) {
      await supabase.from("notes").upsert(noteRows.map((row) => ({
        user_id: userData.user.id,
        story_id: row.story_id,
        body: row.body ?? "",
        updated_at: row.updated_at ?? now,
      })), { onConflict: "user_id,story_id" });
    }

    if (achievementRows.length) {
      await supabase.from("achievements").upsert(achievementRows.map((row) => ({
        user_id: userData.user.id,
        achievement_id: row.achievement_id,
        unlocked: Boolean(row.unlocked),
        progress: Number(row.progress ?? 0),
        updated_at: row.updated_at ?? now,
      })), { onConflict: "user_id,achievement_id" });
    }

    await supabase.from("sync_events").insert({
      user_id: userData.user.id,
      source: "web-bootstrap",
      payload,
    });

    return json({ ok: true, syncedAt: now });
  } catch (error) {
    return json({ error: String(error?.message ?? error) }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}
