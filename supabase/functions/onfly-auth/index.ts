import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const ONFLY_BASE_URL = Deno.env.get("ONFLY_BASE_URL") || "https://api.dev.viagens.dev";
const ONFLY_CLIENT_ID = Deno.env.get("ONFLY_CLIENT_ID")!;
const ONFLY_CLIENT_SECRET = Deno.env.get("ONFLY_CLIENT_SECRET")!;
const ONFLY_REDIRECT_URI = Deno.env.get("ONFLY_REDIRECT_URI") || "https://onfly-jornada-personalizada.lovable.app/auth/callback";
const HEADERS_ONFLY = { "Accept": "application/prs.onfly.v1+json" };

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ─── POST /onfly-auth/authorize ─────────────────────────────────────
// Returns the authorization URL for the frontend to redirect the user
async function handleAuthorize() {
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: ONFLY_CLIENT_ID,
    redirect_uri: ONFLY_REDIRECT_URI,
    response_type: "code",
    scope: "expenses:read travels:read",
    state,
  });

  const authorizeUrl = `${ONFLY_BASE_URL}/oauth/authorize?${params}`;

  return jsonResponse({ authorize_url: authorizeUrl, state });
}

// ─── POST /onfly-auth/callback ──────────────────────────────────────
// Receives the authorization code, exchanges for JWT, fetches user, upserts
async function handleCallback(req: Request) {
  const body = await req.json();
  const { code, state, expected_state } = body;

  if (!code) {
    return jsonResponse({ error: "authorization_code é obrigatório" }, 400);
  }

  // Validate state to prevent CSRF
  if (state && expected_state && state !== expected_state) {
    return jsonResponse({ error: "State inválido — possível ataque CSRF" }, 400);
  }

  // Step 4: Exchange code for JWT
  const tokenRes = await fetch(`${ONFLY_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      client_id: ONFLY_CLIENT_ID,
      client_secret: ONFLY_CLIENT_SECRET,
      redirect_uri: ONFLY_REDIRECT_URI,
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || !tokenData.access_token) {
    console.error("Token exchange failed:", tokenData);
    return jsonResponse(
      { error: "Falha ao obter token da Onfly", details: tokenData },
      tokenRes.status || 500
    );
  }

  const { access_token, expires_in } = tokenData;

  // Step 5: Fetch user data from Onfly
  const userRes = await fetch(`${ONFLY_BASE_URL}/bff/user/logged`, {
    headers: {
      ...HEADERS_ONFLY,
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!userRes.ok) {
    console.error("User fetch failed:", userRes.status);
    return jsonResponse({ error: "Token inválido ou expirado" }, 401);
  }

  const onlyUser = await userRes.json();

  // Upsert user in our database (Onfly is the source of truth)
  const { data: upsertedUser, error: upsertError } = await supabaseAdmin
    .from("users")
    .upsert(
      {
        id: onlyUser.id || onlyUser.uuid,
        nome: onlyUser.name || onlyUser.nome,
        email: onlyUser.email,
        empresa: onlyUser.company?.name || onlyUser.empresa || null,
        ativo: true,
      },
      { onConflict: "email" }
    )
    .select()
    .single();

  if (upsertError) {
    console.error("User upsert failed:", upsertError);
    // Don't fail the login — user can still use the app
  }

  // Return the session data to the frontend
  return jsonResponse({
    user: {
      id: upsertedUser?.id || onlyUser.id || onlyUser.uuid,
      name: onlyUser.name || onlyUser.nome,
      email: onlyUser.email,
      company: onlyUser.company?.name || onlyUser.empresa,
      avatar: onlyUser.avatar || onlyUser.photo_url || null,
      role: onlyUser.role?.name || onlyUser.cargo || null,
    },
    onfly_jwt: access_token,
    expires_in: expires_in || 3600,
  });
}

// ─── POST /onfly-auth/register-client ───────────────────────────────
// One-time: registers the OAuth client with Onfly (requires admin token)
async function handleRegisterClient(_req: Request) {
  const adminToken = Deno.env.get("ONFLY_ADMIN_TOKEN");
  if (!adminToken) {
    return jsonResponse({ error: "ONFLY_ADMIN_TOKEN não configurado" }, 500);
  }

  const res = await fetch(`${ONFLY_BASE_URL}/oauth/clients`, {
    method: "POST",
    headers: {
      ...HEADERS_ONFLY,
      Authorization: adminToken.startsWith("Bearer ") ? adminToken : `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Jornada Personalizada - Hackathon",
      redirect_uri: ONFLY_REDIRECT_URI,
      allowed_scopes: ["expenses:read", "travels:read"],
      description: "Agente de IA para orquestração de viagens corporativas",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return jsonResponse({ error: "Falha ao registrar client", details: data }, res.status);
  }

  return jsonResponse({
    message: "Client registrado com sucesso. Salve client_id e client_secret como secrets.",
    client_id: data.client_id,
    client_secret: data.client_secret,
  }, 201);
}

// ─── POST /onfly-auth/mock-login ────────────────────────────────────
// Hackathon fallback: mock login when Onfly OAuth is not yet configured
async function handleMockLogin(req: Request) {
  const { email, password } = await req.json();

  if (email === "edson.hackathon@onfly.com.br" && password === "onfly@2026") {
    // Check/create mock user in DB
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select()
      .eq("email", email)
      .single();

    let user = existingUser;
    if (!user) {
      const { data: newUser } = await supabaseAdmin
        .from("users")
        .insert({
          nome: "Edson Hackathon",
          email,
          empresa: "Onfly Tecnologia",
          ativo: true,
        })
        .select()
        .single();
      user = newUser;
    }

    return jsonResponse({
      user: {
        id: user?.id || "usr_mock",
        name: "Edson Hackathon",
        email,
        company: "Onfly Tecnologia",
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Edson+Hackathon&backgroundColor=0078D4&textColor=ffffff`,
        role: "Analista de Viagens",
      },
      onfly_jwt: "mock_jwt_hackathon",
      expires_in: 3600,
    });
  }

  return jsonResponse({ error: "Credenciais inválidas na Onfly. Verifique seu acesso." }, 401);
}

// ─── Router ─────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  try {
    switch (path) {
      case "authorize":
        return await handleAuthorize();
      case "callback":
        return await handleCallback(req);
      case "register-client":
        return await handleRegisterClient(req);
      case "mock-login":
        return await handleMockLogin(req);
      default:
        return jsonResponse({ error: "Rota não encontrada" }, 404);
    }
  } catch (err) {
    console.error("onfly-auth error:", err);
    return jsonResponse({ error: "Erro interno no servidor" }, 500);
  }
});
