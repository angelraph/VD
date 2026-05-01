export type AgentId = "oracle" | "rift" | "pulse" | "nova" | "cipher";

export interface PerformancePoint {
  time: string;
  value: number;
  pnl: number;
}

export interface Agent {
  id: AgentId;
  name: string;
  tagline: string;
  strategy: string;
  winRate: number;
  riskScore: number;
  avgReturn: number;
  totalTrades: number;
  sharpeRatio: number;
  maxDrawdown: number;
  color: string;
  glowClass: string;
  borderClass: string;
  description: string;
  strengths: string[];
  weakness: string;
  status: "active" | "idle" | "analyzing";
  performance: PerformancePoint[];
  radarData: RadarPoint[];
}

export interface RadarPoint {
  subject: string;
  value: number;
  fullMark: number;
}

export type TradingPair = "ETH/USDT" | "BTC/USDT" | "MNT/USDT" | "ARB/USDT" | "LINK/USDT";
export type RiskProfile = "conservative" | "balanced" | "aggressive";
export type Duration = "1m" | "5m" | "15m" | "1h";
export type Decision = "BUY" | "SELL" | "HOLD";
export type ChallengePhase = "setup" | "decision" | "ai-thinking" | "simulation" | "verdict";

export interface SimulationStep {
  time: number;
  price: number;
  humanPnl: number;
  aiPnl: number;
}

export interface ChallengeResult {
  humanDecision: Decision;
  aiDecision: Decision;
  humanReturn: number;
  aiReturn: number;
  winner: "human" | "ai" | "tie";
  verdictScore: number;
  txHash: string;
  blockNumber: number;
  reasoning: string[];
  simulationData: SimulationStep[];
}

export interface LedgerEntry {
  id: string;
  agentId: AgentId;
  agentName: string;
  pair: TradingPair;
  decision: Decision;
  confidence: number;
  outcome: "win" | "loss" | "pending";
  pnl: number;
  pnlPercent: number;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  humanDecision?: Decision;
  humanPnl?: number;
  reasoning: string;
  aiColor: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: string;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

export interface ThinkingStep {
  label: string;
  detail: string;
  duration: number;
}
