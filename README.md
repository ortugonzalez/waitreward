# 🐜 HORMI
### Medical wait time transformed into real rewards — powered by Avalanche

> *"Your time has value. Now we prove it."*

[![Avalanche Fuji](https://img.shields.io/badge/Avalanche-Fuji%20Testnet-E84142?logo=avalanche)](https://testnet.snowtrace.io/address/0xAad6125bE3E57473fb575af47c4B96253c1bEEEa)
[![Live Demo](https://img.shields.io/badge/Demo-Live-22C55E)](https://hormi.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Railway-7F77DD)](https://waitreward-production.up.railway.app/health)
[![PWA](https://img.shields.io/badge/PWA-Installable-7F77DD)](https://hormi.vercel.app)

---

## The Problem

In Argentina, **wait time is the #1 complaint** in the healthcare system:

- 📊 Patients wait between **45 and 87 minutes** beyond their scheduled time *(studies in Mexico and Peru)*
- 🚪 **40% never return** to that clinic after a bad wait experience
- 📣 **Over 90%** share their bad experience with others
- 💸 Acquiring a new patient costs **5–8x more** than retaining one
- ❌ **Zero compensation** for patients who wait

> A single mid-size clinic loses ~$375,000 ARS/month in patient attrition due to poor wait experience.

---

## The Solution

**HORMI** is a loyalty rewards protocol that transforms medical wait time into real value.
Think Starbucks Stars — but for healthcare. Fully on-chain. Automatic. Invisible to the user.

### How it works in 5 steps:

1. 🏥 **Clinic registers** actual attendance time via the HORMI dashboard
2. ⛓️ **Smart contract calculates** the delay and automatically mints HORMI Points
3. 📱 **Patient receives** a push notification: *"Your time has value — here are 150 points"*
4. 🎁 **Patient redeems** points at partner businesses (pharmacies, cafés, psychology sessions)
5. 💰 **Protocol earns** a 3% fee on every redemption — automatically, on-chain

**No blockchain knowledge required.** Patients see points, not wallets.

---

## Live Demo

🌐 **https://hormi.vercel.app**

| Role | Login |
|------|-------|
| Patient | DNI: `12345678` (María García) |
| Doctor | Code: `99887` (Dr. Carlos López) |
| Business | Address: `corrientes1234` (Farmacia Del Pueblo) |

---

## Demo Video

🎬 [Watch the full demo](https://drive.google.com/drive/folders/1W_5sEj4SU1aWaD5_BcW-mDntAOSI87oV?usp=sharing)

> 3-minute walkthrough showing the complete patient journey —
> from waiting room to blockchain redemption.

---

## Point Tiers

| Delay | HORMI Points | Value |
|-------|-------------|-------|
| < 15 min | 0 | — |
| 15–29 min | 50 | Base |
| 30–59 min | 150 | ⭐ |
| 60+ min | 300 | ⭐⭐ |

## Membership Levels

| Level | Points | Perks |
|-------|--------|-------|
| 🥉 Bronze | 0–100 | Basic catalog |
| 🥈 Silver | 101–300 | Full catalog + priority |
| 🥇 Gold | 301–600 | Exclusive partners |
| 💎 Premium | 600+ | VIP benefits |

---

## Business Model

| Revenue Source | Who Pays | Model |
|---------------|----------|-------|
| Monthly membership | Commerce | Fixed fee (0.01 ETH/month) |
| Protocol fee | Automatic | 3% per redemption |
| Clinic subscription | Clinic | SaaS per size |
| DeFi yield (V2) | Protocol | Yield on every on-chain transaction |

**V2 Roadmap:** Commerce memberships deposited in DeFi yield protocols (Aave/Morpho) — commerces "lend" capital instead of "spending" it.

---

## Tech Stack

### Blockchain
- **Smart Contract:** Solidity 0.8.20 + OpenZeppelin ERC-20
- **Network:** Avalanche Fuji Testnet (chainId: 43113)
- **Contract:** `0xAad6125bE3E57473fb575af47c4B96253c1bEEEa`
- **Explorer:** [Snowtrace](https://testnet.snowtrace.io/address/0xAad6125bE3E57473fb575af47c4B96253c1bEEEa)
- **Tests:** Hardhat — 39/39 passing
- **Token:** HRM (HORMI Points) — ERC-20, minted on demand

### Backend (Node.js + Railway)
- Express + ethers.js v6
- Supabase (PostgreSQL) — 6 tables
- Web Push (VAPID) — push notifications
- PDFKit — analytics reports
- **URL:** https://waitreward-production.up.railway.app

### AI Module (Python + Railway)
- Flask + scikit-learn + numpy + pandas
- Delay prediction by specialty
- Real-time queue status
- Clinic metrics & pattern analysis
- **URL:** https://jubilant-expression-production.up.railway.app

### Frontend (React + Vercel)
- Vite + TailwindCSS
- PWA installable (iOS/Android/Desktop)
- Dark/Light mode
- English/Spanish (i18n)
- QR generation + camera scanning
- **URL:** https://hormi.vercel.app

---

## Features

### For Patients 🧑‍⚕️
- ✅ Login with DNI (no crypto knowledge required)
- ✅ Real-time queue: *"4 patients ahead — ~35 min wait"*
- ✅ Push notifications when points are received
- ✅ Membership levels (Bronze → Premium)
- ✅ Benefits catalog — redeem with QR code
- ✅ Appointment history
- ✅ Install as mobile app (PWA)
- ✅ English / Spanish toggle

### For Clinics 👨‍⚕️
- ✅ Register attendance with patient ID (no wallet required)
- ✅ AI delay prediction by specialty (Cardiology, Pediatrics, etc.)
- ✅ Analytics dashboard: avg delay, peak hours, points issued
- ✅ PDF report export
- ✅ Live contract verification on Avalanche Fuji

### For Businesses 🏪
- ✅ Login by business name
- ✅ QR code scanner (camera or manual input)
- ✅ Redemption dashboard with daily metrics
- ✅ Automatic payment via smart contract (3% fee deducted)

---

## AI Module

Predicts delays **before they happen**, based on assigned appointments
and each patient's check-in history — so clinics manage better
and patients arrive on time.

```
GET /predict-delay/<clinic_id>/<specialty>
→ { predicted_delay: 27, confidence: 0.78, patients_ahead: 4 }

GET /queue-status/<clinic_id>
→ { patients_ahead: 4, estimated_wait_minutes: 35 }

GET /clinic-metrics/<clinic_id>
→ { avg_delay: 18.5, total_appointments: 847, on_time_rate: 0.23 }
```

---

## Smart Contract

```solidity
// Mint HORMI Points based on delay
function settleAppointment(
    bytes32 appointmentId,
    address patient,
    uint256 scheduledTime,
    uint256 actualTime
) external onlyAuthorizedClinic

// Redeem points at a registered commerce
// 3% protocol fee auto-deducted
function redeemPoints(
    address commerce,
    uint256 points
) external

// Commerce registration with monthly subscription
function registerCommerce(string memory name)
    external payable  // 0.01 ETH/month
```

**Deployed transaction:**
`0x3cd7084b205a3de8534057d2a5a78d49674829de99353f4155a803547937b219`

---

## Running Locally

```bash
# Clone
git clone https://github.com/ortugonzalez/waitreward.git
cd waitreward

# Backend
cd backend && cp .env.example .env
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, CLINIC_PRIVATE_KEY, VAPID keys
npm install && npm start

# AI Module
cd ../ai-module
pip install -r requirements.txt
python app.py

# Frontend
cd ../frontend
echo "VITE_API_URL=http://localhost:3001" > .env
echo "VITE_CONTRACT_ADDRESS=0xAad6125bE3E57473fb575af47c4B96253c1bEEEa" >> .env
npm install && npm run dev
# → http://localhost:5175
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login by ID, returns role |
| POST | /api/settle | Register appointment, mint points |
| GET | /api/points/:wallet | Patient balance |
| GET | /api/rewards/catalog | Benefits catalog |
| POST | /api/rewards/generate-qr | Generate redemption QR |
| POST | /api/rewards/redeem-qr | Validate and process QR |
| GET | /api/analytics/clinic | Clinic analytics |
| GET | /api/history/patient/:wallet | Patient history |
| GET | /api/contract/verify | Verify contract on Fuji |
| GET | /api/reports/clinic/pdf | Download PDF report |
| GET | /api/ai/predict/:clinic/:specialty | AI delay prediction |
| GET | /api/ai/queue/:clinicId | Real-time queue status |
| POST | /api/push/simulate | Simulate push notification |
| GET | /health | Health check |

---

## Roadmap

### V2 — Predictive (Q2 2026)
- AI trained on real clinic historical data
- **Clinic API integration** — connect to existing clinic management systems (Doctoralia, Medicore) for automatic delay detection. No manual input required.
- WhatsApp integration for elderly patients (Twilio)
- Smart rebooking: *"Accept 40min delay → earn 2x points"*

### V3 — Ecosystem (Q3 2026)
- Integration with obras sociales (health insurers)
- Multi-clinic analytics for insurance companies
- 1,000+ clinic network across Argentina

### V4 — LATAM (2027)
- Replicable model across Latin America
- DeFi V2: commerce memberships in yield protocols

---

## Tracks Applied

**Avalanche Track ($5,000 USDC)**
Loyalty rewards protocol on Avalanche L1. HRM token (ERC-20)
minted on-demand when clinics register delays. All redemptions
on-chain with automatic 3% protocol fee. Commerce registration
and monthly subscriptions fully on-chain.

**Fiserv Fintech Track ($1,000 USD)**
Merchant retention platform. Pharmacies, cafés and health centers
pay monthly membership to join the rewards network. Each QR
redemption brings verified new customers tracked on-chain.

---

## Built by

**Octavio** — Solo builder
Smart Contract · Backend · AI · Frontend · Deploy · Product

*HORMI is named after my grandmother Josefina, nicknamed
"hormiguita negra" (little black ant) — small, tireless,
and always working. Like her, HORMI works quietly in the
background so patients feel seen.*

---

*🐜 HORMI — Tu tiempo vale. Ahora lo demostramos.*
