-- ============================================================
-- Creacion de la tabla pedidos
-- ============================================================

CREATE TABLE IF NOT EXISTS pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id text UNIQUE NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente',
  importe integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pedidos_user_id_created_at_idx
  ON pedidos (user_id, created_at DESC);

GRANT SELECT ON pedidos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pedidos TO service_role;

-- ============================================================
-- Activar Row Level Security (RLS)
-- ============================================================

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Politica SELECT: cada usuario solo puede ver sus propios pedidos
-- ============================================================

DROP POLICY IF EXISTS "Usuarios pueden ver sus propios pedidos" ON pedidos;

CREATE POLICY "Usuarios pueden ver sus propios pedidos"
  ON pedidos
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
