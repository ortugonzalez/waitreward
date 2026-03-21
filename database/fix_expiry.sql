-- FIX: Actualizar expiración de QR de 24 horas a 60 días
-- Ejecutar en Supabase SQL Editor

ALTER TABLE wr_redemptions
ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '60 days');
