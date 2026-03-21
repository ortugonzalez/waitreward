-- ============================================================
-- Migración: mover tablas de waitreward → public
-- Ejecutar si NO podés exponer el schema waitreward en API settings
-- ============================================================

-- Copiar usuarios
CREATE TABLE IF NOT EXISTS public.wr_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dni VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'clinic', 'commerce')),
  wallet_address VARCHAR(42),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wr_commerces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.wr_users(id),
  commerce_name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  address VARCHAR(200),
  hours VARCHAR(100),
  wallet_address VARCHAR(42),
  emoji VARCHAR(10),
  active BOOLEAN DEFAULT true,
  monthly_fee_paid_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wr_appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id VARCHAR(50) UNIQUE NOT NULL,
  patient_wallet VARCHAR(42),
  delay_minutes INTEGER NOT NULL,
  points_awarded INTEGER NOT NULL,
  tx_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wr_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_wallet VARCHAR(42),
  commerce_name VARCHAR(100),
  points_redeemed INTEGER NOT NULL,
  discount_value DECIMAL(10,2),
  qr_code VARCHAR(200) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Seed data
INSERT INTO public.wr_users (dni, name, role, wallet_address) VALUES
('12345678', 'María García',        'patient',  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
('87654321', 'Juan Pérez',          'patient',  '0xb586790F5684d6E40a7e4dE353d08053D3eF9b41'),
('11223344', 'Ana Martínez',        'patient',  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'),
('99887766', 'Dr. Carlos López',    'clinic',   '0xb586790F5684d6E40a7e4dE353d08053D3eF9b41'),
('55443322', 'Farmacia Del Pueblo', 'commerce', '0xb586790F5684d6E40a7e4dE353d08053D3eF9b41')
ON CONFLICT (dni) DO NOTHING;

INSERT INTO public.wr_commerces (user_id, commerce_name, category, address, hours, wallet_address, emoji, active)
SELECT id, 'Farmacia Del Pueblo', 'Farmacia',
  'Av. Corrientes 1234, Buenos Aires', 'Lun-Vie 8-20, Sáb 9-18',
  '0xb586790F5684d6E40a7e4dE353d08053D3eF9b41', '💊', true
FROM public.wr_users WHERE dni = '55443322'
ON CONFLICT DO NOTHING;

-- Deshabilitar RLS para demo
ALTER TABLE public.wr_users       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wr_commerces   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wr_appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wr_redemptions DISABLE ROW LEVEL SECURITY;
