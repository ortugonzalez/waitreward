# WaitReward — Instrucciones de desarrollo local

## Requisitos

- Node.js 18+
- Python 3.8+ (opcional, para módulo de IA)
- Git

---

## Arquitectura

El contrato ya está desplegado en **Avalanche Fuji Testnet**. No hace falta levantar nodo blockchain local.

```
CONTRACT: 0xAad6125bE3E57473fb575af47c4B96253c1bEEEa  (Fuji)
CLINIC:   0xb586790F5684d6E40a7e4dE353d08053D3eF9b41  (deployer/autorizado)
```

---

## Configurar variables de entorno

### `backend/.env`

```
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
CONTRACT_ADDRESS=0xAad6125bE3E57473fb575af47c4B96253c1bEEEa
CLINIC_PRIVATE_KEY=<clave privada de la wallet clínica>
PORT=3001
```

### `frontend/.env`

```
VITE_API_URL=http://localhost:3001
VITE_CONTRACT_ADDRESS=0xAad6125bE3E57473fb575af47c4B96253c1bEEEa
```

---

## Levantar el sistema (2 terminales)

### Terminal 1 — Backend

```bash
cd waitreward/backend
npm install
npm start
```

> Verificar: `GET http://localhost:3001/health`

---

### Terminal 2 — Frontend

```bash
cd waitreward/frontend
npm install
npm run dev
```

> Abrir: http://localhost:5175

---

### Terminal 3 (opcional) — Módulo de IA

```bash
cd waitreward/ai-module
pip install flask numpy
python app.py
```

> Corre en http://localhost:5000. Si no está levantado, el panel de predicción muestra "Módulo de IA no disponible".

---

## URLs

| Servicio   | URL                                        |
|------------|--------------------------------------------|
| Frontend   | http://localhost:5175                      |
| Backend    | http://localhost:3001                      |
| Health     | http://localhost:3001/health               |
| AI module  | http://localhost:5000/health (opcional)    |

---

## Endpoints del backend

| Método | Ruta                              | Descripción                            |
|--------|-----------------------------------|----------------------------------------|
| GET    | /health                           | Estado del servicio                    |
| POST   | /api/settle                       | Registrar atención y otorgar puntos    |
| GET    | /api/points/:wallet               | Saldo de WaitPoints de un paciente     |
| POST   | /api/redeem                       | Canjear puntos (vía backend)           |
| GET    | /api/commerce/:address            | Estado de un comercio                  |
| GET    | /api/commerce/search?name=...     | Buscar comercio por nombre             |
| GET    | /api/patients/:dni                | Resolver DNI → nombre y wallet         |
| GET    | /api/ai/predict/:clinicId/:spec   | Predicción de demora IA                |
| GET    | /api/ai/metrics/:clinicId         | Métricas históricas IA                 |

---

## Pacientes de demo

| DNI      | Nombre         | Wallet                                       |
|----------|----------------|----------------------------------------------|
| 12345678 | María García   | 0x70997970C51812dc3A010C7d01b50e0d17dc79C8   |
| 87654321 | Juan Pérez     | 0xb586790F5684d6E40a7e4dE353d08053D3eF9b41   |
| 11223344 | Ana Martínez   | 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC   |

---

## Comercios de demo (registrados en Fuji)

| Nombre             | Dirección                                    |
|--------------------|----------------------------------------------|
| Farmacia Del Pueblo | 0xb586790F5684d6E40a7e4dE353d08053D3eF9b41  |
| Café Central        | 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC  |

---

## Flujo de demo completo

1. **Paciente llega tarde** a una consulta médica
2. En el panel **Clínica** (tab médico): ingresar DNI del paciente, hora programada y hora real → "Registrar atención"
3. El backend calcula la demora, llama al contrato en Fuji y otorga WaitPoints
4. El paciente ve sus puntos en el panel **Paciente** (requiere MetaMask con Fuji configurado)
5. El paciente canjea puntos en **Farmacia Del Pueblo** → transacción en MetaMask

---

## MetaMask — configurar Fuji

| Campo        | Valor                                          |
|--------------|------------------------------------------------|
| Red          | Avalanche Fuji C-Chain                         |
| RPC URL      | https://api.avax-test.network/ext/bc/C/rpc     |
| Chain ID     | 43113                                          |
| Símbolo      | AVAX                                           |
| Explorer     | https://testnet.snowtrace.io                   |

AVAX de prueba gratis: https://faucet.avax.network/

---

> ⚠️ Las claves privadas del `.env` son solo para demo. Nunca exponer en producción.
