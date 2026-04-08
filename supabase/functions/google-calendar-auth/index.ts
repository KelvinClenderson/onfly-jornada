import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
].join(" ");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization header" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
  const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
  const googleRedirectUri = Deno.env.get("GOOGLE_REDIRECT_URI")!;

  // Verify JWT and extract user
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const { action, code } = body;

  if (action === "start") {
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: googleRedirectUri,
      response_type: "code",
      scope: GOOGLE_SCOPES,
      access_type: "offline",
      prompt: "consent",
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return new Response(JSON.stringify({ auth_url: authUrl }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  if (action === "callback") {
    if (!code) {
      return new Response(JSON.stringify({ error: "Missing code parameter" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: googleRedirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("Google token exchange failed:", errorText);
      return new Response(JSON.stringify({ error: "Failed to exchange code for tokens" }), {
        status: 502,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const tokens = await tokenRes.json();
    const { access_token, refresh_token } = tokens;

    // Persist tokens via RPC
    const { error: rpcError } = await supabase.rpc("upsert_user_credentials", {
      p_user_id: user.id,
      p_google_calendar_token: access_token,
      p_google_refresh_token: refresh_token ?? null,
    });

    if (rpcError) {
      console.error("upsert_user_credentials error:", rpcError);
      return new Response(JSON.stringify({ error: "Failed to save credentials" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Unknown action" }), {
    status: 400,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});
