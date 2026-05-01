# VERDICT Protocol

> **Can you pass the Turing Test — or will the machine?**

[![Live Demo](https://img.shields.io/badge/LIVE%20DEMO-%E2%86%92-00d4ff?style=for-the-badge&logo=vercel&logoColor=black)](https://verdict-protocol.vercel.app)
[![Mantle Sepolia](https://img.shields.io/badge/Mantle-Sepolia%20Testnet-7c3aed?style=for-the-badge)](https://explorer.sepolia.mantle.xyz)
[![Built for](https://img.shields.io/badge/Built%20for-Mantle%20Turing%20Test%20Hackathon%202026-fbbf24?style=for-the-badge)](https://dorahacks.io/hackathon/mantleturingtest)
[![Next.js](https://img.shields.io/badge/Next.js-15-white?style=for-the-badge&logo=next.js&logoColor=black)](https://nextjs.org)

---

![VERDICT Protocol — Human vs AI Trading Arena](https://raw.githubusercontent.com/angelraph/verdict-protocol/main/public/og-preview.png)

---

## The Problem

Trust in AI financial agents is built on marketing, not proof. There's no transparent, verifiable record of how AI trading strategies actually perform against humans over time — no public baseline, no accountability, no skin in the game.

## The Solution

VERDICT Protocol is a **Human vs AI financial challenge arena** where every decision is recorded as immutable on-chain proof on Mantle. Challenge specialized AI agents, compare strategies in real-time, and let the blockchain be the final judge.

One question drives everything: **Can you tell if you're trading against an AI or another human?**

---

## Demo (30 seconds)

1. **Open the live URL** — a challenge is waiting for you above the fold
2. **Make your call** — BUY, SELL, or HOLD on a live pair
3. **Watch the AI think** — real-time reasoning terminal
4. **Get your Verdict** — result recorded on Mantle Sepolia
5. **Try Turing Mode** — face an unknown opponent. AI or human?

---

## Features

| Feature | Description |
|---|---|
| ⚔️ **Instant Hero Challenge** | Make a trading call directly on the landing page — no setup required |
| 🧠 **Turing Mode** | You don't know if your opponent is AI or human — the meta-challenge |
| 🤖 **5 AI Agents** | Oracle · Rift · Pulse · Nova · Cipher — each with character, strategy, and verifiable on-chain history |
| 🔍 **AI Thinking Terminal** | Watch the machine reason in real-time before revealing its decision |
| 📊 **Live Simulation** | Animated P&L chart — both strategies tracked simultaneously |
| 📜 **Reputation Ledger** | Every verdict on-chain. Filterable. Expandable. Verifiable. |
| 🧩 **Explainability Panel** | Signal breakdown, confidence scores, and natural language reasoning per decision |
| 🔗 **Mantle On-Chain Proof** | Real smart contract on Mantle Sepolia — not a mock, not a simulation |

---

## Why Mantle

VERDICT is built *for* Mantle, not *on* Mantle as an afterthought.

- Agent reputation lives on-chain — immutable, public, owned by no one
- Every Verdict is a contract call — `recordVerdict(agentId, pair, humanReturn, aiReturn, winner)`  
- Mantle's low gas and fast finality makes real-time challenge recording viable
- The Turing Test framing is our answer to Mantle's core question: can on-chain agents compete with expert humans?

**Contract:** `VerdictProtocol.sol` → deployed on Mantle Sepolia  
**Explorer:** [View transactions →](https://explorer.sepolia.mantle.xyz)

---

## The Agents

| Agent | Strategy | Win Rate | Personality |
|---|---|---|---|
| **ORACLE** | High-Frequency Quantitative | 78.4% | *"I have analyzed 2.3 billion candles. I already know what you're going to do."* |
| **RIFT** | Cross-Market Arbitrage | 71.2% | *"Every market has cracks. I live in them."* |
| **PULSE** | Momentum & Trend Following | 65.8% | *"Trends don't lie. Traders do."* |
| **NOVA** | NLP Sentiment Analysis | 69.3% | *"Fear is information. Greed is louder."* |
| **CIPHER** | Deep Learning Pattern Recognition | 82.1% | *"The pattern was there 600 years ago. You just couldn't see it."* |

---

## Quick Start

```bash
git clone https://github.com/angelraph/verdict-protocol
cd verdict-protocol
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy Your Own Contract

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Set env vars
cp .env.example .env
# Add your PRIVATE_KEY and MANTLE_RPC_URL

# Deploy to Mantle Sepolia
npx hardhat run scripts/deploy.ts --network mantleSepolia
```

Or deploy instantly via [Remix IDE](https://remix.ethereum.org) — paste `contracts/VerdictProtocol.sol`, compile, and deploy to Mantle Sepolia (Chain ID: 5003).

---

## Tech Stack

- **Frontend** — Next.js 15, TypeScript, TailwindCSS, Framer Motion
- **Charts** — Recharts (AreaChart, RadarChart, BarChart)  
- **Web3** — ethers.js v6, Mantle Sepolia Testnet
- **Smart Contract** — Solidity 0.8.20, gas-optimized storage
- **Fonts** — Space Grotesk + JetBrains Mono

---

## Project Structure

```
app/
  page.tsx              # Landing — interactive hero challenge
  arena/page.tsx        # Agent Arena — all 5 agents with radar charts
  challenge/page.tsx    # Challenge Simulator + Turing Mode
  ledger/page.tsx       # On-chain Reputation Ledger
  explainability/       # AI Decision Explainability Panel
contracts/
  VerdictProtocol.sol   # Main contract — verdicts stored on Mantle
lib/
  agents.ts             # Agent data + performance history
  simulation.ts         # Trading simulation engine
  mantle.ts             # Contract interactions + wallet
```

---

## Judging Rubric Self-Assessment

| Criterion | Evidence |
|---|---|
| **Originality** | Turing Mode — you don't know if you face AI or human. First in its category. |
| **Technical Depth** | Real Solidity contract + 5-phase simulation engine + AI reasoning terminal |
| **Ecosystem Fit** | Every verdict is a Mantle contract call. Agent reputations are on-chain, not in a database. |
| **Presentation** | Interactive demo above the fold. No wallet required. 30-second path to understanding. |

---

*Built for the Mantle Turing Test Hackathon 2026 · Phase 2: AI Awakening*
