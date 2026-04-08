import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, ChevronRight, Clock, Loader2, MapPin, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import AppHeader from "@/components/AppHeader";
import { MOCK_USER } from "@/mocks/user";
import type { GoogleCalendarEvent, GoogleCalendarEventsResponse } from "@/types/google-calendar";

const formatDate = (dateTime: string) =>
  new Date(dateTime).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

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
      .then((data) => setEvents(data.items ?? []))
      .catch((err) => {
        console.error("Calendar fetch error:", err);
        setFetchError("Não foi possível carregar os eventos. Tente reconectar.");
      })
      .finally(() => setFetchLoading(false));
  }, [googleCalendarToken]);

  return (
    <div className="relative min-h-screen bg-secondary">
      <AppHeader />

      <div className="max-w-lg mx-auto px-4 py-20 space-y-4">
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

        {/* Calendar events */}
        <motion.div
          className="glass-card p-6"
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
            <div className="space-y-3">
              {events.map((event, i) => (
                <motion.div
                  key={event.id}
                  className="p-4 rounded-xl border border-card-border bg-card hover:border-primary/40 transition-colors"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <p className="font-medium text-foreground text-sm leading-snug mb-2">
                    {event.summary}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      {formatDate(event.start.dateTime)}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{event.location}</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="glass-card p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p className="text-foreground leading-relaxed">
            Pronto para sua próxima viagem? Deixe nosso agente inteligente planejar tudo para você.
          </p>
          <Button
            onClick={() => navigate("/journey/setup")}
            className="w-full h-12 text-base font-medium gradient-primary text-primary-foreground border-0 hover:opacity-90 transition-opacity"
            aria-label="Planejar viagem"
          >
            Planejar viagem
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
