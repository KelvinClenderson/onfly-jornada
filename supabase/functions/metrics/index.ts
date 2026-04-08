import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const TIPOS_VALIDOS = [
  "RELOAD",
  "ACEITE_PRIMEIRA_OPCAO",
  "ABANDONO",
  "PERSONALIZACAO_CUSTOM",
  "JORNADA_CONCLUIDA",
  "HOOK_ACEITO",
  "HOOK_RECUSADO",
] as const;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // Last segment determines sub-route: "event" or "summary"
  const subRoute = pathParts[pathParts.length - 1];

  if (subRoute === "event" && req.method === "POST") {
    return handleEvent(req);
  }

  if (subRoute === "summary" && req.method === "GET") {
    return handleSummary(req, url);
  }

  return new Response(JSON.stringify({ error: "Rota não encontrada" }), {
    status: 404,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

// ─── POST /event ─── optional auth ───
async function handleEvent(req: Request): Promise<Response> {
  try {
    // Optional auth: extract user_id if token present
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");

    if (authHeader) {
      try {
        const supabaseAuth = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await supabaseAuth.auth.getUser();
        if (user) userId = user.id;
      } catch {
        // Token invalid — continue as anonymous
      }
    }

    // Parse and validate body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Dados inválidos", details: { fieldErrors: { body: ["JSON inválido"] } } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { session_id, tipo, metadata } = body as Record<string, unknown>;

    const fieldErrors: Record<string, string[]> = {};

    if (!session_id || typeof session_id !== "string" || !UUID_REGEX.test(session_id)) {
      fieldErrors.session_id = ["session_id é obrigatório e deve ser um UUID válido"];
    }

    if (!tipo || typeof tipo !== "string" || !TIPOS_VALIDOS.includes(tipo as typeof TIPOS_VALIDOS[number])) {
      fieldErrors.tipo = [`Tipo de evento inválido. Valores aceitos: ${TIPOS_VALIDOS.join(", ")}`];
    }

    if (metadata !== undefined && metadata !== null && (typeof metadata !== "object" || Array.isArray(metadata))) {
      fieldErrors.metadata = ["metadata deve ser um objeto JSON"];
    }

    if (Object.keys(fieldErrors).length > 0) {
      return new Response(
        JSON.stringify({ error: "Dados inválidos", details: { fieldErrors } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert using service role (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: evento, error: insertError } = await supabase
      .from("metricas_eventos")
      .insert({
        session_id: session_id as string,
        tipo: tipo as string,
        metadata: (metadata as Record<string, unknown>) ?? {},
        user_id: userId,
      })
      .select("id, tipo, session_id, user_id, created_at")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Erro interno" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(evento), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("metrics-event error:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// ─── GET /summary ─── required auth ───
async function handleSummary(req: Request, url: URL): Promise<Response> {
  try {
    // Required auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Token não fornecido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse date filters
    const de = url.searchParams.get("de");
    const ate = url.searchParams.get("ate");

    if (de && !ISO_DATE_REGEX.test(de)) {
      return new Response(
        JSON.stringify({ error: "Parâmetros inválidos", details: "de deve estar no formato YYYY-MM-DD" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (ate && !ISO_DATE_REGEX.test(ate)) {
      return new Response(
        JSON.stringify({ error: "Parâmetros inválidos", details: "ate deve estar no formato YYYY-MM-DD" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Build query for all events
    let query = supabase.from("metricas_eventos").select("tipo, session_id");

    if (de) query = query.gte("created_at", `${de}T00:00:00.000Z`);
    if (ate) query = query.lte("created_at", `${ate}T23:59:59.999Z`);

    const { data: eventos, error: queryError } = await query;

    if (queryError) {
      console.error("Summary query error:", queryError);
      return new Response(JSON.stringify({ error: "Erro interno" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aggregate counts
    const totais: Record<string, number> = {
      HOOK_ACEITO: 0,
      HOOK_RECUSADO: 0,
      ACEITE_PRIMEIRA_OPCAO: 0,
      RELOAD: 0,
      PERSONALIZACAO_CUSTOM: 0,
      JORNADA_CONCLUIDA: 0,
      ABANDONO: 0,
    };

    const reloadSessions = new Set<string>();

    for (const e of eventos ?? []) {
      if (e.tipo in totais) totais[e.tipo]++;
      if (e.tipo === "RELOAD") reloadSessions.add(e.session_id);
    }

    const totalHooks = totais.HOOK_ACEITO + totais.HOOK_RECUSADO;
    const totalJornadas = totais.ACEITE_PRIMEIRA_OPCAO + totais.RELOAD + totais.ABANDONO;

    const mediaReloads =
      reloadSessions.size > 0
        ? (totais.RELOAD / reloadSessions.size).toFixed(2)
        : "0.00";

    const summary = {
      periodo: {
        de: de ? `${de}T00:00:00.000Z` : null,
        ate: ate ? `${ate}T23:59:59.000Z` : null,
      },
      totais: {
        hook_aceito: totais.HOOK_ACEITO,
        hook_recusado: totais.HOOK_RECUSADO,
        aceite_primeira_opcao: totais.ACEITE_PRIMEIRA_OPCAO,
        reloads: totais.RELOAD,
        personalizacao_custom: totais.PERSONALIZACAO_CUSTOM,
        jornada_concluida: totais.JORNADA_CONCLUIDA,
        abandono: totais.ABANDONO,
      },
      taxas: {
        conversao_hook:
          totalHooks > 0 ? ((totais.HOOK_ACEITO / totalHooks) * 100).toFixed(2) : "0.00",
        aceite_sem_reload:
          totalJornadas > 0
            ? ((totais.ACEITE_PRIMEIRA_OPCAO / totalJornadas) * 100).toFixed(2)
            : "0.00",
        abandono:
          totalJornadas > 0 ? ((totais.ABANDONO / totalJornadas) * 100).toFixed(2) : "0.00",
      },
      media_reloads_por_sessao: mediaReloads,
    };

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("metrics-summary error:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
