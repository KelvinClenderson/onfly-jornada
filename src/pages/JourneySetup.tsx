import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, MapPin, Clock, ArrowLeftRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockEvents } from "@/lib/mock-data";
import PreferencesStep from "@/components/PreferencesStep";

const eventTypeColors: Record<string, string> = {
  conference: "bg-primary/10 text-primary",
  meeting: "bg-accent/10 text-accent",
  training: "bg-success/10 text-success",
};

const JourneySetup = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [preferences, setPreferences] = useState("");

  const handlePlanTrip = () => {
    navigate("/journey/loading", {
      state: { freeTextPreferences: preferences.trim() },
    });
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-card-border z-50">
        <div className="h-full gradient-primary w-full" />
      </div>

      <div className="max-w-xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key="step-events"
            className="glass-card p-8 shadow-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Qual compromisso você quer planejar?
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Selecione um evento da sua agenda
            </p>

            <div className="space-y-3 mb-6">
              {mockEvents.map((event, i) => (
                <motion.button
                  key={event.id}
                  onClick={() => setSelectedEvent(event.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedEvent === event.id
                      ? "border-primary glow-primary bg-primary/5"
                      : "border-card-border bg-card hover:border-muted-foreground/30"
                  }`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`px-2 py-1 rounded text-xs font-medium mt-0.5 ${eventTypeColors[event.type]}`}>
                        {event.type === "conference" ? "🎤" : event.type === "meeting" ? "🤝" : "📚"}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{event.title}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(event.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap">
                      em {event.daysUntil} dias
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

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

            {/* Preferences — appears after selecting an event */}
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
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JourneySetup;
