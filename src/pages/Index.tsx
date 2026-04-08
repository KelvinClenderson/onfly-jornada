import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plane, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import AppHeader from "@/components/AppHeader";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-secondary">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, hsl(207 100% 42% / 0.6), hsl(193 100% 45% / 0.3), transparent 70%)",
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* User avatar top-right */}
      <AppHeader />

      {/* Main card */}
      <motion.div
        className="glass-card p-8 md:p-12 max-w-lg w-full mx-4 text-center relative z-10 shadow-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Animated plane icon */}
        <motion.div
          className="mx-auto mb-6 w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Plane className="w-8 h-8 text-primary-foreground" />
        </motion.div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Olá, {user.name}! 👋
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Vi que você tem compromissos próximos. Quer que eu monte sua viagem completa?
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate("/journey/setup")}
            className="w-full h-12 text-base font-medium gradient-primary text-primary-foreground border-0 hover:opacity-90 transition-opacity"
            aria-label="Iniciar jornada personalizada"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Sim, montar minha jornada
          </Button>
          <button
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Agora não"
          >
            Agora não, obrigado
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-card-border">
          <span className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
            Baseado nas suas últimas viagens
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
