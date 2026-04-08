
-- 1. Create private schema
CREATE SCHEMA IF NOT EXISTS private;

-- 2. Create secure credentials table
CREATE TABLE private.user_credentials (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  senha_hash TEXT,
  google_refresh_token TEXT,
  google_calendar_token TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Revoke all public access, grant only to service_role
REVOKE ALL ON private.user_credentials FROM anon, authenticated;
GRANT ALL ON private.user_credentials TO service_role;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

-- 4. Migrate existing data
INSERT INTO private.user_credentials (user_id, senha_hash, google_refresh_token, google_calendar_token)
SELECT id, senha_hash, google_refresh_token, google_calendar_token
FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- 5. Drop the old view that references columns we're about to drop
DROP VIEW IF EXISTS public.users_safe;

-- 6. Drop the UPDATE policy that references the removed columns
DROP POLICY IF EXISTS "users_update_own_safe" ON public.users;

-- 7. Remove sensitive columns from public table
ALTER TABLE public.users
  DROP COLUMN IF EXISTS senha_hash,
  DROP COLUMN IF EXISTS google_refresh_token,
  DROP COLUMN IF EXISTS google_calendar_token;

-- 8. Fix RLS: block anon access
DROP POLICY IF EXISTS "public read" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;

CREATE POLICY "block_anon_users" ON public.users
  FOR ALL TO anon
  USING (false);

-- 9. Recreate simple UPDATE policy (no sensitive columns to protect anymore)
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 10. Recreate users_safe view (now the same as the table, but keeps the contract)
CREATE OR REPLACE VIEW public.users_safe AS
SELECT id, email, nome, empresa, ativo, created_at, updated_at
FROM public.users;

ALTER VIEW public.users_safe SET (security_invoker = true);
