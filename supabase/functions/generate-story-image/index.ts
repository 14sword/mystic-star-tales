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

    const { storyId, prompt, style = "mythic-editorial" } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return json({ error: "Missing prompt" }, 400);
    }

    const { data: job, error: jobError } = await supabase
      .from("ai_generation_jobs")
      .insert({
        user_id: userData.user.id,
        story_id: storyId ?? null,
        prompt,
        style,
        media_type: "image",
        status: "running",
      })
      .select()
      .single();

    if (jobError) throw jobError;

    const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt,
        size: "1024x1536",
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      await markFailed(supabase, job.id, errorText);
      return json({ error: "Image generation failed", detail: errorText }, 502);
    }

    const imageJson = await imageResponse.json();
    const b64 = imageJson.data?.[0]?.b64_json;
    if (!b64) {
      await markFailed(supabase, job.id, "Missing image payload");
      return json({ error: "Missing image payload" }, 502);
    }

    const bytes = Uint8Array.from(atob(b64), (char) => char.charCodeAt(0));
    const storagePath = `${userData.user.id}/${job.id}.png`;
    const { error: uploadError } = await supabase.storage
      .from("generated-assets")
      .upload(storagePath, bytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    await supabase
      .from("ai_generation_jobs")
      .update({ status: "completed", storage_path: storagePath, updated_at: new Date().toISOString() })
      .eq("id", job.id);

    return json({ jobId: job.id, storagePath }, 200);
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
