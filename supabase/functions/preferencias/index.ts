import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PREFERENCIAS_DEFAULT = {
  id: null,
  companhias_preferidas: [],
  classe_habitual: "ECONOMICA",
  programa_milhas: null,
  assento_preferido: null,
  hotel_categoria_preferida: 3,
  hotel_redes_preferidas: [],
  transporte_preferido: "UBER",
  preferencia_preco: false,
  preferencia_rapidez: false,
  preferencia_conforto: true,
  updated_at: null,
};

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
    // --- Auth ---
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

    // --- Extract userId ---
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const userId = pathParts[pathParts.length - 1];

    if (!userId || !UUID_REGEX.test(userId)) {
      return new Response(JSON.stringify({ error: "userId inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Authorization ---
    if (user.id !== userId) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Query preferencias ---
    const { data: preferencias, error: queryError } = await supabaseAdmin
      .from("preferencias")
      .select(
        "id, user_id, companhias_preferidas, classe_habitual, programa_milhas, assento_preferido, hotel_categoria_preferida, hotel_redes_preferidas, transporte_preferido, preferencia_preco, preferencia_rapidez, preferencia_conforto, updated_at"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (queryError) {
      console.error("Query error:", queryError);
      return new Response(JSON.stringify({ error: "Erro interno" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const responseData = preferencias ?? {
      ...PREFERENCIAS_DEFAULT,
      user_id: userId,
    };

    return new Response(JSON.stringify({ data: responseData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
