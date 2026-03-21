-- Push subscriptions table for Web Push notifications
CREATE TABLE IF NOT EXISTS public.wr_push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet      TEXT NOT NULL,
  endpoint    TEXT NOT NULL UNIQUE,
  subscription JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by wallet
CREATE INDEX IF NOT EXISTS idx_wr_push_subscriptions_wallet ON public.wr_push_subscriptions(wallet);

-- Disable RLS for demo
ALTER TABLE public.wr_push_subscriptions DISABLE ROW LEVEL SECURITY;
