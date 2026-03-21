-- FIX: Agregar columna validate_url a wr_redemptions
-- Ejecutar en Supabase SQL Editor

ALTER TABLE wr_redemptions ADD COLUMN IF NOT EXISTS validate_url TEXT;
