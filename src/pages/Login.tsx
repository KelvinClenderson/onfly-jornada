import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const bullets = [
  'Reservas de voo, hotel e transporte em um só lugar',
  'Recomendações inteligentes baseadas no seu histórico',
  'Agenda integrada e alertas de segurança em tempo real',
];

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { action: 'start' },
      });
      if (error || !data?.auth_url) throw new Error(error?.message ?? 'Resposta inválida');
      window.location.href = data.auth_url;
    } catch (err) {
      console.error('Google login error:', err);
      toast({
        title: 'Erro ao iniciar login',
        description: 'Não foi possível conectar ao Google. Tente novamente.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left column — brand panel */}
      <motion.div
        className="hidden md:flex w-1/2 flex-col justify-between p-12"
        style={{ backgroundColor: '#0078D4' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div />
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">onfly</h1>
          <p className="text-xl font-light text-white/90">
            Viagem a trabalho não precisa dar trabalho.
          </p>
        </div>
        <div className="space-y-3">
          {bullets.map((text) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white/30 flex-shrink-0" />
              <span className="text-sm text-white/80">{text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right column — welcome */}
      <motion.div
        className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold" style={{ color: '#0078D4' }}>onfly</h2>
          </div>

          <h3 className="text-2xl font-semibold mb-2" style={{ color: '#1A2332' }}>
            Bem-vindo!
          </h3>
          <p className="text-sm mb-8" style={{ color: '#5A7080' }}>
            Conecte sua agenda do Google para que nosso agente inteligente planeje suas viagens corporativas automaticamente.
          </p>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 rounded-lg font-medium text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-60"
            style={{
              backgroundColor: '#0078D4',
              color: '#ffffff',
              border: 'none',
            }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#005A9E'; }}
            onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0078D4'; }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              /* Google "G" logo */
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#ffffff"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#ffffff"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#ffffff"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#ffffff"
                />
              </svg>
            )}
            {loading ? 'Redirecionando...' : 'Entrar com Google'}
          </button>

          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#F0F7FF', border: '1px solid #C7E0F4' }}>
            <div className="flex items-start gap-3">
              <CalendarDays className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#0078D4' }} />
              <p className="text-sm" style={{ color: '#1A2332' }}>
                Usamos sua agenda apenas para identificar seus próximos compromissos e sugerir viagens. Nenhum dado é compartilhado.
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#FFF8EC', border: '1px solid #F5E6C8' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#8A6200' }}>Acesso em fase de testes — e-mails autorizados:</p>
            <ul className="space-y-0.5">
              {[
                'danniel.pereira@onfly.com.br',
                'doondjc@gmail.com',
                'edson.ribeiro@onfly.com.br',
                'elvimar@onfly.com.br',
                'kelvin.araujo@onfly.com.br',
                'kelvinclenderson95@gmail.com',
                'lucas.borges@onfly.com.br',
                'lucas.macena@onfly.com.br',
                'marcelo@onfly.com.br',
                'paulo@onfly.com.br',
              ].map((email) => (
                <li key={email} className="text-xs" style={{ color: '#6B4F00' }}>{email}</li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-center mt-6" style={{ color: '#A8BFCC' }}>
            Ao entrar, você concorda com os Termos de Uso da Onfly.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
