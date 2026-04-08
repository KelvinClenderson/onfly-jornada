import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"] as const;
const missing = required.filter((key) => !import.meta.env[key]);

if (missing.length > 0) {
  document.getElementById("root")!.innerHTML = `
    <div style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc">
      <div style="max-width:480px;padding:2rem;border:1px solid #e2e8f0;border-radius:12px;background:#fff">
        <h2 style="color:#dc2626;margin:0 0 .75rem">Variáveis de ambiente ausentes</h2>
        <p style="color:#475569;margin:0 0 1rem">As seguintes variáveis precisam ser configuradas no painel da Vercel:</p>
        <ul style="color:#0f172a;font-family:monospace;background:#f1f5f9;padding:.75rem 1rem;border-radius:8px;list-style:none;margin:0">
          ${missing.map((k) => `<li>• ${k}</li>`).join("")}
        </ul>
      </div>
    </div>`;
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
