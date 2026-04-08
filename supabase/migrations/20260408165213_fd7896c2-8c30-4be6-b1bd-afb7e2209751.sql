
-- Function to get senha_hash for password verification
CREATE OR REPLACE FUNCTION public.get_user_credentials(p_user_id UUID)
RETURNS TABLE(senha_hash TEXT, google_calendar_token TEXT, google_refresh_token TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT uc.senha_hash, uc.google_calendar_token, uc.google_refresh_token
  FROM private.user_credentials uc
  WHERE uc.user_id = p_user_id;
$$;

-- Revoke from public roles, grant only to service_role
REVOKE ALL ON FUNCTION public.get_user_credentials(UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_credentials(UUID) TO service_role;

-- Function to upsert credentials
CREATE OR REPLACE FUNCTION public.upsert_user_credentials(
  p_user_id UUID,
  p_senha_hash TEXT DEFAULT NULL,
  p_google_calendar_token TEXT DEFAULT NULL,
  p_google_refresh_token TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO private.user_credentials (user_id, senha_hash, google_calendar_token, google_refresh_token, updated_at)
  VALUES (p_user_id, p_senha_hash, p_google_calendar_token, p_google_refresh_token, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    senha_hash = COALESCE(EXCLUDED.senha_hash, private.user_credentials.senha_hash),
    google_calendar_token = COALESCE(EXCLUDED.google_calendar_token, private.user_credentials.google_calendar_token),
    google_refresh_token = COALESCE(EXCLUDED.google_refresh_token, private.user_credentials.google_refresh_token),
    updated_at = NOW();
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_user_credentials(UUID, TEXT, TEXT, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user_credentials(UUID, TEXT, TEXT, TEXT) TO service_role;
