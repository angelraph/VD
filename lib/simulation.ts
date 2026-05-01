import type {
  Agent,
  Decision,
  Duration,
  RiskProfile,
  TradingPair,
  ChallengeResult,
  SimulationStep,
  ThinkingStep,
} from "@/types";
import { generateTxHash, generateBlockNumber, randomBetween } from "@/lib/utils";

const BASE_PRICES: Record<TradingPair, number> = {
  "ETH/USDT": 3247.82,
  "BTC/USDT": 61432.15,
  "MNT/USDT": 1.24,
  "ARB/USDT": 1.18,
  "LINK/USDT": 14.73,
};

const DURATION_MULTIPLIER: Record<Duration, number> = {
  "1m": 0.3,
  "5m": 0.7,
  "15m": 1.0,
  "1h": 1.8,
};

const RISK_MULTIPLIER: Record<RiskProfile, number> = {
  conservative: 0.5,
  balanced: 1.0,
  aggressive: 2.0,
};

function getDecisionMultiplier(decision: Decision): number {
  if (decision === "BUY") return 1;
  if (decision === "SELL") return -1;
  return 0.1;
}

function generatePricePath(
  basePrice: number,
  duration: Duration,
  trend: number,
  volatility: number,
  points = 40
): number[] {
  const prices: number[] = [basePrice];
  for (let i = 1; i < points; i++) {
    const noise = (Math.random() - 0.5) * volatility;
    const drift = trend * 0.001;
    const newPrice = prices[i - 1] * (1 + drift + noise);
    prices.push(parseFloat(newPrice.toFixed(4)));
  }
  return prices;
}

export function generateThinkingSteps(agent: Agent, pair: TradingPair): ThinkingStep[] {
  return [
    {
      label: `Loading ${pair} market data`,
      detail: "Fetching 2,847 historical candles...",
      duration: 600,
    },
    {
      label: "Scanning order book depth",
      detail: `Bid/ask spread analysis across ${Math.floor(Math.random() * 8 + 4)} exchanges`,
      duration: 700,
    },
    {
      label: "Cross-referencing patterns",
      detail: `Found ${Math.floor(Math.random() * 200 + 600)} similar setups in training data`,
      duration: 900,
    },
    {
      label: "Computing risk parameters",
      detail: `Risk score: ${agent.riskScore.toFixed(1)}/10 — ${
        agent.riskScore > 7 ? "ELEVATED" : agent.riskScore > 5 ? "MODERATE" : "LOW"
      }`,
      duration: 500,
    },
    {
      label: "Running sentiment analysis",
      detail: `Sentiment index: ${(Math.random() * 0.4 + 0.5).toFixed(2)} — ${
        Math.random() > 0.5 ? "BULLISH" : "CAUTIOUSLY BULLISH"
      }`,
      duration: 800,
    },
    {
      label: "Finalizing decision",
      detail: `Confidence threshold: ${(Math.random() * 15 + 70).toFixed(1)}% achieved`,
      duration: 600,
    },
  ];
}

export function computeAiDecision(
  agent: Agent,
  pair: TradingPair,
  risk: RiskProfile
): Decision {
  const r = Math.random();
  const winBias = agent.winRate / 100;
  if (r < winBias * 0.7) return "BUY";
  if (r < winBias * 0.85) return "SELL";
  return "HOLD";
}

export function generateReasoningLines(
  agent: Agent,
  decision: Decision,
  pair: TradingPair
): string[] {
  const decisionWord = decision === "BUY" ? "long" : decision === "SELL" ? "short" : "neutral";
  return [
    `RSI(14) reading ${(Math.random() * 20 + 45).toFixed(1)} — momentum ${
      decision === "BUY" ? "building" : "fading"
    }`,
    `MACD histogram shows ${decision === "BUY" ? "bullish" : "bearish"} divergence on the 4H chart`,
    `Volume spike detected — ${(Math.random() * 40 + 20).toFixed(0)}% above 20-day average`,
    `${(Math.random() * 4 + 2).toFixed(0)} of 6 technical indicators align for ${decisionWord} position`,
    `On-chain data: exchange outflows trending ${decision === "BUY" ? "up" : "down"} for 3 days`,
    `Risk/reward ratio: ${(Math.random() * 1.5 + 1.8).toFixed(1)}:1 — above ${agent.name}'s threshold of 1.5:1`,
    `Executing ${decision} on ${pair} with ${
      agent.riskScore > 6 ? "full" : "half"
    } position size`,
  ];
}

export function runSimulation(
  agent: Agent,
  pair: TradingPair,
  humanDecision: Decision,
  aiDecision: Decision,
  duration: Duration,
  risk: RiskProfile
): ChallengeResult {
  const basePrice = BASE_PRICES[pair];
  const dMult = DURATION_MULTIPLIER[duration];
  const rMult = RISK_MULTIPLIER[risk];
  const volatility = 0.008 * dMult * rMult;

  const trendDirection = Math.random() > 0.5 ? 1 : -1;
  const trendStrength = randomBetween(0.3, 1.5);
  const prices = generatePricePath(basePrice, duration, trendDirection * trendStrength, volatility);

  const priceChange = (prices[prices.length - 1] - prices[0]) / prices[0];

  const humanMult = getDecisionMultiplier(humanDecision);
  const aiMult = getDecisionMultiplier(aiDecision);

  const humanReturn = parseFloat((priceChange * humanMult * 100 * rMult).toFixed(2));
  const aiReturn = parseFloat(
    (priceChange * aiMult * 100 * rMult * (agent.winRate / 65)).toFixed(2)
  );

  const simulationData: SimulationStep[] = prices.map((price, i) => {
    const pChange = (price - prices[0]) / prices[0];
    return {
      time: i,
      price,
      humanPnl: parseFloat((pChange * humanMult * 100 * rMult).toFixed(3)),
      aiPnl: parseFloat((pChange * aiMult * 100 * rMult * (agent.winRate / 65)).toFixed(3)),
    };
  });

  let winner: "human" | "ai" | "tie";
  if (Math.abs(humanReturn - aiReturn) < 0.1) winner = "tie";
  else if (humanReturn > aiReturn) winner = "human";
  else winner = "ai";

  const verdictScore = Math.min(
    100,
    Math.max(0, 50 + (aiReturn - humanReturn) * 5)
  );

  return {
    humanDecision,
    aiDecision,
    humanReturn,
    aiReturn,
    winner,
    verdictScore: parseFloat(verdictScore.toFixed(1)),
    txHash: generateTxHash(),
    blockNumber: generateBlockNumber(),
    reasoning: generateReasoningLines(agent, aiDecision, pair),
    simulationData,
  };
}
