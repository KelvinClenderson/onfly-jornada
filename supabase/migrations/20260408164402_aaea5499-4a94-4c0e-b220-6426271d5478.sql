
-- Drop the current unrestricted update policy
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- Create restricted update policy - users cannot modify sensitive fields
CREATE POLICY "users_update_own_safe" ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND senha_hash IS NOT DISTINCT FROM (SELECT senha_hash FROM public.users WHERE id = auth.uid())
    AND google_calendar_token IS NOT DISTINCT FROM (SELECT google_calendar_token FROM public.users WHERE id = auth.uid())
    AND google_refresh_token IS NOT DISTINCT FROM (SELECT google_refresh_token FROM public.users WHERE id = auth.uid())
  );
