import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, MapPin, Clock, ArrowLeftRight, ArrowRight,
  Loader2, Users, Video, CalendarDays, PlaneTakeoff, PlaneLanding,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import PreferencesStep from "@/components/PreferencesStep";
import { suggestIATA, IATA_CITY_UUID } from "@/lib/quote-search";
import type { GoogleCalendarEvent, GoogleCalendarEventTime, GoogleCalendarEventsResponse } from "@/types/google-calendar";

// ── helpers ──────────────────────────────────────────────────────────────────

const fmtStart = (start: GoogleCalendarEventTime): { label: string; isAllDay: boolean } => {
  if (start.date) {
    const [y, m, d] = start.date.split("-").map(Number);
    return {
      label: new Date(y, m - 1, d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      isAllDay: true,
    };
  }
  if (start.dateTime) {
    return {
      label: new Date(start.dateTime).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
      }),
      isAllDay: false,
    };
  }
  return { label: "—", isAllDay: false };
};

const extractDate = (et: GoogleCalendarEventTime): string => {
  if (et.date) return et.date;
  if (et.dateTime) return et.dateTime.split("T")[0];
  return "";
};

const daysUntil = (start: GoogleCalendarEventTime): number => {
  const d = start.dateTime
    ? new Date(start.dateTime)
    : start.date
    ? (() => { const [y, m, day] = start.date!.split("-").map(Number); return new Date(y, m - 1, day); })()
    : new Date();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((d.getTime() - today.getTime()) / 86_400_000));
};

const eventIcon = (e: GoogleCalendarEvent) =>
  e.hangoutLink ? "💻" : (e.attendees?.length ?? 0) > 2 ? "🤝" : e.start.date ? "📅" : "📌";

// ── component ─────────────────────────────────────────────────────────────────

const JourneySetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { googleCalendarToken } = useAuth();

  const preSelected = (location.state as { event?: GoogleCalendarEvent } | null)?.event ?? null;

  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GoogleCalendarEvent | null>(preSelected);
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [preferences, setPreferences] = useState("");

  // Auto-fill destination from event location
  useEffect(() => {
    if (selectedEvent?.location) {
      const suggested = suggestIATA(selectedEvent.location);
      if (suggested) setTo(suggested);
    }
  }, [selectedEvent]);

  // Fetch events if no pre-selection
  useEffect(() => {
    if (preSelected || !googleCalendarToken) return;
    setLoading(true);
    const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
    url.searchParams.set("timeMin", new Date().toISOString());
    url.searchParams.set("maxResults", "10");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("singleEvents", "true");
    fetch(url.toString(), { headers: { Authorization: `Bearer ${googleCalendarToken}` } })
      .then((r) => r.json() as Promise<GoogleCalendarEventsResponse>)
      .then((d) => setEvents((d.items ?? []).filter((e) => e.eventType !== "workingLocation")))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [preSelected, googleCalendarToken]);

  const departure = selectedEvent ? extractDate(selectedEvent.start) : "";
  const returnDate = tripType === "roundtrip" && selectedEvent
    ? extractDate(selectedEvent.end) : undefined;

  const fromValid = /^[A-Z]{3}$/.test(from.toUpperCase());
  const toValid   = /^[A-Z]{3}$/.test(to.toUpperCase());
  const canSubmit = !!selectedEvent && fromValid && toValid;

  const handleSubmit = () => {
    const cityUUID = IATA_CITY_UUID[to.toUpperCase()];
    navigate("/journey/loading", {
      state: {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        departure,
        returnDate,
        tripType,
        freeTextPreferences: preferences.trim(),
        eventTitle: selectedEvent?.summary ?? "",
        cityUUID: cityUUID ?? null,
      },
    });
  };

  const { label: evtDateLabel, isAllDay: evtAllDay } = selectedEvent
    ? fmtStart(selectedEvent.start) : { label: "", isAllDay: false };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="fixed top-0 left-0 right-0 h-1 bg-card-border z-50">
        <div className="h-full gradient-primary w-full" />
      </div>

      <div className="max-w-xl w-full">
        <motion.div
          className="glass-card p-8 shadow-md"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >

          {/* ── Mode A: event pre-selected ── */}
          {preSelected ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Planejar viagem</h2>
              </div>
              <p className="text-muted-foreground mb-5 text-sm">Configure os detalhes do voo</p>

              {/* Event summary */}
              <div className="relative pl-4 pr-4 py-3.5 rounded-xl border border-primary/40 bg-primary/5 mb-5 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-l-xl" />
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-foreground text-sm leading-snug flex-1">
                    {eventIcon(preSelected)} {preSelected.summary}
                  </p>
                  {evtAllDay && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/15 text-primary flex-shrink-0">
                      Dia todo
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />{evtDateLabel}
                  </span>
                  {preSelected.location && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{preSelected.location}</span>
                    </span>
                  )}
                  {(preSelected.attendees?.length ?? 0) > 1 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />{preSelected.attendees!.length} participantes
                    </span>
                  )}
                  {preSelected.hangoutLink && (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <Video className="w-3 h-3" />Google Meet
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* ── Mode B: pick event ── */
            <>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Qual compromisso você quer planejar?
              </h2>
              <p className="text-muted-foreground mb-5 text-sm">Selecione um evento da sua agenda</p>

              {loading && (
                <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Carregando sua agenda...</span>
                </div>
              )}
              {!loading && events.length === 0 && (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Nenhum evento próximo encontrado.
                </p>
              )}
              {!loading && events.length > 0 && (
                <div className="space-y-3 mb-5">
                  {events.map((event, i) => {
                    const { label: dl, isAllDay: ad } = fmtStart(event.start);
                    const days = daysUntil(event.start);
                    const ac = event.attendees?.length ?? 0;
                    const sel = selectedEvent?.id === event.id;
                    return (
                      <motion.button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          sel ? "border-primary glow-primary bg-primary/5"
                             : "border-card-border bg-card hover:border-muted-foreground/30"
                        }`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="text-lg flex-shrink-0 mt-0.5">{eventIcon(event)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm leading-snug truncate">{event.summary}</p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3 flex-shrink-0" />{dl}
                                  {ad && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">Dia todo</span>}
                                </span>
                                {event.location && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate max-w-[140px]">{event.location}</span>
                                  </span>
                                )}
                              </div>
                              {(event.hangoutLink || ac > 1) && (
                                <div className="flex items-center gap-3 mt-1.5">
                                  {event.hangoutLink && <span className="flex items-center gap-1 text-xs text-primary"><Video className="w-3 h-3" />Google Meet</span>}
                                  {ac > 1 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" />{ac} participantes</span>}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                            {days === 0 ? "hoje" : `em ${days} dia${days !== 1 ? "s" : ""}`}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── Airport inputs ── */}
          <AnimatePresence>
            {selectedEvent && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3 mb-5"
              >
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                    <PlaneTakeoff className="w-3.5 h-3.5" />Origem
                  </label>
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value.toUpperCase().slice(0, 3))}
                    placeholder="GRU"
                    maxLength={3}
                    className={`w-full h-11 px-3 rounded-lg border text-sm font-mono tracking-widest uppercase bg-secondary text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 transition-all ${
                      from.length === 3 && !fromValid
                        ? "border-destructive focus:ring-destructive"
                        : fromValid
                        ? "border-primary/50 focus:ring-primary"
                        : "border-card-border focus:ring-primary"
                    }`}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                    <PlaneLanding className="w-3.5 h-3.5" />Destino
                  </label>
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value.toUpperCase().slice(0, 3))}
                    placeholder="SSA"
                    maxLength={3}
                    className={`w-full h-11 px-3 rounded-lg border text-sm font-mono tracking-widest uppercase bg-secondary text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 transition-all ${
                      to.length === 3 && !toValid
                        ? "border-destructive focus:ring-destructive"
                        : toValid
                        ? "border-primary/50 focus:ring-primary"
                        : "border-card-border focus:ring-primary"
                    }`}
                  />
                </div>
                {departure && (
                  <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      Ida: <strong className="text-foreground">{departure}</strong>
                      {returnDate && (
                        <> · Volta: <strong className="text-foreground">{returnDate}</strong></>
                      )}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Trip type ── */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex bg-secondary rounded-full p-1">
              {(["roundtrip", "oneway"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTripType(t)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    tripType === t ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t === "roundtrip" ? <><ArrowLeftRight className="w-4 h-4" />Ida e volta</> : <><ArrowRight className="w-4 h-4" />Somente ida</>}
                </button>
              ))}
            </div>
          </div>

          {/* ── Preferences ── */}
          <AnimatePresence>
            {selectedEvent && (
              <PreferencesStep value={preferences} onChange={setPreferences} />
            )}
          </AnimatePresence>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-12 text-base gradient-primary text-primary-foreground border-0 hover:opacity-90 disabled:opacity-40 mt-6"
          >
            Buscar opções de viagem
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>

          {selectedEvent && (!fromValid || !toValid) && (from.length > 0 || to.length > 0) && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Informe os códigos IATA de 3 letras (ex: GRU, SSA, BSB)
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default JourneySetup;
