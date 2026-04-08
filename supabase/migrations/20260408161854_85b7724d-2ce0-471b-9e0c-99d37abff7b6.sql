
-- Enums
CREATE TYPE public.tipo_viagem AS ENUM ('IDA_SOMENTE', 'IDA_E_VOLTA');
CREATE TYPE public.status_viagem AS ENUM ('PENDENTE', 'CONFIRMADA', 'CANCELADA', 'FALHOU');
CREATE TYPE public.classe_voo AS ENUM ('ECONOMICA', 'EXECUTIVA', 'PRIMEIRA');
CREATE TYPE public.transporte_tipo AS ENUM ('TAXI', 'UBER', 'ALUGUEL');
CREATE TYPE public.opcao_escolhida AS ENUM ('MELHOR_PRECO', 'MAIS_RAPIDO', 'MAIS_CONFORTO', 'CUSTOM');
CREATE TYPE public.tipo_evento AS ENUM ('RELOAD', 'ACEITE_PRIMEIRA_OPCAO', 'ABANDONO', 'PERSONALIZACAO_CUSTOM', 'JORNADA_CONCLUIDA', 'HOOK_ACEITO', 'HOOK_RECUSADO');

-- Users
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  empresa TEXT,
  senha_hash TEXT NOT NULL,
  google_calendar_token TEXT,
  google_refresh_token TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Refresh tokens
CREATE TABLE public.refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  revogado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens(user_id);

-- Viagens
CREATE TABLE public.viagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  origem TEXT NOT NULL,
  destino TEXT NOT NULL,
  tipo public.tipo_viagem NOT NULL,
  data_ida TIMESTAMPTZ NOT NULL,
  data_volta TIMESTAMPTZ,
  status public.status_viagem NOT NULL DEFAULT 'PENDENTE',
  companhia_aerea TEXT,
  numero_voo TEXT,
  classe_voo public.classe_voo,
  valor_voo DECIMAL(10,2),
  hotel_nome TEXT,
  hotel_categoria INT,
  hotel_valor_noite DECIMAL(10,2),
  transporte_tipo public.transporte_tipo,
  transporte_valor DECIMAL(10,2),
  valor_total DECIMAL(10,2),
  opcao_escolhida public.opcao_escolhida,
  motivo_viagem TEXT,
  compromisso_id TEXT,
  reserva_job_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_viagens_user_id ON public.viagens(user_id);
CREATE INDEX idx_viagens_destino ON public.viagens(destino);
CREATE INDEX idx_viagens_status ON public.viagens(status);

-- Preferencias (1:1 com users)
CREATE TABLE public.preferencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  companhias_preferidas TEXT[] DEFAULT '{}',
  classe_habitual public.classe_voo NOT NULL DEFAULT 'ECONOMICA',
  programa_milhas TEXT,
  assento_preferido TEXT,
  hotel_categoria_preferida INT NOT NULL DEFAULT 3,
  hotel_redes_preferidas TEXT[] DEFAULT '{}',
  transporte_preferido public.transporte_tipo NOT NULL DEFAULT 'UBER',
  preferencia_preco BOOLEAN NOT NULL DEFAULT false,
  preferencia_rapidez BOOLEAN NOT NULL DEFAULT false,
  preferencia_conforto BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Metricas eventos
CREATE TABLE public.metricas_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  tipo public.tipo_evento NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_metricas_user_id ON public.metricas_eventos(user_id);
CREATE INDEX idx_metricas_session_id ON public.metricas_eventos(session_id);
CREATE INDEX idx_metricas_tipo ON public.metricas_eventos(tipo);
CREATE INDEX idx_metricas_created_at ON public.metricas_eventos(created_at);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_viagens_updated_at BEFORE UPDATE ON public.viagens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_preferencias_updated_at BEFORE UPDATE ON public.preferencias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS (habilitado, políticas permissivas para hackathon — em produção usar auth.uid())
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas_eventos ENABLE ROW LEVEL SECURITY;

-- Hackathon: acesso público via anon key (produção: restringir por auth.uid())
CREATE POLICY "allow_all_users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_refresh_tokens" ON public.refresh_tokens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_viagens" ON public.viagens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_preferencias" ON public.preferencias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_metricas_eventos" ON public.metricas_eventos FOR ALL USING (true) WITH CHECK (true);
