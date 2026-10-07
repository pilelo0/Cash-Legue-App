/*
# Cash League - eSports 1v1 Betting Platform Schema

## Overview
Creates the core database tables for Cash League, a platform where users can create and join
1v1 eSports matches with real-money wagers. Supports games like FC 24, Rocket League, LoL, and Fortnite.

## New Tables

### usuarios (users)
- `id` (uuid, PK, defaults to auth.uid()) — links to Supabase auth
- `username` (text, unique, not null) — display name / gamer tag
- `avatar_url` (text, nullable) — profile picture URL
- `balance_clp` (bigint, default 0) — user balance in Chilean Pesos
- `balance_usd` (numeric(12,2), default 0) — user balance in USD
- `wins` (int, default 0) — total match wins
- `losses` (int, default 0) — total match losses
- `created_at` (timestamptz, default now())

### partidas (matches)
- `id` (uuid, PK)
- `creador_id` (uuid, FK to usuarios) — match creator
- `oponente_id` (uuid, FK to usuarios, nullable) — joined opponent (null until someone joins)
- `juego` (text, not null) — game name: 'FC 24', 'Rocket League', 'LoL', 'Fortnite'
- `modalidad` (text, not null) — match mode, e.g. '1v1'
- `monto_apuesta` (bigint, not null) — wager amount in CLP
- `pozo_total` (bigint, not null) — total pot (monto_apuesta * 2)
- `estado` (text, default 'esperando') — 'esperando', 'en_curso', 'finalizada', 'cancelada'
- `ganador_id` (uuid, FK to usuarios, nullable) — winner user id
- `creado_en` (timestamptz, default now())
- `iniciado_en` (timestamptz, nullable) — when match started
- `finalizado_en` (timestamptz, nullable) — when match ended

### transacciones (transactions)
- `id` (uuid, PK)
- `usuario_id` (uuid, FK to usuarios) — transaction owner
- `tipo` (text, not null) — 'deposito', 'retiro', 'apuesta', 'ganancia', 'cancelacion'
- `monto` (bigint, not null) — amount in CLP (positive for deposits/wins, negative for withdrawals/bets)
- `moneda` (text, default 'CLP') — 'CLP' or 'USD'
- `partida_id` (uuid, FK to partidas, nullable) — related match if applicable
- `descripcion` (text, nullable) — human-readable description
- `estado` (text, default 'completada') — 'pendiente', 'completada', 'rechazada'
- `creado_en` (timestamptz, default now())

### reportes_resultados (match result reports)
- `id` (uuid, PK)
- `partida_id` (uuid, FK to partidas) — the match being reported
- `usuario_id` (uuid, FK to usuarios) — user filing the report
- `resultado` (text, not null) — 'ganador' or 'perdedor' as reported by this user
- `captura_url` (text, nullable) — screenshot URL as proof
- `estado` (text, default 'pendiente') — 'pendiente', 'aprobado', 'rechazado', 'resuelto'
- `creado_en` (timestamptz, default now())

### mensajes_chat (chat messages)
- `id` (uuid, PK)
- `partida_id` (uuid, FK to partidas) — match room the message belongs to
- `usuario_id` (uuid, FK to usuarios) — sender
- `contenido` (text, not null) — message text
- `creado_en` (timestamptz, default now())

## Security (RLS)
All tables have RLS enabled. Since this app does NOT have a sign-in screen by default,
policies allow `anon, authenticated` access so the frontend can read and write data.
For a production app with auth, these would be scoped to authenticated users with ownership checks.

## Notes
1. Uses `gen_random_uuid()` for all primary keys.
2. Foreign keys use ON DELETE CASCADE for child tables (chat, reports, transactions)
   and ON DELETE SET NULL for optional opponent/winner references.
3. Balance columns use bigint for CLP (integer pesos) and numeric for USD.
*/
CREATE TABLE IF NOT EXISTS usuarios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text UNIQUE NOT NULL,
    avatar_url text,
    balance_clp bigint NOT NULL DEFAULT 0,
    balance_usd numeric(12,2) NOT NULL DEFAULT 0,
    wins int NOT NULL DEFAULT 0,
    losses int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partidas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creador_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    oponente_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
    juego text NOT NULL,
    modalidad text NOT NULL DEFAULT '1v1',
    monto_apuesta bigint NOT NULL,
    pozo_total bigint NOT NULL,
    estado text NOT NULL DEFAULT 'esperando',
    ganador_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en timestamptz NOT NULL DEFAULT now(),
    iniciado_en timestamptz,
    finalizado_en timestamptz
);

