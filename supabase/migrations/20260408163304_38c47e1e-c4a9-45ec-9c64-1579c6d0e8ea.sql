
-- Drop all permissive policies
DROP POLICY IF EXISTS allow_all_users ON public.users;
DROP POLICY IF EXISTS allow_all_viagens ON public.viagens;
DROP POLICY IF EXISTS allow_all_preferencias ON public.preferencias;
DROP POLICY IF EXISTS allow_all_refresh_tokens ON public.refresh_tokens;
DROP POLICY IF EXISTS allow_all_metricas_eventos ON public.metricas_eventos;

-- USERS table: owner-only access, no public insert/delete
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- VIAGENS table: owner-scoped CRUD
CREATE POLICY "viagens_select_own" ON public.viagens
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "viagens_insert_own" ON public.viagens
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "viagens_update_own" ON public.viagens
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "viagens_delete_own" ON public.viagens
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- PREFERENCIAS table: owner-scoped CRUD
CREATE POLICY "preferencias_select_own" ON public.preferencias
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "preferencias_insert_own" ON public.preferencias
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "preferencias_update_own" ON public.preferencias
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "preferencias_delete_own" ON public.preferencias
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- REFRESH_TOKENS table: owner-scoped, no public access
CREATE POLICY "refresh_tokens_select_own" ON public.refresh_tokens
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "refresh_tokens_insert_own" ON public.refresh_tokens
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "refresh_tokens_update_own" ON public.refresh_tokens
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "refresh_tokens_delete_own" ON public.refresh_tokens
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- METRICAS_EVENTOS table: public insert for tracking, owner-scoped read
CREATE POLICY "metricas_insert_public" ON public.metricas_eventos
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "metricas_select_own" ON public.metricas_eventos
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
