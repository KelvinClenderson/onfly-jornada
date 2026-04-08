import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const STATUS_VALIDOS = ["PENDENTE", "CONFIRMADA", "CANCELADA", "FALHOU"];
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // --- Auth: validate JWT and get caller identity ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Token não fornecido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Extract userId from URL path ---
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const userId = pathParts[pathParts.length - 1];

    if (!userId || !UUID_REGEX.test(userId)) {
      return new Response(JSON.stringify({ error: "userId inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Authorization: user can only access own data ---
    if (user.id !== userId) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Parse and validate query params ---
    const statusParam = url.searchParams.get("status");
    if (statusParam && !STATUS_VALIDOS.includes(statusParam)) {
      return new Response(
        JSON.stringify({
          error: "Parâmetros inválidos",
          details: `status deve ser um de: ${STATUS_VALIDOS.join(", ")}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const pageRaw = parseInt(url.searchParams.get("page") || "1", 10);
    const limitRaw = parseInt(url.searchParams.get("limit") || "20", 10);

    if (isNaN(pageRaw) || pageRaw < 1) {
      return new Response(
        JSON.stringify({ error: "Parâmetros inválidos", details: "page deve ser inteiro positivo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (isNaN(limitRaw) || limitRaw < 1 || limitRaw > 100) {
      return new Response(
        JSON.stringify({ error: "Parâmetros inválidos", details: "limit deve ser entre 1 e 100" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const page = Math.max(1, pageRaw);
    const limit = Math.min(100, Math.max(1, limitRaw));
    const offset = (page - 1) * limit;

    // --- Query viagens using service role (bypasses RLS) ---
    let query = supabaseAdmin
      .from("viagens")
      .select(
        "id, origem, destino, tipo, data_ida, data_volta, status, companhia_aerea, classe_voo, valor_voo, hotel_nome, hotel_categoria, hotel_valor_noite, transporte_tipo, transporte_valor, valor_total, opcao_escolhida, motivo_viagem, created_at",
        { count: "exact" }
      )
      .eq("user_id", userId)
      .order("data_ida", { ascending: false })
      .range(offset, offset + limit - 1);

    if (statusParam) {
      query = query.eq("status", statusParam);
    }

    const { data: viagens, count: total, error: queryError } = await query;

    if (queryError) {
      console.error("Query error:", queryError);
      return new Response(JSON.stringify({ error: "Erro interno" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const totalCount = total ?? 0;

    return new Response(
      JSON.stringify({
        data: viagens ?? [],
        meta: {
          total: totalCount,
          page,
          limit,
          total_pages: Math.ceil(totalCount / limit),
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
