const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_TRAVELER = {
  birthday: "2000-06-01",
  travelerEntityId: "8360e4d5-71dd-4ca4-9aa6-3ff7f6c7709e",
};

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getToguroToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const clientId = Deno.env.get("ONFLY_CLIENT_ID")!;
  const clientSecret = Deno.env.get("ONFLY_CLIENT_SECRET")!;

  // Step 1: OAuth token from Onfly
  const oauthRes = await fetch("https://api.onfly.com.br/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!oauthRes.ok) {
    const t = await oauthRes.text();
    throw new Error(`OAuth failed ${oauthRes.status}: ${t}`);
  }
  const { access_token } = await oauthRes.json();

  // Step 2: Exchange for Toguro internal token
  const internalRes = await fetch("https://api.onfly.com/auth/token/internal", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!internalRes.ok) {
    const t = await internalRes.text();
    throw new Error(`Internal token failed ${internalRes.status}: ${t}`);
  }
  const internalData = await internalRes.json();
  cachedToken = internalData.token ?? internalData.access_token ?? internalData.data?.token;
  tokenExpiresAt = Date.now() + 10 * 60 * 1000;

  return cachedToken!;
}

async function callBFF(body: object, retries = 1): Promise<unknown> {
  const token = await getToguroToken();

  const res = await fetch("https://toguro-app-prod.onfly.com/bff/quote/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401 && retries > 0) {
    cachedToken = null;
    tokenExpiresAt = 0;
    return callBFF(body, retries - 1);
  }

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`BFF failed ${res.status}: ${t}`);
  }

  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, params } = await req.json();
    let bffBody: object;

    if (type === "flights") {
      const { from, to, departure, returnDate, travelers } = params;
      const flightEntry: Record<string, unknown> = {
        departure,
        from,
        to,
        travelers: travelers ?? [DEFAULT_TRAVELER],
      };
      if (returnDate) flightEntry.return = returnDate;

      bffBody = {
        owners: [null],
        flights: [flightEntry],
        groupFlights: true,
      };
    } else if (type === "hotels") {
      const { checkIn, checkOut, destination, travelers } = params;
      bffBody = {
        owners: [null],
        hotels: [{
          checkIn,
          checkOut,
          destination,
          travelers: travelers ?? [{ ...DEFAULT_TRAVELER, roomIndex: 0 }],
        }],
      };
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid type. Use flights or hotels." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await callBFF(bffBody);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("quote-search error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
