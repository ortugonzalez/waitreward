# Submit Checklist — DoraHacks
## Deadline: 22/03/2026 a las 9:00 AM (hora Argentina, UTC-3)

---

## URL del submit
https://dorahacks.io/hackathon/alephhackathonm26/buidl/new

---

## Datos a completar en el formulario

**Project Name:**
```
WaitReward
```

**Tagline (one-liner):**
```
Medical wait time transformed into real rewards on Avalanche
```

**GitHub:**
```
https://github.com/ortugonzalez/waitreward
```

**Contract Address:**
```
0xAad6125bE3E57473fb575af47c4B96253c1bEEEa
```

**Network:**
```
Avalanche Fuji Testnet (chainId: 43113)
```

**Snowtrace Explorer:**
```
https://testnet.snowtrace.io/address/0xAad6125bE3E57473fb575af47c4B96253c1bEEEa
```

**Demo Video:** `[link de YouTube/Loom — grabar antes de las 9 AM]`

---

## Tracks a seleccionar en DoraHacks

- [x] **Avalanche Track**
- [x] **Fiserv Fintech Track**

---

## Description (pegar en el campo de texto largo)

```
WaitReward transforms medical wait time into real value.

When a clinic runs late, patients automatically receive WaitPoints via smart contract on Avalanche. Points are redeemable at partner businesses (pharmacies, cafés, psychology sessions).

Built on Avalanche Fuji with Solidity + Node.js + React + Flask ML module. The AI module predicts delays before they happen, turning a reactive compensation system into a proactive clinic management tool.

Business model: commerce monthly membership + 3% protocol fee per redemption.
Target market: 15M+ annual medical consultations in Argentina, expandable to LATAM.

Tech stack:
- Smart contract: Solidity ERC-20 (WRT token) on Avalanche Fuji
- Backend: Node.js + Express REST API
- Frontend: React + Vite + TailwindCSS (mobile-first PWA)
- AI: Python/Flask delay prediction module
```

---

## Bounty descriptions

### Avalanche Track
```
WaitReward is a loyalty rewards protocol deployed on Avalanche Fuji.

WaitPoints (WRT) is an ERC-20 token minted on-demand when clinics register patient delays via smart contract. The contract handles:
- Delay-tiered minting: 15-29min → 50 WP, 30-59min → 150 WP, 60+min → 300 WP
- Commerce registration with monthly subscription (AVAX fee)
- Commerce deposit for redemption backing
- Patient redemptions with automatic 3% protocol fee

Every action (mint, redeem, register) is an on-chain transaction on Avalanche.
Contract: 0xAad6125bE3E57473fb575af47c4B96253c1bEEEa (Fuji)
```

### Fiserv Fintech Track
```
WaitReward is a merchant retention platform for healthcare-adjacent businesses.

Pharmacies, cafés, and other health-adjacent businesses pay a monthly AVAX membership to join the WaitReward commerce network. When patients receive WaitPoints for medical delays, they can redeem them exclusively at registered partner businesses — driving foot traffic and customer loyalty.

Each redemption is tracked on-chain with an automatic 3% protocol fee. Commerce dashboard shows real-time deposit balance, subscription status, and redemption history. The model creates a new distribution channel for brick-and-mortar businesses tied to healthcare infrastructure.
```

---

## Checklist de tareas antes del submit

### Código
- [x] Contrato desplegado en Fuji: `0xAad6125bE3E57473fb575af47c4B96253c1bEEEa`
- [x] Backend Node.js completo con todos los endpoints
- [x] Frontend React con HomeView, PatientView, ClinicView, CommerceView
- [x] Módulo IA predicción de demoras
- [x] README.md completo
- [x] Repo público: https://github.com/ortugonzalez/waitreward
- [x] `backend/.env` fuera del git

### Video
- [ ] Grabar demo de 3 minutos (ver DEMO_SCRIPT.md)
- [ ] Subir a YouTube (unlisted) o Loom
- [ ] Copiar el link del video

### Submit DoraHacks
- [ ] Entrar a https://dorahacks.io/hackathon/alephhackathonm26/buidl/new
- [ ] Completar todos los campos de este checklist
- [ ] Pegar el link del video
- [ ] Seleccionar tracks: Avalanche + Fiserv
- [ ] Confirmar submit antes de las 9:00 AM

---

## Información técnica adicional (por si la piden)

| Campo                | Valor                                                  |
|----------------------|--------------------------------------------------------|
| Token standard       | ERC-20                                                 |
| Token name           | WaitReward Token                                       |
| Token symbol         | WRT                                                    |
| Chain                | Avalanche Fuji C-Chain (43113)                         |
| RPC                  | https://api.avax-test.network/ext/bc/C/rpc             |
| Deployer/Clinic      | 0xb586790F5684d6E40a7e4dE353d08053D3eF9b41             |
| Registered commerce  | Farmacia Del Pueblo (0xb586790F...)                    |
| Tests                | 39 tests en Hardhat (contracts/test/)                  |
| License              | MIT                                                    |