CREATE TABLE IF NOT EXISTS transacciones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo text NOT NULL,
    monto bigint NOT NULL,
    moneda text NOT NULL DEFAULT 'CLP',
    partida_id uuid REFERENCES partidas(id) ON DELETE CASCADE,
    descripcion text,
    estado text NOT NULL DEFAULT 'completada',
    creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reportes_resultados (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    partida_id uuid NOT NULL REFERENCES partidas(id) ON DELETE CASCADE,
    usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    resultado text NOT NULL,
    captura_url text,
    estado text NOT NULL DEFAULT 'pendiente',
    creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mensajes_chat (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    partida_id uuid NOT NULL REFERENCES partidas(id) ON DELETE CASCADE,
    usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    contenido text NOT NULL,
    creado_en timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes_chat ENABLE ROW LEVEL SECURITY;

-- usuarios policies (anon + authenticated, single-tenant demo)
DROP POLICY IF EXISTS "anon_select_usuarios" ON usuarios;
CREATE POLICY "anon_select_usuarios" ON usuarios FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_usuarios" ON usuarios;
CREATE POLICY "anon_insert_usuarios" ON usuarios FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_usuarios" ON usuarios;
CREATE POLICY "anon_update_usuarios" ON usuarios FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_usuarios" ON usuarios;
CREATE POLICY "anon_delete_usuarios" ON usuarios FOR DELETE
TO anon, authenticated USING (true);

-- partidas policies
DROP POLICY IF EXISTS "anon_select_partidas" ON partidas;
CREATE POLICY "anon_select_partidas" ON partidas FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_partidas" ON partidas;
CREATE POLICY "anon_insert_partidas" ON partidas FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_partidas" ON partidas;
CREATE POLICY "anon_update_partidas" ON partidas FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_partidas" ON partidas;
CREATE POLICY "anon_delete_partidas" ON partidas FOR DELETE
TO anon, authenticated USING (true);

-- transacciones policies
DROP POLICY IF EXISTS "anon_select_transacciones" ON transacciones;
CREATE POLICY "anon_select_transacciones" ON transacciones FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_transacciones" ON transacciones;
CREATE POLICY "anon_insert_transacciones" ON transacciones FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_transacciones" ON transacciones;
CREATE POLICY "anon_update_transacciones" ON transacciones FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_transacciones" ON transacciones;
CREATE POLICY "anon_delete_transacciones" ON transacciones FOR DELETE
TO anon, authenticated USING (true);

-- reportes_resultados policies
DROP POLICY IF EXISTS "anon_select_reportes" ON reportes_resultados;
CREATE POLICY "anon_select_reportes" ON reportes_resultados FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reportes" ON reportes_resultados;
CREATE POLICY "anon_insert_reportes" ON reportes_resultados FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reportes" ON reportes_resultados;
CREATE POLICY "anon_update_reportes" ON reportes_resultados FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reportes" ON reportes_resultados;
CREATE POLICY "anon_delete_reportes" ON reportes_resultados FOR DELETE
TO anon, authenticated USING (true);

-- mensajes_chat policies
DROP POLICY IF EXISTS "anon_select_chat" ON mensajes_chat;
CREATE POLICY "anon_select_chat" ON mensajes_chat FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat" ON mensajes_chat;
CREATE POLICY "anon_insert_chat" ON mensajes_chat FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chat" ON mensajes_chat;
CREATE POLICY "anon_update_chat" ON mensajes_chat FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat" ON mensajes_chat;
CREATE POLICY "anon_delete_chat" ON mensajes_chat FOR DELETE
TO anon, authenticated USING (true);

-- Indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_partidas_estado ON partidas(estado);
CREATE INDEX IF NOT EXISTS idx_partidas_creador ON partidas(creador_id);
CREATE INDEX IF NOT EXISTS idx_partidas_oponente ON partidas(oponente_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_usuario ON transacciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reportes_partida ON reportes_resultados(partida_id);
CREATE INDEX IF NOT EXISTS idx_chat_partida ON mensajes_chat(partida_id);
