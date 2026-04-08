import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, ChevronRight, Clock, Loader2, MapPin, Plane, Users, Video } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AppHeader from "@/components/AppHeader";
import { MOCK_USER } from "@/mocks/user";
import type { GoogleCalendarEvent, GoogleCalendarEventTime, GoogleCalendarEventsResponse } from "@/types/google-calendar";

const formatEventStart = (start: GoogleCalendarEventTime): { label: string; isAllDay: boolean } => {
  if (start.date) {
    const [y, m, d] = start.date.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return {
      label: date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }),
      isAllDay: true,
    };
  }
  if (start.dateTime) {
    return {
      label: new Date(start.dateTime).toLocaleDateString("pt-BR", {
        weekday: "short",
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

const Index = () => {
  const navigate = useNavigate();
  const { googleUser, googleCalendarToken } = useAuth();
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const displayName = googleUser?.name ?? MOCK_USER.name;

  useEffect(() => {
    if (!googleCalendarToken) return;

    setFetchLoading(true);
    setFetchError(null);

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
      .catch((err) => {
        console.error("Calendar fetch error:", err);
        setFetchError("Não foi possível carregar os eventos. Tente reconectar.");
      })
      .finally(() => setFetchLoading(false));
  }, [googleCalendarToken]);

  const handlePlanEvent = (event: GoogleCalendarEvent) => {
    navigate("/journey/setup", { state: { event } });
  };

  return (
    <div className="relative min-h-screen bg-secondary">
      <AppHeader />

      <div className="px-4 py-20 space-y-6">
        <div className="max-w-lg mx-auto space-y-4">
        {/* Welcome */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm text-muted-foreground mb-1">Bem-vindo de volta</p>
          <h1 className="text-2xl font-bold text-foreground">Olá, {displayName}!</h1>
          {googleUser?.email && (
            <p className="text-sm text-muted-foreground mt-0.5">{googleUser.email}</p>
          )}
        </motion.div>

        {/* Trip count metric */}
        <motion.div
          className="glass-card p-6 flex items-center gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <Plane className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground leading-none">{MOCK_USER.tripCount}</p>
            <p className="text-sm text-muted-foreground mt-1">viagens realizadas pela plataforma</p>
          </div>
        </motion.div>
        </div>{/* end max-w-lg */}

        {/* Calendar events — full-width grid */}
        <motion.div
          className="max-w-5xl mx-auto glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Próximos compromissos</h2>
          </div>

          {fetchLoading && (
            <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Carregando sua agenda...</span>
            </div>
          )}

          {fetchError && !fetchLoading && (
            <p className="text-sm text-destructive py-4 text-center">{fetchError}</p>
          )}

          {!fetchLoading && !fetchError && events.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum evento próximo encontrado na sua agenda.
            </p>
          )}

          {!fetchLoading && events.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {events.map((event, i) => {
                const { label: dateLabel, isAllDay } = formatEventStart(event.start);
                const attendeeCount = event.attendees?.length ?? 0;
                return (
                  <motion.div
                    key={event.id}
                    className="group relative pl-4 pr-4 py-3.5 rounded-xl border border-card-border bg-card hover:border-primary/40 hover:bg-card/80 transition-all overflow-hidden"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary/70 rounded-l-xl" />

                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="font-medium text-foreground text-sm leading-snug flex-1">
                        {event.summary}
                      </p>
                      {isAllDay && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/15 text-primary flex-shrink-0">
                          Dia todo
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        {dateLabel}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-card-border">
                      {event.hangoutLink && (
                        <a
                          href={event.hangoutLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Video className="w-3 h-3" />
                          Google Meet
                        </a>
                      )}
                      {attendeeCount > 1 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {attendeeCount} participante{attendeeCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      <button
                        onClick={() => handlePlanEvent(event)}
                        className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        Planejar
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
