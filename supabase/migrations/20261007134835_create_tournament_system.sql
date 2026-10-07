/*
# Cash League - Tournament System with Real-time Registration

## Overview
Creates a tournament system that supports featured tournaments displayed in the hero carousel
with real-time registration, capacity tracking, and live status updates via Supabase Realtime.

## New Tables

### torneos (tournaments)
- `id` (uuid, PK)
- `titulo` (text, not null) — tournament display name
- `subtitulo` (text, nullable) — description/subtitle
- `juego` (text, not null) — associated game name
- `sala` (text, not null) — 'gaming' or 'destreza'
- `pozo` (bigint, not null) — prize pool in CLP
- `entrada` (bigint, not null) — entry fee in CLP
- `max_cupos` (int, not null) — maximum player slots
- `inscritos` (int, default 0) — current registered count
- `estado` (text, default 'abierto') — 'abierto', 'por_iniciar', 'en_progreso', 'finalizado'
- `fecha_inicio` (timestamptz, nullable) — scheduled start time
- `imagen` (text, nullable) — banner image URL
- `destacado` (boolean, default true) — whether to show in hero carousel
- `creado_en` (timestamptz, default now())

### torneo_participantes (tournament registrations)
- `id` (uuid, PK)
- `torneo_id` (uuid, FK to torneos, ON DELETE CASCADE)
- `usuario_id` (uuid, FK to usuarios, ON DELETE CASCADE)
- `creado_en` (timestamptz, default now())
- UNIQUE constraint on (torneo_id, usuario_id) to prevent double registration

## Security
- RLS enabled on both tables
- anon + authenticated CRUD (no-auth app, shared/public data)
- All policies allow full access since the app uses anon key

## Notes
1. When a user registers, a row is inserted in torneo_participantes and inscritos is incremented
2. The UNIQUE constraint prevents a user from registering twice for the same tournament
3. When inscritos reaches max_cupos, the tournament estado changes to 'por_iniciar'
4. Realtime subscriptions on both tables ensure all users see live updates
*/

CREATE TABLE IF NOT EXISTS torneos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo text NOT NULL,
    subtitulo text,
    juego text NOT NULL,
    sala text NOT NULL DEFAULT 'gaming',
    pozo bigint NOT NULL,
    entrada bigint NOT NULL,
    max_cupos int NOT NULL,
    inscritos int NOT NULL DEFAULT 0,
    estado text NOT NULL DEFAULT 'abierto',
    fecha_inicio timestamptz,
    imagen text,
    destacado boolean NOT NULL DEFAULT true,
    creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS torneo_participantes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    torneo_id uuid NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
    usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    creado_en timestamptz NOT NULL DEFAULT now(),
    UNIQUE(torneo_id, usuario_id)
);

ALTER TABLE torneos ENABLE ROW LEVEL SECURITY;
ALTER TABLE torneo_participantes ENABLE ROW LEVEL SECURITY;

-- torneos policies (anon + authenticated, single-tenant)
DROP POLICY IF EXISTS "anon_select_torneos" ON torneos;
CREATE POLICY "anon_select_torneos" ON torneos FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_torneos" ON torneos;
CREATE POLICY "anon_insert_torneos" ON torneos FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_torneos" ON torneos;
CREATE POLICY "anon_update_torneos" ON torneos FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_torneos" ON torneos;
CREATE POLICY "anon_delete_torneos" ON torneos FOR DELETE
TO anon, authenticated USING (true);

-- torneo_participantes policies
DROP POLICY IF EXISTS "anon_select_participantes" ON torneo_participantes;
CREATE POLICY "anon_select_participantes" ON torneo_participantes FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_participantes" ON torneo_participantes;
CREATE POLICY "anon_insert_participantes" ON torneo_participantes FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_participantes" ON torneo_participantes;
CREATE POLICY "anon_delete_participantes" ON torneo_participantes FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_torneos_destacado ON torneos(destacado);
CREATE INDEX IF NOT EXISTS idx_participantes_torneo ON torneo_participantes(torneo_id);
CREATE INDEX IF NOT EXISTS idx_participantes_usuario ON torneo_participantes(usuario_id);
