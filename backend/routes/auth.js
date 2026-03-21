const express = require('express')
const router = express.Router()
const { supabase } = require('../lib/supabase')

// POST /api/auth/login
// Body: { dni: "12345678" }
router.post('/login', async (req, res) => {
  try {
    const { dni } = req.body
    if (!dni) return res.status(400).json({
      success: false, message: 'DNI requerido'
    })

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('dni', dni)
      .single()

    if (error || !data) {
      return res.json({
        success: false,
        message: 'Usuario no encontrado. Verificá tu DNI.'
      })
    }

    // Token simple para el demo (base64 del dni+role)
    const token = Buffer.from(JSON.stringify({
      dni: data.dni,
      role: data.role,
      name: data.name
    })).toString('base64')

    return res.json({
      success: true,
      user: {
        name: data.name,
        role: data.role,
        dni: data.dni,
        wallet: data.wallet_address
      },
      token
    })
  } catch (err) {
    return res.status(500).json({
      success: false, message: 'Error interno'
    })
  }
})

// GET /api/auth/me
// Header: Authorization: Bearer <token>
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ success: false })

    const token = auth.replace('Bearer ', '')
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('dni', decoded.dni)
      .single()

    return res.json({ success: true, user: data })
  } catch {
    return res.status(401).json({ success: false, message: 'Token inválido' })
  }
})

module.exports = router
