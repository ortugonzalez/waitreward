-- Level change history table
CREATE TABLE IF NOT EXISTS public.wr_level_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_wallet  VARCHAR(42)  NOT NULL,
  from_level      VARCHAR(20)  NOT NULL,
  to_level        VARCHAR(20)  NOT NULL,
  points_at_change INTEGER     NOT NULL,
  created_at      TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wr_level_history_wallet
  ON public.wr_level_history(patient_wallet);

ALTER TABLE public.wr_level_history DISABLE ROW LEVEL SECURITY;
