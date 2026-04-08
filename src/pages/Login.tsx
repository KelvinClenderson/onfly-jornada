import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithOnfly, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  // If already authenticated, redirect
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const emailError = touched.email && !email.trim() ? 'E-mail é obrigatório' : '';
  const passwordError = touched.password && !password.trim() ? 'Senha é obrigatória' : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError('');
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Erro desconhecido');
    }
  };

  const handleOnflyOAuth = async () => {
    try {
      await loginWithOnfly();
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar o login com Onfly OAuth',
        variant: 'destructive',
      });
    }
  };

  const bullets = [
    'Reservas de voo, hotel e transporte em um só lugar',
    'Recomendações inteligentes baseadas no seu histórico',
    'Agenda integrada e alertas de segurança em tempo real',
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left column - Brand panel */}
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

      {/* Right column - Form */}
      <motion.div
        className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1" style={{ color: '#0078D4' }}>onfly</h2>
          </div>

          <h3 className="text-2xl font-semibold mb-1" style={{ color: '#1A2332' }}>
            Entrar na sua conta
          </h3>
          <p className="text-sm mb-6" style={{ color: '#5A7080' }}>
            Use suas credenciais Onfly
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: '#1A2332' }}>
                E-mail corporativo
              </label>
              <input
                type="email"
                placeholder="seu@email.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                className="w-full h-10 px-3 rounded-lg text-sm outline-none transition-all"
                style={{
                  border: `1px solid ${emailError ? '#D94040' : '#E1E8F0'}`,
                  color: '#1A2332',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0078D4';
                  e.target.style.boxShadow = '0 0 0 3px #C7E0F4';
                }}
                onBlurCapture={(e) => {
                  e.target.style.borderColor = emailError ? '#D94040' : '#E1E8F0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {emailError && <p className="text-xs mt-1" style={{ color: '#D94040' }}>{emailError}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: '#1A2332' }}>
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, password: true }))}
                  className="w-full h-10 px-3 pr-10 rounded-lg text-sm outline-none transition-all"
                  style={{
                    border: `1px solid ${passwordError ? '#D94040' : '#E1E8F0'}`,
                    color: '#1A2332',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0078D4';
                    e.target.style.boxShadow = '0 0 0 3px #C7E0F4';
                  }}
                  onBlurCapture={(e) => {
                    e.target.style.borderColor = passwordError ? '#D94040' : '#E1E8F0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#5A7080' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && <p className="text-xs mt-1" style={{ color: '#D94040' }}>{passwordError}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
              style={{ backgroundColor: loading ? '#005A9E' : '#0078D4' }}
              onMouseEnter={(e) => { if (!loading) (e.target as HTMLElement).style.backgroundColor = '#005A9E'; }}
              onMouseLeave={(e) => { if (!loading) (e.target as HTMLElement).style.backgroundColor = '#0078D4'; }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                'Entrar com Onfly'
              )}
            </button>
          </form>

          {/* Error banner */}
          {error && (
            <motion.div
              className="mt-4 p-3 rounded-lg flex items-start gap-2"
              style={{ backgroundColor: '#FFF0F0', borderLeft: '4px solid #D94040' }}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: [0, -4, 4, -2, 2, 0] }}
              transition={{ duration: 0.3 }}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#D94040' }} />
              <span className="text-sm" style={{ color: '#D94040' }}>{error}</span>
            </motion.div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ backgroundColor: '#E1E8F0' }} />
            <span className="text-sm" style={{ color: '#A8BFCC' }}>ou</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#E1E8F0' }} />
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleOnflyOAuth}
            className="w-full h-12 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors hover:bg-gray-50"
            style={{ border: '1px solid #E1E8F0', color: '#1A2332' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#0078D4" fillOpacity="0.1"/>
              <text x="12" y="16" textAnchor="middle" fill="#0078D4" fontSize="10" fontWeight="bold">O</text>
            </svg>
            Entrar com Onfly OAuth
          </button>

          <p className="text-xs text-center mt-6" style={{ color: '#A8BFCC' }}>
            Ao entrar, você concorda com os Termos de Uso da Onfly.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
