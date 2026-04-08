import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

let accessToken: string | null = null;
let tokenExpiresAt: number | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (accessToken && tokenExpiresAt && now < tokenExpiresAt) {
    return accessToken;
  }

  const clientId = Deno.env.get('TOGURO_CLIENT_ID');
  const clientSecret = Deno.env.get('TOGURO_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Missing Toguro credentials');
  }

  const tokenResponse = await fetch('https://api.toguro.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'quotes:read'
    })
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to get access token');
  }

  const tokenData = await tokenResponse.json();
  accessToken = tokenData.access_token;
  tokenExpiresAt = now + (tokenData.expires_in * 1000) - 60000;

  return accessToken;
}

async function makeApiCall(endpoint: string, body: unknown, retries = 1): Promise<unknown> {
  const token = await getAccessToken();

  const response = await fetch(`https://api.toguro.com/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });

  if (response.status === 401 && retries > 0) {
    accessToken = null;
    tokenExpiresAt = null;
    return makeApiCall(endpoint, body, retries - 1);
  }

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, params } = await req.json();

    let results;
    if (type === 'flight') {
      results = await makeApiCall('quotes/flights', params);
    } else if (type === 'hotel') {
      results = await makeApiCall('quotes/hotels', params);
    } else {
      throw new Error('Invalid search type');
    }

    return new Response(
      JSON.stringify({ results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});