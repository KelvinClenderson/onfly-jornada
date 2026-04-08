import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Hotel, Car, ChevronDown, RefreshCw, AlertTriangle, Star, Send, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockCards, mockAlert } from "@/lib/mock-data";

const badgeStyles: Record<string, string> = {
  success: "bg-success/10 text-success border-success/20",
  accent: "bg-primary/10 text-primary border-primary/20",
  primary: "bg-primary text-primary-foreground border-primary",
};

const JourneyOptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const freeTextPreferences = (location.state as { freeTextPreferences?: string } | null)?.freeTextPreferences || "";
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [customInputs, setCustomInputs] = useState<Record<number, string>>({});
  const [showAlert, setShowAlert] = useState(true);
  const [showAlertDetails, setShowAlertDetails] = useState(false);

  const handleConfirm = (index: number) => {
    navigate("/journey/confirmed", { state: { selectedCard: mockCards[index] } });
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
            GRU → LIS · 14–16 Jun · Web Summit Lisboa 2025
          </p>
        </motion.div>

        {/* Duty of Care Alert */}
        <AnimatePresence>
          {showAlert && (
            <motion.div
              className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-warning/5 border-l-4 border-warning flex items-start gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-foreground">{mockAlert.message}</p>
                <button
                  className="text-xs text-warning mt-1 hover:underline font-medium"
                  onClick={() => setShowAlertDetails(true)}
                >
                  Ver detalhes
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {mockCards.map((card, i) => (
            <motion.div
              key={i}
              className={`glass-card p-6 flex flex-col relative shadow-sm ${
                card.featured ? "border-2 border-primary glow-primary" : ""
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
            >
              {/* Badge */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className={`inline-flex text-[10px] font-bold tracking-wider px-3 py-1 rounded-full border ${badgeStyles[card.badgeColor]}`}>
                  {card.badge}
                </span>
                {freeTextPreferences && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20">
                    <Check className="w-3 h-3" />
                    Sua preferência
                  </span>
                )}
              </div>

              {/* Flight */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Plane className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">VOO</span>
                </div>
                <p className="font-medium text-foreground text-sm">
                  {card.flight.airline} {card.flight.code}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {card.flight.from} → {card.flight.to} · {card.flight.duration} · {card.flight.type}
                </p>
                <p className="text-xs text-muted-foreground">
                  Saída: {card.flight.departure} · Chegada: {card.flight.arrival}
                </p>
              </div>

              {/* Hotel */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Hotel className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">HOTEL</span>
                </div>
                <p className="font-medium text-foreground text-sm">{card.hotel.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex">
                    {Array.from({ length: card.hotel.stars }).map((_, s) => (
                      <Star key={s} className="w-3 h-3 text-warning fill-warning" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{card.hotel.distance}</span>
                </div>
              </div>

              {/* Transport */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Car className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">TRANSPORTE</span>
                </div>
                <p className="font-medium text-foreground text-sm">{card.transport.type}</p>
                <p className="text-xs text-muted-foreground">~{card.transport.price} {card.transport.description}</p>
              </div>

              {/* Divider + Total */}
              <div className="border-t border-card-border pt-4 mt-auto">
                <p className="text-xs text-muted-foreground mb-1">Total estimado</p>
                <p className="text-3xl font-bold font-mono text-foreground">{card.total}</p>
              </div>

              {/* Accordion */}
              <button
                onClick={() => setExpandedCard(expandedCard === i ? null : i)}
                className="flex items-center gap-1 text-xs text-primary mt-3 hover:underline font-medium"
                aria-label="Por que este plano"
              >
                Por que este plano?
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${expandedCard === i ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {expandedCard === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-3 rounded-lg bg-primary/5 text-xs text-muted-foreground leading-relaxed">
                      {card.reasoning}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        value={customInputs[i] || ""}
                        onChange={(e) => setCustomInputs({ ...customInputs, [i]: e.target.value })}
                        placeholder="Ex: prefiro Iberia por milhas TAP..."
                        className="flex-1 text-xs bg-secondary border border-card-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-card-border text-muted-foreground hover:text-foreground"
                        aria-label="Regenerar este card"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <Button
                onClick={() => handleConfirm(i)}
                className={`w-full h-10 mt-4 text-sm font-medium ${
                  card.featured
                    ? "gradient-primary text-primary-foreground border-0 hover:opacity-90"
                    : "bg-primary text-primary-foreground hover:bg-primary-dark"
                }`}
                aria-label={`Escolher plano ${card.badge}`}
              >
                Escolher este plano →
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Reload */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => navigate("/journey/loading")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 mx-auto"
          >
            <RefreshCw className="w-3 h-3" />
            Não gostei das opções — buscar novamente
          </button>
        </motion.div>

        {/* Alert Details Modal */}
        <AnimatePresence>
          {showAlertDetails && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAlertDetails(false)}
            >
              <motion.div
                className="bg-card border border-card-border rounded-2xl shadow-lg max-w-md w-full mx-4 p-6"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    <h3 className="font-semibold text-foreground">Alerta climático</h3>
                  </div>
                  <button onClick={() => setShowAlertDetails(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{mockAlert.details}</p>
                <Button
                  className="w-full mt-5 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setShowAlertDetails(false)}
                >
                  Entendi
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JourneyOptions;
