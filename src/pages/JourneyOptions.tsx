import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Hotel, ChevronDown, RefreshCw, Star,
  Check, Clock, Luggage, Wifi, Coffee, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type BFFFlightFare, type BFFHotel,
  toCurrency, fmtDuration, fmtTime, legDurationMins, legStops,
} from "@/lib/quote-search";

// ── helpers ───────────────────────────────────────────────────────────────────

const isBusiness = (f: BFFFlightFare) => f.businessClass === "J";
const isComfort   = (f: BFFFlightFare) => isBusiness(f) || f.family === "TOP" || f.family === "PREMIUM";

const totalLegMins = (f: BFFFlightFare) =>
  f.legs.reduce((sum, l) => sum + legDurationMins(l), 0);

const totalStops = (f: BFFFlightFare) =>
  f.legs.reduce((sum, l) => sum + legStops(l), 0);

const stopLabel = (n: number) =>
  n === 0 ? "Direto" : `${n} escala${n > 1 ? "s" : ""}`;

const starsArr = (n: number) => Array.from({ length: Math.min(5, n) });

function pickFares(fares: BFFFlightFare[]) {
  if (!fares.length) return { cheapest: null, fastest: null, comfort: null };

  const sorted = [...fares].sort((a, b) => a.baseTotalPrice - b.baseTotalPrice);
  const cheapest = sorted[0];

  const bySpeed = [...fares].sort((a, b) => {
    const stopDiff = totalStops(a) - totalStops(b);
    return stopDiff !== 0 ? stopDiff : totalLegMins(a) - totalLegMins(b);
  });
  const fastest = bySpeed[0];

  const comfortFares = fares.filter(isComfort);
  const comfort = comfortFares.length
    ? comfortFares.sort((a, b) => a.baseTotalPrice - b.baseTotalPrice)[0]
    : sorted[sorted.length - 1]; // fallback: most expensive fare

  return { cheapest, fastest, comfort };
}

function pickHotels(hotels: BFFHotel[]) {
  if (!hotels.length) return { cheapestH: null, midH: null, luxuryH: null };

  const sorted = [...hotels].sort((a, b) => a.cheapestDailyPrice - b.cheapestDailyPrice);
  const cheapestH = sorted[0];

  const byStars = [...hotels].sort((a, b) => b.stars - a.stars || a.cheapestDailyPrice - b.cheapestDailyPrice);
  const luxuryH  = byStars[0];
  const midH     = sorted[Math.floor(sorted.length / 2)] ?? sorted[0];

  return { cheapestH, midH, luxuryH };
}

// ── sub-components ─────────────────────────────────────────────────────────────

function FlightCard({ fare, from, to }: { fare: BFFFlightFare; from: string; to: string }) {
  const leg0 = fare.legs[0];
  const leg1 = fare.legs[1]; // return leg (roundtrip)
  const stops = totalStops(fare);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Plane className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-muted-foreground tracking-wide">VOO</span>
        <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold ${
          isBusiness(fare)
            ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
            : "bg-primary/10 text-primary border border-primary/20"
        }`}>
          {isBusiness(fare) ? "EXECUTIVA" : fare.family}
        </span>
      </div>

      {/* Airline */}
      <div className="flex items-center gap-2 mb-2">
        {fare.ciaManaging.imageUrl && (
          <img
            src={fare.ciaManaging.imageUrl}
            alt={fare.ciaManaging.name}
            className="h-5 w-auto object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <span className="text-sm font-medium text-foreground">{fare.ciaManaging.name}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {leg0 ? `${leg0.departure.iata} → ${leg0.arrival.iata}` : `${from} → ${to}`}
        </span>
      </div>

      {/* Leg 0 */}
      {leg0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2 mb-1">
          <div className="text-center">
            <p className="font-semibold text-foreground text-sm">{fmtTime(leg0.departure.date)}</p>
            <p>{leg0.departure.iata}</p>
          </div>
          <div className="flex-1 mx-2 text-center">
            <p className="text-[10px]">{fmtDuration(leg0.duration)}</p>
            <div className="flex items-center gap-1 justify-center">
              <div className="h-px flex-1 bg-muted-foreground/30" />
              <Plane className="w-2.5 h-2.5 rotate-90" />
              <div className="h-px flex-1 bg-muted-foreground/30" />
            </div>
            <p className="text-[10px] mt-0.5">{stopLabel(legStops(leg0))}</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground text-sm">{fmtTime(leg0.arrival.date)}</p>
            <p>{leg0.arrival.iata}</p>
          </div>
        </div>
      )}

      {/* Leg 1 (return) */}
      {leg1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2">
          <div className="text-center">
            <p className="font-semibold text-foreground text-sm">{fmtTime(leg1.departure.date)}</p>
            <p>{leg1.departure.iata}</p>
          </div>
          <div className="flex-1 mx-2 text-center">
            <p className="text-[10px]">{fmtDuration(leg1.duration)}</p>
            <div className="flex items-center gap-1 justify-center">
              <div className="h-px flex-1 bg-muted-foreground/30" />
              <Plane className="w-2.5 h-2.5 -rotate-90" />
              <div className="h-px flex-1 bg-muted-foreground/30" />
            </div>
            <p className="text-[10px] mt-0.5">{stopLabel(legStops(leg1))}</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground text-sm">{fmtTime(leg1.arrival.date)}</p>
            <p>{leg1.arrival.iata}</p>
          </div>
        </div>
      )}

      {/* Stops summary + services */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
          stops === 0 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
        }`}>
          {stopLabel(stops)}
        </span>
        {fare.includedServices.slice(0, 2).map((s) => (
          <span key={s.code} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Luggage className="w-2.5 h-2.5" />{s.description}
          </span>
        ))}
      </div>
    </div>
  );
}

