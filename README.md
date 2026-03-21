# ⏱ WaitReward — Medical Wait Time Rewards on Avalanche

> **Turn wasted time into real value.** WaitReward compensates patients for medical appointment delays by issuing on-chain loyalty points redeemable at local businesses.

[![Avalanche](https://img.shields.io/badge/Built%20on-Avalanche-E84142?style=flat-square&logo=avalanche)](https://www.avax.network/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## 🏥 The Problem

In Argentina, **waiting at the doctor** is the **#1 complaint** in the healthcare system:

- **Average wait time: 45+ minutes** beyond the scheduled appointment
- Clinics issue **overbooked slots** because public insurance pays significantly less than private patients
- **No compensation** is ever given to the patient who waited
- This is a systemic issue affecting **millions** of patients across LATAM

Source: Argentina's SISA healthcare data, patient surveys, and public health reports.

---

## 💡 The Solution

WaitReward creates a **trustless, blockchain-powered loyalty system** where:

1. 🏥 **Clinic registers** the actual attendance time via our platform
2. ⏱ **Smart contract calculates** the delay automatically
3. 🪙 **WaitPoints (WRT tokens)** are minted directly to the patient's wallet
4. 🏪 **Patient redeems** points at partnered local businesses (pharmacies, cafés, etc.)
5. 💰 **Commerce receives** customers and deposits funds to back the redemptions

### Points Tiers (On-Chain)

| Delay | WaitPoints | USD Equivalent |
|-------|-----------|----------------|
| < 15 min | 0 WP | $0.00 |
| 15-29 min | 50 WP | $0.50 |
| 30-59 min | 150 WP | $1.50 |
| 60+ min | 300 WP | $3.00 |

> **Exchange rate:** 100 WaitPoints = $1.00 (fixed in smart contract)

---

## 🧠 AI-Powered Delay Prediction

WaitReward includes a **predictive AI module** that analyzes historical appointment data to:

- **Predict expected delays** by specialty and clinic
- **Provide confidence scores** for predictions
- **Compute clinic-level metrics** (average delay, total appointments, trends)

The AI module runs a scikit-learn model trained on synthetic data representative of real-world patterns. It provides predictions per specialty (e.g., Cardiology: 27 min, 78% confidence) and enables proactive patient notifications.

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | Solidity 0.8.20 + OpenZeppelin ERC-20 |
| **Blockchain** | Avalanche Fuji Testnet (chainId: 43113) |
| **Contract Tests** | Hardhat (39/39 passing ✅) |
| **Backend** | Node.js + Express + ethers.js v6 |
| **Frontend** | React + Vite + TailwindCSS + ethers.js v6 |
| **AI Module** | Flask + Python + scikit-learn + numpy + pandas |
| **Wallet** | MetaMask |

---

## 📝 Smart Contract

**Deployed on Avalanche Fuji Testnet:**

| | |
|---|---|
| **Contract Address** | `0xAad6125bE3E57473fb575af47c4B96253c1bEEEa` |
| **Token** | WaitReward Token (WRT) — ERC-20 |
| **Explorer** | [View on Snowtrace](https://testnet.snowtrace.io/address/0xAad6125bE3E57473fb575af47c4B96253c1bEEEa) |
| **Network** | Avalanche Fuji (Chain ID: 43113) |
| **RPC** | `https://api.avax-test.network/ext/bc/C/rpc` |

### Contract Functions

- `settleAppointment(id, patient, scheduledTime, actualTime)` → Mints WRT tokens based on delay tier
- `registerCommerce(name)` **payable** → Commerce pays 0.01 AVAX/month subscription
- `depositForRedemptions()` → Commerce deposits funds to back patient redemptions
- `redeemPoints(commerceAddress, points)` → Burns WRT, transfers AVAX to patient, 3% protocol fee
- `withdrawFees()` → Protocol owner withdraws accumulated fees

### Verified E2E on Fuji

- **Appointment FUJI-TURNO-001:** 45 min delay → 150 WP minted ✅
- **Tx:** [0x3cd7084b...](https://testnet.snowtrace.io/tx/0x3cd7084b205a3de8534057d2a5a78d49674829de99353f4155a803547937b219)

---

## 💼 Business Model

| Actor | Action | Cost |
|-------|--------|------|
| **Commerce** | Monthly subscription | 0.01 AVAX/month |
| **Commerce** | Deposit for redemptions | Variable (backs WP redemptions) |
| **Protocol** | Fee on each redemption | 3% automatic (in Solidity) |
| **Patient** | Receives WP & redeems | Free |
| **Clinic** | Registers attendance | Free |

### Revenue Streams

1. **3% redemption fee** — Automatic on every point redemption
2. **Subscription fees** — Monthly from each registered commerce
3. **V2: DeFi yield** — Subscription deposits pooled into Aave/Morpho for yield generation

---

## 🎯 Tracks Applied

### 🔴 Avalanche Track ($5,000 USDC)
- **Loyalty program** built entirely on Avalanche L1
- ERC-20 token for trustless point management
- On-chain settlement of appointments with automated tier-based rewards
- Commerce deposits and redemptions handled by smart contract

### 💳 Fiserv Fintech Track ($1,000 USD)
- **Merchant-focused app** with AI-powered delay prediction
- Commerce dashboard for tracking redemptions and managing deposits
- QR code generation for in-store point redemption
- Real-world payment flow: patient earns → redeems at partner stores

---

## 🗺 Roadmap V2

- **🔮 WhatsApp Integration** — Notify patients of predicted delays before arrival
- **🏦 DeFi Yield Pool** — Commerce subscription funds deposited into Aave/Morpho; discounts auto-funded by yield (commerce "lends" capital instead of "spending" it)
- **🤝 Health Insurance (Obras Sociales) Integration** — Auto-detect overbooked slots from insurance schedules
- **🌎 LATAM Expansion** — Scale to Brazil, Mexico, Colombia (similar healthcare wait issues)
- **📊 Advanced ML** — Real-time delay prediction using live queue data

---

## 🚀 Running Locally

### Prerequisites

- Node.js 18+
- Python 3.9+
- MetaMask browser extension
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/ortugonzalez/waitreward.git
cd waitreward
```

### Terminal 1 — Backend

```bash
cd backend
npm install
npm start
# → Running on http://localhost:3001
# → Connected to Avalanche Fuji (no local node needed)
```

### Terminal 2 — AI Module

```bash
cd ai-module
pip install -r requirements.txt
python app.py
# → Running on http://localhost:5000
```

### Terminal 3 — Frontend

```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:5175
```

### Environment Variables

**Backend** (`backend/.env`):
```env
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
CONTRACT_ADDRESS=0xAad6125bE3E57473fb575af47c4B96253c1bEEEa
CLINIC_PRIVATE_KEY=<deployer-private-key>
PORT=3001
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
VITE_CONTRACT_ADDRESS=0xAad6125bE3E57473fb575af47c4B96253c1bEEEa
```

### MetaMask Configuration

1. Add Avalanche Fuji network (Chain ID: 43113, RPC: `https://api.avax-test.network/ext/bc/C/rpc`)
2. Get test AVAX from the [Avalanche Faucet](https://faucet.avax.network/)

---

## 🗂 Project Structure

```
waitreward/
├── contracts/
│   └── WaitReward.sol          # Smart contract (Solidity)
├── backend/
│   ├── index.js                # Express server entry
│   ├── routes/settle.js        # Appointment settlement
│   ├── routes/points.js        # WaitPoints balance
│   ├── routes/redeem.js        # Point redemption
│   ├── routes/commerce.js      # Commerce info
│   └── routes/ai.js            # AI module proxy
├── frontend/
│   ├── src/views/PatientView   # Patient wallet & redemption
│   ├── src/views/ClinicView    # Appointment registration + AI prediction
│   └── src/views/CommerceView  # Commerce dashboard
├── ai-module/
│   ├── app.py                  # Flask API server
│   └── delay_detector.py       # ML delay prediction
├── scripts/
│   └── deploy.js               # Hardhat deployment script
└── test/                       # 39 contract tests
```

---

## 👥 Team

| | Role |
|---|---|
| **Santiago** | AI + Smart Contract + Architecture |
| **Enzo** | Backend Development |
| **Juliana** | Frontend Development |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with 💜 for <a href="https://dorahacks.io/hackathon/alephhackathonm26/detail">Aleph Hackathon March '26</a>
</p>
