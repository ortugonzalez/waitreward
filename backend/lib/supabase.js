const { createClient } = require('@supabase/supabase-js')

// Usamos schema 'public' (expuesto por defecto en Supabase).
// Las tablas de WaitReward llevan prefijo "wr_" para evitar colisiones.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

module.exports = { supabase }
