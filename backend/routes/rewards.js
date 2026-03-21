const express = require('express')
const router = express.Router()
const { supabase } = require('../lib/supabase')

const CATALOG = [
  { id: 1, name: 'Café en local adherido', points: 30, emoji: '☕',
    description: 'En cualquier cafetería de la red', category: 'gastronomia' },
  { id: 2, name: 'Descuento en farmacia', points: 100, emoji: '💊',
    description: 'Productos seleccionados', category: 'farmacia' },
  { id: 3, name: 'Sesión de psicología', points: 300, emoji: '🧠',
    description: 'Primera sesión gratuita', category: 'salud',
    badge: 'MÁS POPULAR' },
  { id: 4, name: 'Consulta interna sin cargo', points: 500, emoji: '🩺',
    description: 'Con médico de planta', category: 'salud' },
  { id: 5, name: 'Análisis de laboratorio', points: 200, emoji: '🔬',
    description: 'Análisis de rutina con descuento', category: 'diagnostico' },
  { id: 6, name: 'Sesión de kinesiología', points: 250, emoji: '💆',
    description: 'Sesión de rehabilitación', category: 'salud' }
]

// GET /api/rewards/catalog
router.get('/catalog', (req, res) => {
  res.json({ success: true, catalog: CATALOG })
})

// GET /api/rewards/commerces
router.get('/commerces', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('commerces')
      .select('commerce_name, category, address, hours, emoji, active')
      .eq('active', true)

    if (error) throw error

    // Agregar rewards disponibles a cada comercio
    const commerces = data.map(c => ({
      ...c,
      availableRewards: CATALOG.filter(r => {
        if (c.category === 'Farmacia') return r.category === 'farmacia'
        if (c.category === 'Gastronomía') return r.category === 'gastronomia'
        return true
      })
    }))

    res.json({ success: true, commerces })
  } catch (err) {
    // Fallback mock si Supabase falla
    res.json({
      success: true,
      commerces: [
        { commerce_name: 'Farmacia Del Pueblo', category: 'Farmacia',
          address: 'Av. Corrientes 1234, Buenos Aires',
          hours: 'Lun-Vie 8-20, Sáb 9-18', emoji: '💊', active: true,
          availableRewards: CATALOG.filter(r => r.category === 'farmacia') }
      ],
      _source: 'mock'
    })
  }
})

// POST /api/rewards/generate-qr
// Body: { patientWallet, commerceName, points }
router.post('/generate-qr', async (req, res) => {
  try {
    const { patientWallet, commerceName, points } = req.body
    if (!patientWallet || !commerceName || !points) {
      return res.status(400).json({ success: false, message: 'Datos incompletos' })
    }

    const qrCode = `WR-${Date.now()}-${patientWallet.slice(2,8)}-${points}`
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const discountValue = (points / 100).toFixed(2)

    await supabase.from('redemptions').insert({
      patient_wallet: patientWallet,
      commerce_name: commerceName,
      points_redeemed: points,
      discount_value: parseFloat(discountValue),
      qr_code: qrCode,
      status: 'pending',
      expires_at: expiresAt.toISOString()
    })

    res.json({
      success: true,
      qrCode,
      expiresAt,
      discountValue: `$${discountValue}`,
      message: `QR generado. Válido por 24 horas.`
    })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error generando QR' })
  }
})

// POST /api/rewards/redeem-qr
// Body: { qrCode }
router.post('/redeem-qr', async (req, res) => {
  try {
    const { qrCode } = req.body
    if (!qrCode) return res.status(400).json({
      success: false, message: 'QR requerido'
    })

    const { data, error } = await supabase
      .from('redemptions')
      .select('*')
      .eq('qr_code', qrCode)
      .single()

    if (error || !data) {
      return res.json({ success: false, message: 'QR no encontrado' })
    }
    if (data.status === 'completed') {
      return res.json({ success: false, message: 'QR ya fue utilizado' })
    }
    if (new Date(data.expires_at) < new Date()) {
      await supabase.from('redemptions')
        .update({ status: 'expired' }).eq('qr_code', qrCode)
      return res.json({ success: false, message: 'QR expirado' })
    }

    // Marcar como completado
    await supabase.from('redemptions')
      .update({ status: 'completed' }).eq('qr_code', qrCode)

    res.json({
      success: true,
      pointsRedeemed: data.points_redeemed,
      discountValue: `$${data.discount_value}`,
      message: `Canje exitoso. Descuento: $${data.discount_value}`
    })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error procesando QR' })
  }
})

module.exports = router