function HotelCard({ hotel }: { hotel: BFFHotel }) {
  const topAmenities = hotel.amenities.slice(0, 3);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Hotel className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-muted-foreground tracking-wide">HOTEL</span>
      </div>

      <div className="flex gap-3">
        {hotel.imageUrl && (
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm leading-snug">{hotel.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {starsArr(hotel.stars).map((_, i) => (
              <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{hotel.address.addressLine}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {hotel.breakfast && (
              <span className="flex items-center gap-1 text-[10px] text-success font-medium">
                <Coffee className="w-2.5 h-2.5" />Café incluso
              </span>
            )}
            {topAmenities.map((a) => (
              <span key={a.code} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Wifi className="w-2.5 h-2.5" />{a.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-2 bg-secondary rounded-lg px-3 py-2">
        <div>
          <p className="text-xs text-muted-foreground">Por noite</p>
          <p className="font-semibold text-foreground text-sm">{toCurrency(hotel.cheapestDailyPrice)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-semibold text-foreground text-sm">{toCurrency(hotel.cheapestPrice)}</p>
        </div>
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

interface OptionsState {
  fares: BFFFlightFare[];
  hotels: BFFHotel[];
  from: string;
  to: string;
  departure: string;
  returnDate?: string;
  eventTitle?: string;
  freeTextPreferences?: string;
  [key: string]: unknown;
}

const PACKAGES = [
  { id: "cheapest", badge: "MELHOR PREÇO",  badgeColor: "success",  featured: false },
  { id: "fastest",  badge: "MAIS RÁPIDO",   badgeColor: "accent",   featured: false },
  { id: "comfort",  badge: "MAIS CONFORTO", badgeColor: "primary",  featured: true  },
] as const;

const badgeStyles: Record<string, string> = {
  success: "bg-success/10 text-success border-success/20",
  accent:  "bg-primary/10 text-primary border-primary/20",
  primary: "bg-primary text-primary-foreground border-primary",
};

const reasoning: Record<string, string> = {
  cheapest: "Melhor custo-benefício disponível. Tarifa com a menor tarifa total considerando taxas.",
  fastest:  "Menor tempo total de voo com menos escalas — ideal para maximizar seu tempo no destino.",
  comfort:  "Classe executiva ou tarifa premium para uma experiência mais confortável durante o voo.",
};

const JourneyOptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as OptionsState | null) ?? { fares: [], hotels: [], from: "", to: "" };

  const { fares, hotels, from, to, departure, returnDate, eventTitle, freeTextPreferences } = state;

  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showNoResults, setShowNoResults] = useState(!fares.length);

  const { cheapest, fastest, comfort } = pickFares(fares);
  const { cheapestH, midH, luxuryH } = pickHotels(hotels);

  const fareFor    = { cheapest, fastest, comfort };
  const hotelFor   = { cheapest: cheapestH, fastest: midH, comfort: luxuryH };

  const totalFor = (id: string) => {
    const f = fareFor[id as keyof typeof fareFor];
    const h = hotelFor[id as keyof typeof hotelFor];
    if (!f) return null;
    return toCurrency(f.baseTotalPrice + (h?.cheapestPrice ?? 0));
  };

  const handleConfirm = (id: string) => {
    navigate("/journey/confirmed", {
      state: {
        selectedCard: {
          badge: PACKAGES.find((p) => p.id === id)?.badge,
          fare: fareFor[id as keyof typeof fareFor],
          hotel: hotelFor[id as keyof typeof hotelFor],
          from, to, departure, returnDate,
          eventTitle,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Suas recomendações personalizadas
          </h1>
          <p className="text-muted-foreground text-sm">
            {from && to ? `${from} → ${to}` : ""}
            {departure ? ` · ${departure}` : ""}
            {returnDate ? ` → ${returnDate}` : ""}
            {eventTitle ? ` · ${eventTitle}` : ""}
          </p>
        </motion.div>

        {/* No results banner */}
        <AnimatePresence>
          {showNoResults && (
            <motion.div
              className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-muted/30 border border-card-border flex items-start gap-3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium">Nenhum resultado encontrado na API</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Verifique os códigos IATA e tente novamente.
                </p>
              </div>
              <button onClick={() => setShowNoResults(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {PACKAGES.map((pkg, i) => {
            const fare  = fareFor[pkg.id];
            const hotel = hotelFor[pkg.id];
            const total = totalFor(pkg.id);

            return (
              <motion.div
                key={pkg.id}
                className={`glass-card p-6 flex flex-col relative shadow-sm ${
                  pkg.featured ? "border-2 border-primary glow-primary" : ""
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
              >
                {/* Badge */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className={`inline-flex text-[10px] font-bold tracking-wider px-3 py-1 rounded-full border ${badgeStyles[pkg.badgeColor]}`}>
                    {pkg.badge}
                  </span>
                  {freeTextPreferences && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20">
                      <Check className="w-3 h-3" />Sua preferência
                    </span>
                  )}
                </div>

                {/* Flight */}
                {fare ? (
                  <FlightCard fare={fare} from={from} to={to} />
                ) : (
                  <div className="mb-4 p-3 rounded-lg bg-muted/20 text-xs text-muted-foreground flex items-center gap-2">
                    <Plane className="w-4 h-4" />Voo não disponível
                  </div>
                )}

                {/* Hotel */}
                {hotel ? (
                  <HotelCard hotel={hotel} />
                ) : (
                  <div className="mb-4 p-3 rounded-lg bg-muted/20 text-xs text-muted-foreground flex items-center gap-2">
                    <Hotel className="w-4 h-4" />Hotel a confirmar
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-card-border pt-4 mt-auto">
                  <p className="text-xs text-muted-foreground mb-1">Total estimado</p>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {total ?? (fare ? toCurrency(fare.baseTotalPrice) : "—")}
                  </p>
                  {!hotel && fare && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">* apenas voo</p>
                  )}
                </div>

                {/* Accordion */}
                <button
                  onClick={() => setExpandedCard(expandedCard === pkg.id ? null : pkg.id)}
                  className="flex items-center gap-1 text-xs text-primary mt-3 hover:underline font-medium"
                >
                  Por que este plano?
                  <ChevronDown className={`w-3 h-3 transition-transform ${expandedCard === pkg.id ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {expandedCard === pkg.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-3 rounded-lg bg-primary/5 text-xs text-muted-foreground leading-relaxed">
                        {reasoning[pkg.id]}
                        {fare && (
                          <div className="mt-2 pt-2 border-t border-card-border space-y-1">
                            <p><Clock className="w-3 h-3 inline mr-1" />
                              Duração total: {fmtDuration(`${Math.floor(totalLegMins(fare) / 60)}:${String(totalLegMins(fare) % 60).padStart(2, "0")}:00`)}
                            </p>
                            {fare.penalties.cancel.allowed && (
                              <p>✓ Cancelamento permitido ({toCurrency(fare.penalties.cancel.amount)})</p>
                            )}
                            {fare.penalties.change.allowed && (
                              <p>✓ Remarcação permitida ({toCurrency(fare.penalties.change.amount)})</p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA */}
                <Button
                  onClick={() => handleConfirm(pkg.id)}
                  disabled={!fare}
                  className={`w-full h-10 mt-4 text-sm font-medium ${
                    pkg.featured
                      ? "gradient-primary text-primary-foreground border-0 hover:opacity-90"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  Escolher este plano →
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Reload */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 mx-auto"
          >
            <RefreshCw className="w-3 h-3" />
            Não gostei das opções — buscar novamente
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default JourneyOptions;
