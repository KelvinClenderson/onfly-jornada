import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, MapPin, Clock, ArrowLeftRight, ArrowRight, Loader2, Users, Video, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import PreferencesStep from "@/components/PreferencesStep";
import type { GoogleCalendarEvent, GoogleCalendarEventTime, GoogleCalendarEventsResponse } from "@/types/google-calendar";

const formatEventStart = (start: GoogleCalendarEventTime): { label: string; isAllDay: boolean } => {
  if (start.date) {
    const [y, m, d] = start.date.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return {
      label: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      isAllDay: true,
    };
  }
  if (start.dateTime) {
    return {
      label: new Date(start.dateTime).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      isAllDay: false,
    };
  }
  return { label: "—", isAllDay: false };
};

const daysUntil = (start: GoogleCalendarEventTime): number => {
  const eventDate = start.dateTime
    ? new Date(start.dateTime)
    : start.date
    ? (() => { const [y, m, d] = start.date!.split("-").map(Number); return new Date(y, m - 1, d); })()
    : new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
};

const eventIcon = (event: GoogleCalendarEvent): string => {
  if (event.hangoutLink) return "💻";
  if ((event.attendees?.length ?? 0) > 2) return "🤝";
  if (event.start.date) return "📅";
  return "📌";
};

const JourneySetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { googleCalendarToken } = useAuth();

  // Event passed from Index (pre-selected)
  const preSelectedEvent = (location.state as { event?: GoogleCalendarEvent } | null)?.event ?? null;

  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GoogleCalendarEvent | null>(preSelectedEvent);
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [preferences, setPreferences] = useState("");

  // Only fetch if no event was pre-selected
  useEffect(() => {
    if (preSelectedEvent || !googleCalendarToken) return;

    setLoading(true);
    const timeMin = new Date().toISOString();
    const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
    url.searchParams.set("timeMin", timeMin);
    url.searchParams.set("maxResults", "10");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("singleEvents", "true");

    fetch(url.toString(), {
      headers: { Authorization: `Bearer ${googleCalendarToken}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Google API error: ${r.status}`);
        return r.json() as Promise<GoogleCalendarEventsResponse>;
      })
      .then((data) =>
        setEvents((data.items ?? []).filter((e) => e.eventType !== "workingLocation"))
      )
      .catch((err) => console.error("Calendar fetch error:", err))
      .finally(() => setLoading(false));
  }, [preSelectedEvent, googleCalendarToken]);

  const handlePlanTrip = () => {
    navigate("/journey/loading", {
      state: { freeTextPreferences: preferences.trim() },
    });
  };

  const { label: selectedDateLabel, isAllDay: selectedIsAllDay } = selectedEvent
    ? formatEventStart(selectedEvent.start)
    : { label: "", isAllDay: false };

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
          {/* ── Mode A: event pre-selected from Index ── */}
          {preSelectedEvent ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Planejar viagem</h2>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">
                Configure as preferências para o compromisso selecionado
              </p>

              {/* Selected event summary */}
              <div className="relative pl-4 pr-4 py-3.5 rounded-xl border border-primary/40 bg-primary/5 mb-6 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-l-xl" />
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-foreground text-sm leading-snug flex-1">
                    {eventIcon(preSelectedEvent)} {preSelectedEvent.summary}
                  </p>
                  {selectedIsAllDay && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/15 text-primary flex-shrink-0">
                      Dia todo
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {selectedDateLabel}
                  </span>
                  {preSelectedEvent.location && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{preSelectedEvent.location}</span>
                    </span>
                  )}
                  {(preSelectedEvent.attendees?.length ?? 0) > 1 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {preSelectedEvent.attendees!.length} participantes
                    </span>
                  )}
                  {preSelectedEvent.hangoutLink && (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <Video className="w-3 h-3" />
                      Google Meet
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* ── Mode B: no pre-selection, show event list ── */
            <>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Qual compromisso você quer planejar?
              </h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Selecione um evento da sua agenda
              </p>

              {loading && (
                <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Carregando sua agenda...</span>
                </div>
              )}

              {!loading && events.length === 0 && (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Nenhum evento próximo encontrado na sua agenda.
                </p>
              )}

              {!loading && events.length > 0 && (
                <div className="space-y-3 mb-6">
                  {events.map((event, i) => {
                    const { label: dateLabel, isAllDay } = formatEventStart(event.start);
                    const days = daysUntil(event.start);
                    const attendeeCount = event.attendees?.length ?? 0;
                    const isSelected = selectedEvent?.id === event.id;

                    return (
                      <motion.button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          isSelected
                            ? "border-primary glow-primary bg-primary/5"
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
                              <p className="font-medium text-foreground text-sm leading-snug truncate">
                                {event.summary}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3 flex-shrink-0" />
                                  {dateLabel}
                                  {isAllDay && (
                                    <span className="ml-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                      Dia todo
                                    </span>
                                  )}
                                </span>
                                {event.location && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate max-w-[140px]">{event.location}</span>
                                  </span>
                                )}
                              </div>
                              {(event.hangoutLink || attendeeCount > 1) && (
                                <div className="flex items-center gap-3 mt-1.5">
                                  {event.hangoutLink && (
                                    <span className="flex items-center gap-1 text-xs text-primary">
                                      <Video className="w-3 h-3" />
                                      Google Meet
                                    </span>
                                  )}
                                  {attendeeCount > 1 && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Users className="w-3 h-3" />
                                      {attendeeCount} participantes
                                    </span>
                                  )}
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

          {/* Trip type toggle */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex bg-secondary rounded-full p-1">
              <button
                onClick={() => setTripType("roundtrip")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  tripType === "roundtrip" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                Ida e volta
              </button>
              <button
                onClick={() => setTripType("oneway")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  tripType === "oneway" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                Somente ida
              </button>
            </div>
          </div>

          <AnimatePresence>
            {selectedEvent && (
              <PreferencesStep value={preferences} onChange={setPreferences} />
            )}
          </AnimatePresence>

          <Button
            onClick={handlePlanTrip}
            disabled={!selectedEvent}
            className="w-full h-12 text-base gradient-primary text-primary-foreground border-0 hover:opacity-90 disabled:opacity-40 mt-6"
            aria-label="Planejar esta viagem"
          >
            Planejar esta viagem
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default JourneySetup;
