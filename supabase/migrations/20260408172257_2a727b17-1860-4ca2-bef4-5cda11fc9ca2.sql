
-- Drop the database functions that reference private.user_credentials
DROP FUNCTION IF EXISTS public.get_user_credentials(uuid);
DROP FUNCTION IF EXISTS public.upsert_user_credentials(uuid, text, text, text);

-- Drop the table
DROP TABLE IF EXISTS private.user_credentials;

-- Drop the private schema if empty
DROP SCHEMA IF EXISTS private;
