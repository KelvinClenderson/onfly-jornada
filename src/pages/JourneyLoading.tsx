import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { searchFlights, searchHotels, type BFFFlightFare, type BFFHotel } from "@/lib/quote-search";

interface SearchState {
  from: string;
  to: string;
  departure: string;
  returnDate?: string;
  tripType: string;
  freeTextPreferences: string;
  eventTitle: string;
  cityUUID?: string | null;
}

const JourneyLoading = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as SearchState | null);
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const didRun = useRef(false);

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    if (!state?.from || !state?.to || !state?.departure) {
      // No params — navigate straight to options with empty results
      addLog("Preparando suas recomendações...");
      setTimeout(() =>
        navigate("/journey/options", { state: { fares: [], hotels: [], ...state } }), 2000);
      return;
    }

    const run = async () => {
      addLog(`Autenticando com a plataforma Onfly...`);
      await delay(600);

      addLog(`Buscando voos ${state.from} → ${state.to} (${state.departure}${state.returnDate ? ` · volta ${state.returnDate}` : ""})...`);

      const [faresResult, hotelsResult] = await Promise.allSettled([
        searchFlights({
          from: state.from,
          to: state.to,
          departure: state.departure,
          returnDate: state.returnDate,
        }),
        state.cityUUID
          ? searchHotels({
              checkIn: state.departure,
              checkOut: state.returnDate ?? state.departure,
              destination: { type: "cityId", value: state.cityUUID },
            })
          : Promise.resolve([] as BFFHotel[]),
      ]);

      const fares: BFFFlightFare[] =
        faresResult.status === "fulfilled" ? faresResult.value : [];
      const hotels: BFFHotel[] =
        hotelsResult.status === "fulfilled" ? hotelsResult.value : [];

      if (faresResult.status === "fulfilled") {
        addLog(`✓ ${fares.length} opção${fares.length !== 1 ? "ões" : ""} de voo encontrada${fares.length !== 1 ? "s" : ""}`);
      } else {
        addLog(`⚠ Erro ao buscar voos: ${(faresResult.reason as Error).message}`);
      }

      if (state.cityUUID) {
        if (hotelsResult.status === "fulfilled") {
          addLog(`✓ ${hotels.length} hotel${hotels.length !== 1 ? "is" : ""} encontrado${hotels.length !== 1 ? "s" : ""}`);
        } else {
          addLog(`⚠ Erro ao buscar hotéis: ${(hotelsResult.reason as Error).message}`);
        }
      }

      if (state.freeTextPreferences) {
        addLog(`Aplicando preferências: "${state.freeTextPreferences}"`);
        await delay(400);
      }

      addLog("Montando suas 3 recomendações personalizadas...");
      await delay(600);
      setDone(true);

      setTimeout(() =>
        navigate("/journey/options", {
          state: { fares, hotels, ...state },
        }), 500);
    };

    run().catch((err) => {
      addLog(`Erro inesperado: ${err.message}`);
      setTimeout(() =>
        navigate("/journey/options", { state: { fares: [], hotels: [], ...state } }), 2000);
    });
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  const totalExpected = 5;
  const progress = Math.min(100, (logs.length / totalExpected) * 100);

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <motion.div
        className="h-1 gradient-primary"
        animate={{ width: `${done ? 100 : progress}%` }}
        transition={{ duration: 0.5 }}
      />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <motion.div
            className="rounded-xl bg-card border border-card-border p-6 font-mono text-sm shadow-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-card-border">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
              <span className="ml-2 text-xs text-muted-foreground">onfly-agent</span>
            </div>

            <div className="space-y-2 min-h-[200px]">
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-primary shrink-0">✦</span>
                  <span className={i < logs.length - 1 ? "text-muted-foreground" : "text-primary"}>
                    {log}
                  </span>
                </motion.div>
              ))}
              {!done && (
                <motion.span
                  className="inline-block w-2 h-4 bg-primary"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </div>
          </motion.div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Consultando a plataforma Onfly em tempo real...
          </p>
        </div>
      </div>
    </div>
  );
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default JourneyLoading;
