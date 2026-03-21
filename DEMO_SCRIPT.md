# WaitReward — Demo Script (3 minutos)

> **Contrato en vivo:** https://testnet.snowtrace.io/address/0xAad6125bE3E57473fb575af47c4B96253c1bEEEa
> **Frontend:** http://localhost:5175

---

## Escena 1 — El problema (30 segundos)

**[Voz]:** "En Argentina, esperar 45 minutos en una consulta médica es lo normal. Nadie te compensa por ese tiempo perdido. WaitReward lo cambia."

**[Pantalla]:**
1. Abrir http://localhost:5175
2. Mostrar la HomeView con el catálogo de premios
3. Señalar: café (30 WP), farmacia (100 WP), sesión de psicología (300 WP)

---

## Escena 2 — El paciente espera y recibe puntos (50 segundos)

**[Voz]:** "Cuando una clínica se retrasa, el sistema registra la demora automáticamente y el paciente recibe WaitPoints en su billetera."

**[Pantalla]:**
1. Click en **"Soy médico → Registrar atención"**
2. Completar el formulario:
   - **Número de turno:** `DEMO-001`
   - **DNI paciente:** `12345678` → esperar que aparezca **✅ María García**
   - **Hora programada:** poner hora actual (ej: 10:00)
   - **Hora real de atención:** poner 45 minutos después (ej: 10:45)
3. Click **"Registrar atención"**
4. Mostrar toast: *"Turno registrado exitosamente"*
5. Mostrar card verde: **"María García recibió 150 WaitPoints"**

> 💡 Tip de grabación: tené los campos pre-completados antes de grabar para ahorrar tiempo.

---

## Escena 3 — El paciente canjea (40 segundos)

**[Voz]:** "María recibe sus puntos al instante en su billetera de Avalanche y puede canjearlos en cualquier comercio de la red."

**[Pantalla]:**
1. Volver al inicio → click **"Soy paciente → Ver mis puntos"**
2. Click **"Ingresar a mi cuenta"** → aceptar MetaMask (red: Fuji)
3. Mostrar saldo: **150 WaitPoints = $1.50 en descuentos**
4. En "Canjeá tus puntos":
   - Cantidad: `100`
   - Comercio: **Farmacia Del Pueblo**
5. Click **"Canjear puntos"** → confirmar en MetaMask
6. Mostrar toast: *"Canjeaste 100 WP exitosamente"*
7. Mostrar saldo actualizado: **50 WaitPoints**

---

## Escena 4 — La predicción de IA (30 segundos)

**[Voz]:** "Pero WaitReward va más allá de compensar. Predice la demora antes de que ocurra, dándole a la clínica información para gestionar mejor sus turnos."

**[Pantalla]:**
1. Volver al inicio → click **"Soy médico → Registrar atención"**
2. En la sección **"Predicción de demora (IA)"**, click en **Cardiología ❤️**
3. Mostrar el resultado: *"Demora estimada: 27 minutos — Confianza: 78%"*
4. Click en **Traumatología 🦴** → mostrar que cambia en tiempo real

---

## Escena 5 — El comercio y el modelo de negocio (30 segundos)

**[Voz]:** "Los comercios pagan una membresía mensual para estar en la red. Cada canje les trae un cliente nuevo. WaitReward cobra un 3% automático por cada transacción — sin intermediarios."

**[Pantalla]:**
1. Volver al inicio → click **"Soy comercio → Ver mi dashboard"**
2. Escribir `Farmacia Del Pueblo` en el campo de búsqueda
3. Mostrar: depósito disponible (0.05 AVAX), suscripción activa hasta abril 2026
4. Señalar los botones de "Depositar fondos" y "Registrar comercio"

---

## Cierre (20 segundos)

**[Voz]:** "Todo esto corre en Avalanche. Cada punto emitido es una transacción real en blockchain. Transparente, automático, sin intermediarios."

**[Pantalla]:**
1. Abrir en el navegador:
   `https://testnet.snowtrace.io/address/0xAad6125bE3E57473fb575af47c4B96253c1bEEEa`
2. Mostrar las transacciones reales del contrato
3. Volver al frontend, mostrar la HomeView

**[Voz]:** *"WaitReward. Tu tiempo vale. Ahora lo demostramos."*

---

## Checklist antes de grabar

- [ ] Backend corriendo en localhost:3001
- [ ] Frontend corriendo en localhost:5175
- [ ] AI module corriendo en localhost:5000 (para predicción)
- [ ] MetaMask configurado en red Fuji (chainId: 43113)
- [ ] Wallet del paciente María García conectada en MetaMask (0x70997970...)
- [ ] Saldo de WaitPoints > 0 en esa wallet (si no: hacer un settle previo fuera de cámara)
- [ ] Pantalla en modo mobile (F12 → toggle device toolbar → iPhone 14 Pro o similar 390px)
- [ ] Zoom del navegador al 100%
- [ ] Micrófono testeado
- [ ] OBS o Loom listo para grabar

---

## Datos de demo rápida referencia

| Campo          | Valor                                                            |
|----------------|------------------------------------------------------------------|
| DNI paciente   | `12345678` → María García                                        |
| Turno ID       | `DEMO-001`, `DEMO-002`, etc. (cada submit necesita ID único)     |
| Red MetaMask   | Avalanche Fuji — chainId 43113                                   |
| Contrato       | `0xAad6125bE3E57473fb575af47c4B96253c1bEEEa`                     |
| Snowtrace      | https://testnet.snowtrace.io/address/0xAad6125bE3E57473fb575af47c4B96253c1bEEEa |
