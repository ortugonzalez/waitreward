# WaitReward 🏥⏱️
### Medical wait time transformed into real rewards — powered by Avalanche

> "The wait is inevitable. Now it's rewarded."

[![Avalanche Fuji](https://img.shields.io/badge/Avalanche-Fuji%20Testnet-E84142?logo=avalanche)](https://testnet.snowtrace.io/address/0xAad6125bE3E57473fb575af47c4B96253c1bEEEa)
[![Contract Verified](https://img.shields.io/badge/Contract-Verified-22C55E)](https://testnet.snowtrace.io/address/0xAad6125bE3E57473fb575af47c4B96253c1bEEEa)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-7F77DD)](https://github.com/ortugonzalez/waitreward)

---

## The Problem

In Argentina, **wait time is the #1 complaint** in the healthcare system:
- Average wait: **45+ minutes** beyond scheduled appointment time
- **15M+ annual medical consultations** affected
- Clinics overbook because health insurers (obras sociales) pay up to 3x less than private patients
- **Zero compensation** for patients who wait

A single mid-size clinic loses ~$375,000 ARS/month in avoidable patient attrition due to poor wait experience.

---

## Our Solution

WaitReward is a **loyalty rewards protocol** that transforms medical wait time into real value. Think Starbucks Stars — but for healthcare.

When a clinic runs late:
1. 🏥 Clinic registers actual attendance time via API
2. ⛓️ Smart contract calculates delay and **automatically mints WaitPoints (WRT tokens)** to the patient
3. 🎁 Patient redeems points at partner businesses (pharmacies, cafés, psychology sessions)
4. 💰 Commerce pays monthly membership — protocol earns 3% fee per redemption

**No blockchain knowledge required** — patients see points, not wallets.

---

## How It Works

### Point Tiers
| Delay | WaitPoints | Value |
|-------|-----------|-------|
| < 15 min | 0 WP | — |
| 15–29 min | 50 WP | $0.50 |
| 30–59 min | 150 WP | $1.50 |
| 60+ min | 300 WP | $3.00 |

### Membership Levels
| Level | Points | Perks |
|-------|--------|-------|
| 🥉 Bronze | 0–100 | Basic catalog |
| 🥈 Silver | 101–300 | Priority redemptions |
| 🥇 Gold | 301–600 | Exclusive partners |
| 💎 Premium | 600+ | VIP benefits |

### Business Model
| Revenue Source | Who Pays | Model |
|---------------|----------|-------|
| Monthly membership | Commerce | Fixed fee |
| Protocol fee | Automatic | 3% per redemption |
| Clinic subscription | Clinic | SaaS per size |

---

## Tech Stack

### Blockchain
- **Smart Contract:** Solidity 0.8.20 + OpenZeppelin ERC-20
- **Network:** Avalanche Fuji Testnet (chainId: 43113)
- **Contract:** `0xAad6125bE3E57473fb575af47c4B96253c1bEEEa`
- **Snowtrace:** https://testnet.snowtrace.io/address/0xAad6125bE3E57473fb575af47c4B96253c1bEEEa
- **Tests:** Hardhat — 39/39 passing
- **Token:** WRT (WaitReward Token) — ERC-20, minted on demand

### Backend
- **Runtime:** Node.js + Express
- **Blockchain:** ethers.js v6
- **Database:** Supabase (PostgreSQL, schema: waitreward)
- **Push notifications:** web-push (VAPID)
- **PDF reports:** pdfkit

### AI Module
- **Runtime:** Python + Flask
- **ML:** scikit-learn + numpy + pandas
- **Features:** Delay prediction, queue status, pattern analysis, clinic metrics
- **Endpoints:** predict-delay, queue-status, clinic-metrics, pattern-analysis

### Frontend
- **Framework:** React + Vite
- **Styling:** TailwindCSS
- **PWA:** Service Worker + Web Push API
- **QR:** qrcode.react
- **Auth:** DNI-based login (no wallet required for users)

---

## Features

### For Patients 🧑‍⚕️
- ✅ Login with DNI (no crypto knowledge required)
- ✅ Real-time WaitPoints balance
- ✅ Membership level (Bronze → Premium)
- ✅ Benefits catalog with one-tap redemption
- ✅ QR code generation (valid 60 days)
- ✅ Appointment history with on-chain proof
- ✅ Queue status: "4 patients ahead, ~35 min wait"
- ✅ Push notifications when points are received
- ✅ Install as mobile app (PWA)

### For Clinics 👨‍⚕️
- ✅ Register attendance with DNI (no wallet input)
- ✅ AI delay prediction by specialty (Cardiology, Pediatrics, etc.)
- ✅ Analytics dashboard: avg delay, peak hours, points awarded
- ✅ PDF report export
- ✅ Contract verification endpoint

### For Commerces 🏪
- ✅ Login by business name
- ✅ QR code scanner for redemptions
- ✅ Dashboard with redemption history
- ✅ Automatic payment processing via smart contract

### Technical
- ✅ Smart contract deployed on Avalanche Fuji
- ✅ All redemptions verified on-chain (transparent, immutable)
- ✅ Automatic 3% protocol fee on every redemption
- ✅ Supabase real-time database
- ✅ Web Push notifications
- ✅ PWA installable on iOS/Android
- ✅ PDF analytics reports

---

## AI Module

The Flask AI module predicts delays **before they happen**, turning a reactive compensation system into a proactive clinic management tool.

```
GET /predict-delay/<clinic_id>/<specialist>
→ { predicted_delay: 27, confidence: 0.78, patients_ahead: 4 }

GET /queue-status/<clinic_id>
→ { patients_ahead: 4, estimated_wait_minutes: 35, confidence: 0.75 }

GET /clinic-metrics/<clinic_id>
→ { avg_delay: 18.5, total_appointments: 847, on_time_rate: 0.23 }
```

Data is currently synthetic (representative of Argentine clinic patterns).
V2 will use real clinic historical data.

---

## Smart Contract

**WaitReward.sol** — ERC-20 token with integrated loyalty logic:
```solidity
// Mint WaitPoints based on delay
function settleAppointment(
    bytes32 appointmentId,
    address patient,
    uint256 scheduledTime,
    uint256 actualTime
) external onlyAuthorizedClinic

// Redeem points at a registered commerce
function redeemPoints(
    address commerce,
    uint256 points
) external  // 3% fee auto-deducted

// Commerce registration with monthly subscription
function registerCommerce(string memory name)
    external payable  // 0.01 ETH/month
```

**Deployed transaction:**
`0x3cd7084b205a3de8534057d2a5a78d49674829de99353f4155a803547937b219`

---

## Running Locally

### Requirements
- Node.js 18+
- Python 3.9+
- Git

### Setup

**Terminal 1 — Backend:**
```bash
git clone https://github.com/ortugonzalez/waitreward.git
cd waitreward/backend
cp .env.example .env
# Add your SUPABASE_URL, SUPABASE_ANON_KEY, CLINIC_PRIVATE_KEY
npm install && npm start
```

**Terminal 2 — AI Module:**
```bash
cd waitreward/ai-module
pip install -r requirements.txt
python app.py
```

**Terminal 3 — Frontend:**
```bash
cd waitreward/frontend
echo "VITE_API_URL=http://localhost:3001" > .env
echo "VITE_CONTRACT_ADDRESS=0xAad6125bE3E57473fb575af47c4B96253c1bEEEa" >> .env
npm install && npm run dev
# → http://localhost:5175
```

### Demo Credentials
| DNI | Name | Role |
|-----|------|------|
| 12345678 | María García | Patient |
| 87654321 | Juan Pérez | Patient |
| 99887766 | Dr. Carlos López | Clinic |
| 55443322 | Farmacia Del Pueblo | Commerce |

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login by DNI, returns role |
| POST | /api/settle | Register appointment, mint WaitPoints |
| GET | /api/points/:wallet | Get patient balance |
| GET | /api/rewards/catalog | Benefits catalog |
| POST | /api/rewards/generate-qr | Generate redemption QR |
| POST | /api/rewards/redeem-qr | Validate and process QR |
| GET | /api/analytics/clinic | Clinic analytics dashboard |
| GET | /api/history/patient/:wallet | Patient appointment history |
| GET | /api/contract/verify | Verify contract on Fuji |
| GET | /api/reports/clinic/pdf | Download PDF report |
| GET | /api/ai/predict/:clinic/:specialty | AI delay prediction |
| GET | /api/ai/queue/:clinicId | Real-time queue status |
| POST | /api/push/subscribe | Subscribe to push notifications |
| GET | /health | Health check |

---

## Roadmap

### V2 — Predictive (Next 3 months)
- AI trained on real clinic historical data
- WhatsApp integration for elderly patients (Twilio)
- Real-time queue dashboard (Waze-style for clinics)
- Smart rebooking: "Accept 40min delay → earn 2x points"

### V3 — Ecosystem (6 months)
- Integration with obras sociales (health insurers)
- Multi-clinic analytics for insurance companies
- 1,000+ clinic network across Argentina

### V4 — LATAM (12 months)
- Replicable model across Latin America
- Strategic local partnerships per country
- DeFi V2: commerce memberships deposited in yield protocols (Aave/Morpho)

---

## Tracks Applied

- **Avalanche Track** — Loyalty rewards protocol on Avalanche L1. WRT token (ERC-20) minted on-demand when clinics register delays. All redemptions on-chain with automatic 3% protocol fee.
- **Fiserv Fintech Track** — Merchant retention platform. Pharmacies and cafés pay monthly membership. Each QR redemption brings verified new customers tracked on-chain.

---

## Team

| Role | Responsibility |
|------|---------------|
| Smart Contract + AI + Coordination | Solidity, deploy, AI integration, backend |
| Backend (Enzo) | Node.js API, Supabase, push notifications |
| Frontend (Juliana) | React, UI/UX, PWA |

---

## Links

- **GitHub:** https://github.com/ortugonzalez/waitreward
- **Contract:** https://testnet.snowtrace.io/address/0xAad6125bE3E57473fb575af47c4B96253c1bEEEa
- **Network:** Avalanche Fuji (chainId: 43113)

---

*WaitReward — Tu tiempo vale. Ahora lo demostramos.*
