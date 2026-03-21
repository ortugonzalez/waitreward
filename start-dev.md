# WaitReward — Instrucciones de desarrollo local

## Requisitos

- Node.js 18+
- Git

---

## Clonar el repo

```bash
git clone https://github.com/ortugonzalez/waitreward.git
cd waitreward
npm install
```

---

## Levantar el sistema (3 terminales)

### Terminal 1 — Blockchain local

```bash
cd waitreward
npx hardhat node
```

> Dejar corriendo. No cerrar. Muestra 20 cuentas de prueba con ETH.

---

### Terminal 2 — Deploy + Backend

**1. Deployar el contrato:**

```bash
cd waitreward
npx hardhat run scripts/deploy.js --network localhost
```

Copiar el `CONTRACT_ADDRESS` que aparece en la salida, por ejemplo:
```
✅ WaitReward deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**2. Crear `backend/.env`** con ese valor:

```
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=<pegar aquí>
CLINIC_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
PATIENT_PRIVATE_KEY=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
PORT=3001
```

**3. Arrancar el backend:**

```bash
cd backend
npm install
npm start
```

> Verificar en: http://localhost:3001/health

---

### Terminal 3 — Frontend

**1. Crear `frontend/.env`:**

```
VITE_API_URL=http://localhost:3001
```

**2. Arrancar:**

```bash
cd frontend
npm install
npm run dev
```

---

## URLs

| Servicio   | URL                              |
|------------|----------------------------------|
| Frontend   | http://localhost:5173            |
| Backend    | http://localhost:3001            |
| Health     | http://localhost:3001/health     |

---

## Para Juliana — Frontend

Tu trabajo está en `frontend/src/`:

```
frontend/src/
  views/       ← PatientView, ClinicView, CommerceView
  components/  ← Navigation, QRModal, PointsBadge
  hooks/       ← useWallet.js
  api/         ← client.js (llamadas al backend)
```

Para subir cambios:

```bash
git add .
git commit -m "descripción del cambio"
git push
```

---

## Para Enzo — Backend

Tu trabajo está en `backend/`:

```
backend/
  routes/   ← settle.js, points.js, redeem.js, commerce.js
  lib/      ← contract.js (conexión al contrato)
  index.js  ← servidor Express, middleware, rutas
```

Mismo proceso:

```bash
git add .
git commit -m "descripción del cambio"
git push
```

---

## Cuentas de prueba (Hardhat)

Estas cuentas tienen 10.000 ETH en la red local.

| Rol       | Address                                      | Private Key |
|-----------|----------------------------------------------|-------------|
| Deployer / Clínica | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| Paciente  | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| Comercio  | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |

> ⚠️ Solo usar en localhost. Nunca en mainnet ni Fuji con fondos reales.
