import { supabase } from "@/integrations/supabase/client";

// ── Request params ────────────────────────────────────────────────────────────

export interface FlightSearchParams {
  from: string;        // IATA ex: "CGH"
  to: string;          // IATA ex: "SSA"
  departure: string;   // "YYYY-MM-DD"
  returnDate?: string; // "YYYY-MM-DD" (roundtrip)
  travelers?: Array<{ birthday: string; travelerEntityId: string }>;
}

export interface HotelSearchParams {
  checkIn: string;   // "YYYY-MM-DD"
  checkOut: string;  // "YYYY-MM-DD"
  destination: { type: "cityId"; value: string };
  travelers?: Array<{ birthday: string; roomIndex: number; travelerEntityId: string }>;
}

// ── BFF response types ────────────────────────────────────────────────────────

export interface BFFFlightLeg {
  arrival:   { date: string; iata: string; name?: string };
  departure: { date: string; iata: string; name?: string };
  duration:  string; // "02:35:00"
  flightNumber: string;
  segments: Array<{
    aircraft: string;
    arrival:   { date: string; iata: string };
    departure: { date: string; iata: string };
    duration:  string;
    flightNumber: string;
    stops: number;
  }>;
}

export interface BFFFlightFare {
  id: string;
  family: "LIGHT" | "PLUS" | "TOP" | "PREMIUM";
  fareClass: string;
  businessClass: string; // "Y" = economy, "J" = business
  ciaManaging: { code: string; name: string; imageUrl: string };
  basePrice: { adt: number };
  baseTotalPrice: number; // centavos
  includedServices: Array<{ code: string; description: string; value?: number; valueType?: string }>;
  legs: BFFFlightLeg[];
  penalties: {
    cancel: { allowed: boolean; amount: number };
    change: { allowed: boolean; amount: number };
  };
}

export interface BFFHotel {
  id: string;
  name: string;
  stars: number;
  breakfast: boolean;
  cheapestPrice: number;     // centavos, total
  cheapestDailyPrice: number; // centavos, por noite
  address: { addressLine: string; district?: string; street?: string };
  coordinates: { lat: number; lng: number };
  imageUrl?: string;
  amenities: Array<{ code: string; label: string }>;
  rooms: Array<{
    id: string;
    name: string;
    mealPlan: string;
    refundable: boolean;
    dailyPrice: number;
    totalPrice: number;
  }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export const toCurrency = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtDuration = (d: string) => { // "02:35:00" → "2h35"
  const [h, m] = d.split(":");
  const min = parseInt(m);
  return `${parseInt(h)}h${min > 0 ? min : ""}`;
};

export const fmtTime = (dateStr: string) => // "2026-05-04 11:05:00"
  new Date(dateStr.replace(" ", "T")).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const legDurationMins = (leg: BFFFlightLeg) => {
  const [h, m] = leg.duration.split(":").map(Number);
  return h * 60 + m;
};

export const legStops = (leg: BFFFlightLeg) =>
  Math.max(0, (leg.segments?.length ?? 1) - 1);

// City UUID mapping (extend as more are discovered)
export const IATA_CITY_UUID: Record<string, string> = {
  CNF: "007a5045-ae58-4007-a81f-755976ca42ff", // Belo Horizonte / Confins
  PLU: "007a5045-ae58-4007-a81f-755976ca42ff", // Belo Horizonte / Pampulha
};

// Best-effort IATA suggestion from event location text
export const suggestIATA = (location: string): string => {
  const l = location.toLowerCase();
  if (l.includes("salvador") || l.includes("ssa")) return "SSA";
  if (l.includes("guarulhos") || l.includes("gru")) return "GRU";
  if (l.includes("congonhas") || l.includes("cgh")) return "CGH";
  if (l.includes("galeão") || l.includes("gig")) return "GIG";
  if (l.includes("santos dumont") || l.includes("sdu")) return "SDU";
  if (l.includes("brasília") || l.includes("brasilia") || l.includes("bsb")) return "BSB";
  if (l.includes("confins") || l.includes("cnf")) return "CNF";
  if (l.includes("belo horizonte") || l.includes("pampulha") || l.includes("plu")) return "PLU";
  if (l.includes("porto alegre") || l.includes("poa")) return "POA";
  if (l.includes("curitiba") || l.includes("cwb")) return "CWB";
  if (l.includes("recife") || l.includes("rec")) return "REC";
  if (l.includes("fortaleza") || l.includes("for")) return "FOR";
  if (l.includes("manaus") || l.includes("mao")) return "MAO";
  if (l.includes("florianópolis") || l.includes("fln")) return "FLN";
  if (l.includes("natal") || l.includes("nat")) return "NAT";
  if (l.includes("maceió") || l.includes("mcz")) return "MCZ";
  if (l.includes("lisboa") || l.includes("lisbon") || l.includes("lis")) return "LIS";
  if (l.includes("paris") || l.includes("cdg")) return "CDG";
  if (l.includes("madrid") || l.includes("mad")) return "MAD";
  if (l.includes("miami") || l.includes("mia")) return "MIA";
  if (l.includes("new york") || l.includes("nova york") || l.includes("jfk")) return "JFK";
  if (l.includes("buenos aires") || l.includes("eze")) return "EZE";
  return "";
};

// ── API calls ─────────────────────────────────────────────────────────────────

export async function searchFlights(params: FlightSearchParams): Promise<BFFFlightFare[]> {
  const { data, error } = await supabase.functions.invoke("quote-search", {
    body: { type: "flights", params },
  });
  if (error) throw new Error(error.message || "Erro ao buscar voos");

  const quotes = (data ?? []) as Array<{
    response?: { data?: Array<{ fares?: BFFFlightFare[] }> };
  }>;

  const fares: BFFFlightFare[] = [];
  for (const q of quotes) {
    for (const d of q.response?.data ?? []) {
      fares.push(...(d.fares ?? []));
    }
  }
  return fares;
}

export async function searchHotels(params: HotelSearchParams): Promise<BFFHotel[]> {
  const { data, error } = await supabase.functions.invoke("quote-search", {
    body: { type: "hotels", params },
  });
  if (error) throw new Error(error.message || "Erro ao buscar hotéis");

  const quotes = (data ?? []) as Array<{
    response?: { data?: BFFHotel[] };
  }>;

  const hotels: BFFHotel[] = [];
  for (const q of quotes) {
    hotels.push(...(q.response?.data ?? []));
  }
  return hotels;
}
