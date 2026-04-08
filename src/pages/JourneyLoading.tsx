import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { mockLogs } from "@/lib/mock-data";

const JourneyLoading = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const freeTextPreferences = (location.state as { freeTextPreferences?: string } | null)?.freeTextPreferences || "";
  const [visibleLogs, setVisibleLogs] = useState<number>(0);

  // Build logs dynamically — inject preferences line if provided
  const logs = [...mockLogs];
  if (freeTextPreferences) {
    const insertIndex = 2; // after "Preferência detectada..."
    logs.splice(insertIndex, 0, `Aplicando suas instruções: "${freeTextPreferences}"`);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLogs((prev) => {
        if (prev >= logs.length) {
          clearInterval(interval);
          setTimeout(() => navigate("/journey/options", {
            state: { freeTextPreferences },
          }), 800);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [navigate, logs.length]);

  const progress = (visibleLogs / logs.length) * 100;

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Progress bar */}
      <motion.div
        className="h-1 gradient-primary"
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.4 }}
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
              {logs.slice(0, visibleLogs).map((log, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-primary shrink-0">✦</span>
                  <span className={i < visibleLogs - 1 ? "text-muted-foreground" : "text-primary"}>
                    {log}
                  </span>
                </motion.div>
              ))}
              {visibleLogs < logs.length && (
                <motion.span
                  className="inline-block w-2 h-4 bg-primary"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </div>
          </motion.div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Isso leva cerca de 8 segundos
          </p>
        </div>
      </div>
    </div>
  );
};

export default JourneyLoading;
