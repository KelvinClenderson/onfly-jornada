
-- Enable extensions for scheduled processing
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Job status enum
CREATE TYPE public.status_job AS ENUM ('waiting', 'active', 'completed', 'failed', 'delayed');

-- Job queue table
CREATE TABLE public.reserva_jobs (
  id TEXT PRIMARY KEY,
  viagem_id UUID NOT NULL REFERENCES public.viagens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  opcao_escolhida TEXT NOT NULL,
  dados_reserva JSONB NOT NULL DEFAULT '{}',
  status public.status_job NOT NULL DEFAULT 'waiting',
  etapa_atual TEXT,
  etapas_concluidas TEXT[] NOT NULL DEFAULT '{}',
  etapas_pendentes TEXT[] NOT NULL DEFAULT ARRAY['voo', 'hotel', 'transporte'],
  tentativas INTEGER NOT NULL DEFAULT 0,
  max_tentativas INTEGER NOT NULL DEFAULT 3,
  falha_motivo TEXT,
  webhook_dados JSONB DEFAULT '{}',
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: block all client access, only service_role
ALTER TABLE public.reserva_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reserva_jobs FORCE ROW LEVEL SECURITY;

CREATE POLICY "block_anon_reserva_jobs" ON public.reserva_jobs
  FOR ALL TO anon USING (false);

CREATE POLICY "block_authenticated_reserva_jobs" ON public.reserva_jobs
  FOR ALL TO authenticated USING (false);

-- Index for efficient job processing queries
CREATE INDEX idx_reserva_jobs_status ON public.reserva_jobs (status) WHERE status IN ('waiting', 'delayed');
CREATE INDEX idx_reserva_jobs_viagem ON public.reserva_jobs (viagem_id);

-- Trigger for updated_at
CREATE TRIGGER update_reserva_jobs_updated_at
  BEFORE UPDATE ON public.reserva_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
