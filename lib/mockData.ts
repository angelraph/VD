import type { LedgerEntry, TradingPair, Decision, AgentId } from "@/types";
import { generateTxHash, generateBlockNumber } from "@/lib/utils";

const PAIRS: TradingPair[] = ["ETH/USDT", "BTC/USDT", "MNT/USDT", "ARB/USDT", "LINK/USDT"];
const DECISIONS: Decision[] = ["BUY", "SELL", "HOLD"];
const AGENT_IDS: AgentId[] = ["oracle", "rift", "pulse", "nova", "cipher"];
const AGENT_NAMES: Record<AgentId, string> = {
  oracle: "ORACLE",
  rift: "RIFT",
  pulse: "PULSE",
  nova: "NOVA",
  cipher: "CIPHER",
};
const AGENT_COLORS: Record<AgentId, string> = {
  oracle: "#00d4ff",
  rift: "#7c3aed",
  pulse: "#00ff9d",
  nova: "#fbbf24",
  cipher: "#ff3366",
};

const SAMPLE_REASONING: Record<AgentId, string[]> = {
  oracle: [
    "Mean-reversion signal triggered at 2.1σ deviation from 20-day MA",
    "Statistical edge confirmed: 847 matching patterns, 78.4% resolved in this direction",
    "Order flow imbalance: 3.2x more buy orders in the last 15 minutes",
  ],
  rift: [
    "Price discrepancy of 0.23% detected between spot and perp markets",
    "Funding rate at 0.031% — above neutral threshold, favoring this position",
    "Cross-exchange arbitrage window: estimated 4-7 minute duration",
  ],
  pulse: [
    "Momentum score: 8.7/10 — strong trending regime confirmed",
    "Breakout above 50-day EMA with 184% volume surge",
    "Trailing stop set at 2.8% below entry — capturing trend with protection",
  ],
  nova: [
    "Sentiment shift detected: fear index dropped from 71 to 52 in 24hrs",
    "Social volume up 340% with 73% positive mentions across 14 monitored channels",
    "News catalyst: protocol upgrade announcement triggered long-term holder accumulation",
  ],
  cipher: [
    "Fractal pattern match: 97.3% similarity to bull flag formation from Q2 2023",
    "Neural confidence: 84.7% — above 80% execution threshold",
    "Multi-timeframe alignment: 4H, 1D, and 1W all confirm directional bias",
  ],
};

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEntry(daysAgo: number): LedgerEntry {
  const agentId = randomElement(AGENT_IDS);
  const pair = randomElement(PAIRS);
  const decision = randomElement(DECISIONS);
  const outcome = Math.random() > 0.35 ? "win" : "loss";
  const pnlPercent =
    outcome === "win"
      ? parseFloat((Math.random() * 8 + 0.5).toFixed(2))
      : -parseFloat((Math.random() * 5 + 0.2).toFixed(2));
  const pnl = parseFloat((pnlPercent * (Math.random() * 900 + 100)).toFixed(2));
  const reasoning = randomElement(SAMPLE_REASONING[agentId]);
  const humanDecisions: Decision[] = ["BUY", "SELL", "HOLD"];
  const humanDecision = randomElement(humanDecisions);
  const humanPnl = outcome === "win"
    ? -parseFloat((Math.random() * 4 + 0.3).toFixed(2))
    : parseFloat((Math.random() * 3 + 0.1).toFixed(2));

  return {
    id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    agentId,
    agentName: AGENT_NAMES[agentId],
    pair,
    decision,
    confidence: parseFloat((Math.random() * 25 + 65).toFixed(1)),
    outcome,
    pnl,
    pnlPercent,
    txHash: generateTxHash(),
    blockNumber: generateBlockNumber(),
    timestamp: Date.now() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 3600000,
    humanDecision,
    humanPnl,
    reasoning,
    aiColor: AGENT_COLORS[agentId],
  };
}

export const MOCK_LEDGER: LedgerEntry[] = Array.from({ length: 40 }, (_, i) =>
  generateEntry(i * 0.3)
).sort((a, b) => b.timestamp - a.timestamp);

export const LIVE_STATS = {
  totalDecisions: 284719,
  activeChallenges: 847,
  aiWinRate: 73.2,
  humanWinRate: 26.8,
  totalVolume: 4200000,
  totalPnl: 127340,
};
