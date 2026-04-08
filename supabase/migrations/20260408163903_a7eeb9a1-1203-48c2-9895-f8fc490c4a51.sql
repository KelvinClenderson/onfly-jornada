
-- Force RLS even for table owner
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

-- Explicit deny for INSERT from client
CREATE POLICY "users_insert_blocked" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (false);

-- Explicit deny for DELETE from client
CREATE POLICY "users_delete_blocked" ON public.users
  FOR DELETE TO authenticated
  USING (false);

-- Create safe view excluding sensitive fields
CREATE OR REPLACE VIEW public.users_safe AS
SELECT
  id,
  email,
  nome,
  empresa,
  ativo,
  created_at,
  updated_at
FROM public.users;

-- Make the view respect RLS of the underlying table
ALTER VIEW public.users_safe SET (security_invoker = true);
