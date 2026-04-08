import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Calendar, Plane, Hotel, Car, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const Particle = ({ delay }: { delay: number }) => {
  const x = Math.random() * 400 - 200;
  const y = -(Math.random() * 300 + 100);
  const colors = ["#0078D4", "#00B4E6", "#00A86B", "#F5A623", "#0078D4"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: color, left: "50%", top: "50%" }}
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{ opacity: 0, x, y, scale: 0 }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
    />
  );
};

const JourneyConfirmed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const card = (location.state as any)?.selectedCard;
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Particle key={i} delay={i * 0.05} />
      ))}

      <motion.div
        className="glass-card p-8 md:p-12 max-w-lg w-full text-center relative z-10 shadow-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Animated check */}
        <motion.div
          className="mx-auto mb-6 w-20 h-20 rounded-full bg-success/15 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          >
            <Check className="w-10 h-10 text-success" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Jornada confirmada! ✈️
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Tudo pronto para sua viagem
        </p>

        {showContent && card && (
          <motion.div
            className="space-y-3 text-left mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <Plane className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {card.flight.airline} {card.flight.code}
                </p>
                <p className="text-xs text-muted-foreground">
                  {card.flight.from} → {card.flight.to} · {card.flight.departure}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <Hotel className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{card.hotel.name}</p>
                <p className="text-xs text-muted-foreground">{card.hotel.distance}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <Car className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{card.transport.type}</p>
                <p className="text-xs text-muted-foreground">~{card.transport.price} {card.transport.description}</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="inline-flex items-center gap-2 bg-success/10 px-4 py-2 rounded-full mb-6">
          <Calendar className="w-4 h-4 text-success" />
          <span className="text-xs text-success font-medium">Lembretes criados na sua agenda Google</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 h-11 gradient-primary text-primary-foreground border-0 hover:opacity-90"
            aria-label="Ver na agenda"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Ver na agenda
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex-1 h-11 border-card-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            aria-label="Voltar ao início"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default JourneyConfirmed;
