
-- Remove INSERT and UPDATE policies that allow users to forge tokens
DROP POLICY IF EXISTS "refresh_tokens_insert_own" ON public.refresh_tokens;
DROP POLICY IF EXISTS "refresh_tokens_update_own" ON public.refresh_tokens;
