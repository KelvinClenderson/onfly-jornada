import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(`Erro na autenticação: ${errorParam}`);
      setTimeout(() => navigate("/login?error=auth_failed"), 3000);
      return;
    }

    if (!code) {
      setError("Código de autorização não recebido");
      setTimeout(() => navigate("/login?error=no_code"), 3000);
      return;
    }

    const expectedState = sessionStorage.getItem("onfly_oauth_state");

    handleOAuthCallback(code, state, expectedState)
      .then((success) => {
        if (success) {
          navigate("/", { replace: true });
        } else {
          setError("Falha na autenticação");
          setTimeout(() => navigate("/login?error=auth_failed"), 3000);
        }
      })
      .catch(() => {
        setError("Erro inesperado");
        setTimeout(() => navigate("/login?error=auth_failed"), 3000);
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <p className="text-sm" style={{ color: "#D94040" }}>{error}</p>
            <p className="text-xs" style={{ color: "#5A7080" }}>Redirecionando para o login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: "#0078D4" }} />
            <p className="text-sm font-medium" style={{ color: "#1A2332" }}>
              Autenticando com a Onfly...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
