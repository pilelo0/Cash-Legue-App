/*
# Cash League - Add sala field and massive match support

## Overview
Updates the partidas table to support two-room (sala) architecture and massive multiplayer matches.

## Changes to partidas table
1. Add `sala` column (text, not null, default 'gaming') — 'gaming' or 'destreza'
2. Add `max_jugadores` column (int, default 2) — max players for the match (2 for 1v1, up to 200+ for massive trivia)
3. Add `jugadores_actuales` column (int, default 0) — current number of joined players
4. Add `es_masiva` column (boolean, default false) — whether this is a massive match

## Notes
- Existing rows default to sala='gaming', max_jugadores=2, es_masiva=false
- Massive matches use the same pozo_total logic but with multiple entry fees accumulating
- The oponente_id field remains for 1v1 matches; massive matches track participants via transacciones
*/

ALTER TABLE partidas ADD COLUMN IF NOT EXISTS sala text NOT NULL DEFAULT 'gaming';
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS max_jugadores int NOT NULL DEFAULT 2;
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS jugadores_actuales int NOT NULL DEFAULT 0;
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS es_masiva boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_partidas_sala ON partidas(sala);
CREATE INDEX IF NOT EXISTS idx_partidas_juego ON partidas(juego);
