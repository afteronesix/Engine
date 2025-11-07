<div align="center">
  <img src="https://github.com/afteronesix/Engine/blob/main/public/icon.png" alt="Solana Logo" width="150" />
  <h1>Engine - Solana Spin Wheel Game</h1>
  <p>
    A decentralized Farcaster mini-app “Spin & Win” built on <b>Solana</b>, <b>React</b>, and <b>Cloudflare</b>.
  </p>
  <p>
    <a href="https://github.com/afteronesix/Engine/blob/main/LICENSE">
      <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
    </a>
    <a href="https://github.com/afteronesix/Engine/actions">
      <img alt="Build Status" src="https://img.shields.io/github/actions/workflow/status/afteronesix/Engine/ci.yml?branch=main"/>
    </a>
    <img src="https://img.shields.io/badge/Network-Solana-14a6ff?logo=solana&logoColor=white" alt="Solana"/>
    <img src="https://img.shields.io/badge/Hosting-Cloudflare-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare"/>
    <img src="https://img.shields.io/badge/Farcaster-MiniApp-6E44FF?logo=farcaster&logoColor=white" alt="Farcaster"/>
    <img src="https://img.shields.io/badge/Wallet-Reown-4CAF50?logo=walletconnect&logoColor=white" alt="Reown"/>
  </p>
</div>

---

## 📖 About This Project

**Engine** is a decentralized “Spin & Win” web application built for **Farcaster Mini-Apps**.  
Users can connect their **Solana wallets** (via **Reown AppKit**), receive a limited number of free daily spins, and win real SOL prizes.

The project uses a **React/Vite** frontend and a **serverless Cloudflare Functions** backend for secure validation and reward distribution.

---

## ✨ Key Features

- **Farcaster Integration:** Designed to run seamlessly as a Farcaster Mini-App.  
- **Wallet Connection:** Smooth Solana wallet integration powered by **Reown**.  
- **Daily Spins:** Each user receives limited free spins stored in Local Storage.  
- **On-Chain Rewards:** Prizes are distributed directly to users’ wallets via a secure backend.  
- **Fully Serverless:** Hosted on **Cloudflare Pages & Functions** for unlimited scalability at minimal cost.

---

## 💻 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React (Vite), TypeScript, TailwindCSS |
| **Wallet** | Reown AppKit |
| **Blockchain** | Solana (`@solana/web3.js`) |
| **Backend & Hosting** | Cloudflare Pages + Cloudflare Functions |
| **Database (Cache)** | Cloudflare KV (for winner logs) |

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)  
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)  
- A [Cloudflare](https://www.cloudflare.com/) account  

---

### 1. Clone the Repository

```bash
git clone https://github.com/afteronesix/Engine.git
cd Engine
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment (.env)

Create a `.env` file in the project root and add the following variables for local development:

```bash
# Your secret API key for backend validation
VITE_API_KEY=your_super_secret_api_key_string_12345

# Solana RPC endpoint for frontend
# Get one from: https://www.helius.dev/ or https://www.quicknode.com/
VITE_SOLANA_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=...

# Reown Project ID
# Obtain from: https://dashboard.reown.com/
VITE_REOWN_PROJECT_ID=your_reown_project_id
```

---

### 4. Run Locally

Use Wrangler to emulate the Cloudflare Pages + Functions environment locally.

```bash
npm run start
```

This runs both the **Vite frontend** and the **Functions backend** simultaneously.

---

## ☁️ Deploy to Cloudflare

### Step 1. Push to GitHub  
Ensure your latest code is committed and pushed.

### Step 2. Create Cloudflare KV  
In the Cloudflare dashboard:
- Go to **Workers & Pages → KV → Create Namespace**  
- Name it: `WINNER_LOGS`

### Step 3. Create Pages Project  
- Go to **Workers & Pages → Create application → Pages → Connect to Git**  
- Select your **Engine** repository.  
- Configure build settings:
  - **Framework preset:** Vite  
  - **Build command:** `npm run build`  
  - **Output directory:** `dist`

### Step 4. Set Environment Variables  

Go to **Settings → Environment Variables** under your Pages project:

| Variable | Value |
|-----------|--------|
| `SOLANA_RPC_URL` | Your Solana RPC URL (Helius/QuickNode) |
| `API_KEY` | Same as your `.env` API key |
| `PRIVATE_KEY` | JSON array of your backend wallet private key (e.g. `[12,45,23,...,98]`) |

Then scroll to **KV Namespace Bindings**:
- Add Binding:
  - **Variable name:** `WINNER_LOGS`
  - **KV namespace:** select `WINNER_LOGS`

Finally, **Save and Deploy** 🚀  
Your decentralized spin wheel game is now live!

---

## 🎁 Customize Rewards

To modify rewards, edit both **frontend** and **backend** for consistency.

### 1. Frontend Display  
`src/components/Spin.tsx`

```ts
const data = [
  { option: '0.0001 SOL', style: { backgroundColor: '#8B5CF6', textColor: '#FFFFFF' }, weight: 45 },
  { option: '0.001 SOL', style: { backgroundColor: '#3B82F6', textColor: '#FFFFFF' }, weight: 5 },
  // ...
];
```

### 2. Backend Validation  
`functions/api/spin.ts`

```ts
const ALLOWED_REWARDS: Record<string, number> = {
  "0.0001 SOL": 0.0001,
  "0.001 SOL": 0.001,
  // ...
};
```

⚠️ **Important:**  
If the reward list in the frontend and backend doesn’t match exactly, reward validation will fail.

---

## ❤️ Contributing & Support

Contributions, issues, and feature requests are always welcome!  
Open a pull request or report bugs directly on GitHub.

If this project helps you, please consider:
- 🌟 Starring the repository  
- 💰 Donating to support prize vaults:

**SOL Donation Address:**  
`3KLHVSieHoAiY1XC3yZazxbatoiDHZjGYnWMEcueVAoX`

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/afteronesix">afteronesix</a> • Powered by Solana & Cloudflare</sub>
</div>
