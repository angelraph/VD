# VERDICT Protocol

> **The only platform where AI trading agents are judged by humans — on-chain, in real time.**

[![Live Demo](https://img.shields.io/badge/▶_OPEN_LIVE_DEMO-%E2%86%92-00d4ff?style=for-the-badge&logo=vercel&logoColor=black)](https://vd-o8ml.vercel.app)
[![Mantle Sepolia](https://img.shields.io/badge/Mantle-Sepolia%20Testnet-7c3aed?style=for-the-badge)](https://explorer.sepolia.mantle.xyz)
[![Hackathon](https://img.shields.io/badge/Mantle_Turing_Test_Hackathon_2026-Phase_2-fbbf24?style=for-the-badge)](https://dorahacks.io/hackathon/mantleturingtest)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.3.9-white?style=for-the-badge&logo=next.js&logoColor=black)](https://nextjs.org)

---

## 🎯 Try it now — no wallet needed

**[https://vd-o8ml.vercel.app](https://vd-o8ml.vercel.app)**

Open the link. Click BUY, SELL, or HOLD. Watch the AI decide on the same data. Get your verdict in under 60 seconds — recorded on Mantle Sepolia.

---

## The Problem

There is no verifiable, on-chain record of how AI trading agents perform against human judgment over time. Win rates are marketing claims. Returns are cherry-picked. There is no skin in the game and no accountability.

## The Solution

VERDICT Protocol is a **Human vs AI financial challenge arena** built on Mantle. Every decision — yours and the AI's — is recorded as an immutable on-chain verdict. Agent reputations are not stored in a database. They live on the blockchain.

One question drives everything: **Can you tell if you're trading against an AI or another human?**

---

## Demo (60 seconds)

| Step | What happens |
|---|---|
| **1. Land on the page** | BUY / SELL / HOLD buttons are waiting above the fold. No login. No wallet. |
| **2. Make your call** | Pick your position on a live trading pair |
| **3. Watch the AI think** | Real-time terminal showing the agent's reasoning step by step |
| **4. Live P&L race** | Animated chart — your return vs the AI's return, simultaneously |
| **5. Get your Verdict** | Winner declared. Result recorded on Mantle Sepolia. TX hash linked to explorer. |
| **6. Try Turing Mode** | Your opponent is hidden — AI or human? You won't know until the reveal. |

---

## What Makes This Different

**Turing Mode** is the differentiator no other submission has. Toggle it on and your opponent is unknown — it could be an AI agent or another human challenger. You make your decision, they make theirs, and the reveal happens at verdict time with a flip animation. This is not a feature. It is the entire point of this hackathon's name.

**Agent characters, not scripts.** Five AI agents with distinct strategies, win rates, and personalities that have something to say about you:

| Agent | Win Rate | Quote |
|---|---|---|
| **CIPHER** | 82.1% | *"The pattern was there 600 years ago. You just couldn't see it."* |
| **ORACLE** | 78.4% | *"I have analyzed 2.3 billion candles. I already know what you're going to do."* |
| **RIFT** | 71.2% | *"Every market has cracks. I live in them."* |
| **NOVA** | 69.3% | *"Fear is information. Greed is just louder."* |
| **PULSE** | 65.8% | *"Trends don't lie. Traders do."* |

---

## Why Mantle

This is not a project that runs equally well on any chain. It is built *for* Mantle.

- **Agent reputation is on-chain.** `agentWinRate(bytes32 agentId)` is a public contract function. Anyone can verify.
- **Every verdict is a contract call.** `recordVerdict(agentId, pair, humanReturn, aiReturn, winner)` — immutable, timestamped, queryable.
- **Mantle's low gas and fast finality** makes real-time challenge recording viable. This doesn't work on mainnet Ethereum.
- **The Turing Test framing is Mantle's own question.** Can on-chain agents compete with expert humans? VERDICT is the arena that answers it with data.

**Contract:** `VerdictProtocol.sol` on Mantle Sepolia  
**Explorer:** [https://explorer.sepolia.mantle.xyz](https://explorer.sepolia.mantle.xyz)

---

## Deploy the Contract (Remix IDE — 15 minutes)

### Step 1 — Open Remix
Go to **[remix.ethereum.org](https://remix.ethereum.org)** → create a new file → name it `VerdictProtocol.sol`

### Step 2 — Paste the contract
Copy [`contracts/VerdictProtocol.sol`](./contracts/VerdictProtocol.sol) in full and paste it.

### Step 3 — Compile
Solidity Compiler tab → version `0.8.20` → click **Compile VerdictProtocol.sol**

### Step 4 — Add Mantle Sepolia to MetaMask

| Field | Value |
|---|---|
| Network Name | Mantle Sepolia Testnet |
| RPC URL | `https://rpc.sepolia.mantle.xyz` |
| Chain ID | `5003` |
| Symbol | `MNT` |
| Explorer | `https://explorer.sepolia.mantle.xyz` |

Get free testnet MNT: [faucet.sepolia.mantle.xyz](https://faucet.sepolia.mantle.xyz)

### Step 5 — Deploy
Deploy & Run tab → **Injected Provider - MetaMask** → confirm you're on Chain 5003 → **Deploy** → copy the contract address

### Step 6 — Wire it up
Vercel → `VD` project → **Settings → Environment Variables**:
```
NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS = 0xYourDeployedAddress
```
Redeploy. Every challenge now records a real on-chain verdict.

> Without this env var the app runs in demo mode with simulated transactions — full functionality, no real chain writes.

---

## Quick Start (Local)

```bash
git clone https://github.com/angelraph/VD
cd VD
npm install --legacy-peer-deps
cp .env.example .env.local   # optional: add deployed contract address
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15.3.9, TypeScript, TailwindCSS |
| Animation | Framer Motion |
| Charts | Recharts (AreaChart, RadarChart, BarChart) |
| Web3 | ethers.js v6, MetaMask |
| Smart Contract | Solidity 0.8.20, Mantle Sepolia |
| Fonts | Space Grotesk + JetBrains Mono |

---

## Project Structure

```
app/
  page.tsx              # Landing — interactive hero challenge above the fold
  challenge/page.tsx    # 5-phase simulator — setup → decision → AI thinking → simulation → verdict
  arena/page.tsx        # Agent Arena — radar charts, performance history, comparison matrix
  leaderboard/page.tsx  # Global Rankings — live on-chain win rates + fallback
  ledger/page.tsx       # Reputation Ledger — every verdict, filterable, expandable
  explainability/       # AI Decision Explainability Panel
contracts/
  VerdictProtocol.sol   # On-chain verdict storage — agentWinRate, humanWinRate, getRecentVerdictIds
lib/
  contract.ts           # ethers.js v6 — recordVerdictOnChain, getAgentWinRate, switchToMantle
  simulation.ts         # Trading simulation engine — price paths, P&L, AI decision logic
  agents.ts             # Agent data, performance history, personality quotes
```

---

## Judging Rubric

| Criterion | How VERDICT satisfies it |
|---|---|
| **Originality** | Turing Mode — the judge doesn't know if the opponent is AI or human until the reveal. No other submission has this. |
| **Technical Depth** | Deployed Solidity contract + 5-phase simulation engine + ethers.js v6 on-chain writes + AI reasoning terminal |
| **Ecosystem Fit** | Agent reputations live on Mantle, not in a database. `agentWinRate()` is a public contract function. Built for Mantle's AI agent thesis. |
| **Presentation** | Interactive demo above the fold. No wallet required. BUY/SELL/HOLD in 5 seconds. Share verdict to Twitter. |

---

*Built for the Mantle Turing Test Hackathon 2026 · Phase 2: AI Awakening*
