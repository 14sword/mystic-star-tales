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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const {
      storyId,
      prompt,
      style = "mythic-cinematic-intro",
      durationSeconds = 6,
      size = "720x1280",
    } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return json({ error: "Missing prompt" }, 400);
    }

    const seconds = String(Math.min(8, Math.max(4, Number(durationSeconds) || 6)));
    const { data: job, error: jobError } = await supabase
      .from("ai_generation_jobs")
      .insert({
        user_id: userData.user.id,
        story_id: storyId ?? null,
        prompt,
        style,
        media_type: "video",
        model: "sora-2",
        status: "queued",
      })
      .select()
      .single();

    if (jobError) throw jobError;

    const videoResponse = await fetch("https://api.openai.com/v1/videos", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sora-2",
        prompt,
        size,
        seconds,
      }),
    });

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text();
      await markFailed(supabase, job.id, errorText);
      return json({ error: "Video generation failed", detail: errorText }, 502);
    }

    const video = await videoResponse.json();
    const providerJobId = video.id;
    const status = video.status || "queued";

    await supabase
      .from("ai_generation_jobs")
      .update({
        provider_job_id: providerJobId,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return json({
      jobId: job.id,
      providerJobId,
      status,
      storagePath: null,
      videoUrl: null,
    }, 202);
  } catch (error) {
    return json({ error: String(error?.message ?? error) }, 500);
  }
});

async function markFailed(supabase: ReturnType<typeof createClient>, id: string, error: string) {
  await supabase
    .from("ai_generation_jobs")
    .update({ status: "failed", error, updated_at: new Date().toISOString() })
    .eq("id", id);
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}
