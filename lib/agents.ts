import type { Agent, PerformancePoint } from "@/types";

// Each agent quote is displayed prominently — they are characters, not scripts
export const AGENT_QUOTES: Record<string, string> = {
  oracle: "I have analyzed 2.3 billion candles. I already know what you're going to do.",
  rift:   "Every market has cracks. I live in them.",
  pulse:  "Trends don't lie. Traders do.",
  nova:   "Fear is information. Greed is just louder.",
  cipher: "The pattern was there 600 years ago. You just couldn't see it.",
};

function generatePerformance(
  baseline: number,
  volatility: number,
  trend: number,
  points = 30
): PerformancePoint[] {
  let value = baseline;
  let cumPnl = 0;
  const data: PerformancePoint[] = [];
  const now = Date.now();

  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.48 + trend * 0.02) * volatility;
    value = Math.max(0, value + change);
    cumPnl += change;
    const date = new Date(now - (points - i) * 24 * 60 * 60 * 1000);
    data.push({
      time: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: parseFloat(value.toFixed(2)),
      pnl: parseFloat(cumPnl.toFixed(2)),
    });
  }
  return data;
}

export const AGENTS: Agent[] = [
  {
    id: "oracle",
    name: "ORACLE",
    tagline: "The Quantitative Mastermind",
    strategy: "High-Frequency Quantitative",
    winRate: 78.4,
    riskScore: 6.2,
    avgReturn: 4.7,
    totalTrades: 12847,
    sharpeRatio: 2.34,
    maxDrawdown: -8.2,
    color: "#00d4ff",
    glowClass: "shadow-glow-blue",
    borderClass: "border-cyan-dim",
    description:
      "Oracle deploys statistical arbitrage and mean-reversion across 40+ indicators simultaneously. It never sleeps, never doubts, and has processed more market data in a week than most traders see in a lifetime.",
    strengths: ["Pattern Recognition", "Speed", "Risk-Adjusted Returns"],
    weakness: "Choppy Sideways Markets",
    status: "active",
    performance: generatePerformance(100, 3, 1.2),
    radarData: [
      { subject: "Speed", value: 95, fullMark: 100 },
      { subject: "Accuracy", value: 82, fullMark: 100 },
      { subject: "Risk Mgmt", value: 70, fullMark: 100 },
      { subject: "Adaptability", value: 65, fullMark: 100 },
      { subject: "Consistency", value: 88, fullMark: 100 },
      { subject: "Alpha Gen", value: 78, fullMark: 100 },
    ],
  },
  {
    id: "rift",
    name: "RIFT",
    tagline: "The Arbitrage Hunter",
    strategy: "Cross-Market Arbitrage",
    winRate: 71.2,
    riskScore: 4.1,
    avgReturn: 2.9,
    totalTrades: 8234,
    sharpeRatio: 3.12,
    maxDrawdown: -3.8,
    color: "#7c3aed",
    glowClass: "shadow-glow-violet",
    borderClass: "border-violet-dim",
    description:
      "Rift exploits price discrepancies across exchanges and correlated assets with surgical precision. Low risk, consistent returns — the machine that grinds markets for inefficiencies.",
    strengths: ["Low Drawdown", "Sharpe Ratio", "Consistency"],
    weakness: "Low Volatility Regimes",
    status: "analyzing",
    performance: generatePerformance(100, 1.8, 0.9),
    radarData: [
      { subject: "Speed", value: 88, fullMark: 100 },
      { subject: "Accuracy", value: 74, fullMark: 100 },
      { subject: "Risk Mgmt", value: 92, fullMark: 100 },
      { subject: "Adaptability", value: 58, fullMark: 100 },
      { subject: "Consistency", value: 94, fullMark: 100 },
      { subject: "Alpha Gen", value: 62, fullMark: 100 },
    ],
  },
  {
    id: "pulse",
    name: "PULSE",
    tagline: "The Momentum Rider",
    strategy: "Momentum & Trend Following",
    winRate: 65.8,
    riskScore: 7.9,
    avgReturn: 6.2,
    totalTrades: 4521,
    sharpeRatio: 1.67,
    maxDrawdown: -14.3,
    color: "#00ff9d",
    glowClass: "shadow-glow-green",
    borderClass: "border-green-400/20",
    description:
      "Pulse surfs market momentum with aggressive position sizing. When trends run, Pulse captures outsized returns. The highest ceiling, the widest swings — built for those who want to feel the market breathe.",
    strengths: ["Bull Markets", "Trend Capture", "High Returns"],
    weakness: "Market Reversals",
    status: "active",
    performance: generatePerformance(100, 5, 0.8),
    radarData: [
      { subject: "Speed", value: 72, fullMark: 100 },
      { subject: "Accuracy", value: 68, fullMark: 100 },
      { subject: "Risk Mgmt", value: 52, fullMark: 100 },
      { subject: "Adaptability", value: 76, fullMark: 100 },
      { subject: "Consistency", value: 64, fullMark: 100 },
      { subject: "Alpha Gen", value: 88, fullMark: 100 },
    ],
  },
  {
    id: "nova",
    name: "NOVA",
    tagline: "The Sentiment Oracle",
    strategy: "NLP Sentiment Analysis",
    winRate: 69.3,
    riskScore: 5.5,
    avgReturn: 3.8,
    totalTrades: 6102,
    sharpeRatio: 1.98,
    maxDrawdown: -10.1,
    color: "#fbbf24",
    glowClass: "shadow-[0_0_20px_rgba(251,191,36,0.3)]",
    borderClass: "border-amber-400/20",
    description:
      "Nova reads the collective human psyche — social media, news, on-chain sentiment — and translates emotion into edge. When fear and greed reach extremes, Nova is already positioned.",
    strengths: ["News Events", "Sentiment Shifts", "Contrarian Calls"],
    weakness: "Technical Breakouts",
    status: "active",
    performance: generatePerformance(100, 2.5, 1.0),
    radarData: [
      { subject: "Speed", value: 60, fullMark: 100 },
      { subject: "Accuracy", value: 72, fullMark: 100 },
      { subject: "Risk Mgmt", value: 78, fullMark: 100 },
      { subject: "Adaptability", value: 85, fullMark: 100 },
      { subject: "Consistency", value: 70, fullMark: 100 },
      { subject: "Alpha Gen", value: 72, fullMark: 100 },
    ],
  },
  {
    id: "cipher",
    name: "CIPHER",
    tagline: "The ML Pattern Hunter",
    strategy: "Deep Learning Pattern Recognition",
    winRate: 82.1,
    riskScore: 7.1,
    avgReturn: 5.4,
    totalTrades: 9876,
    sharpeRatio: 2.71,
    maxDrawdown: -11.5,
    color: "#ff3366",
    glowClass: "shadow-glow-red",
    borderClass: "border-red-400/20",
    description:
      "Cipher identifies fractal price patterns invisible to human perception using 47-layer neural networks trained on decade-scale data. The most accurate agent — and the most dangerous opponent.",
    strengths: ["Pattern Recognition", "Accuracy", "Multi-Timeframe Analysis"],
    weakness: "Black Swan Events",
    status: "active",
    performance: generatePerformance(100, 3.5, 1.4),
    radarData: [
      { subject: "Speed", value: 78, fullMark: 100 },
      { subject: "Accuracy", value: 92, fullMark: 100 },
      { subject: "Risk Mgmt", value: 68, fullMark: 100 },
      { subject: "Adaptability", value: 80, fullMark: 100 },
      { subject: "Consistency", value: 82, fullMark: 100 },
      { subject: "Alpha Gen", value: 86, fullMark: 100 },
    ],
  },
];

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}
