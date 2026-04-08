import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { saveGoogleSession } = useAuth();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get("code");

    if (!code) {
      toast({
        title: "Erro na autenticação",
        description: "Código de autorização não encontrado.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    supabase.functions
      .invoke("google-calendar-auth", { body: { action: "callback", code } })
      .then(({ data, error }) => {
        if (error || !data?.success || !data?.access_token) {
          toast({
            title: "Erro ao conectar Google Calendar",
            description: "Não foi possível concluir a autenticação. Tente novamente.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        saveGoogleSession(data.access_token, data.refresh_token ?? null, data.user);
        navigate("/");
      });
  }, [navigate, saveGoogleSession, searchParams, toast]);

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <motion.div
        className="glass-card p-10 flex flex-col items-center gap-4 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-foreground font-medium">Conectando com o Google Calendar...</p>
        <p className="text-muted-foreground text-sm">Aguarde um momento</p>
      </motion.div>
    </div>
  );
};

export default GoogleAuthCallback;
