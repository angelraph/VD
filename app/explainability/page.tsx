"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  ChevronRight,
  Eye,
  BarChart3,
  Shield,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { AGENTS } from "@/lib/agents";
import { MOCK_LEDGER } from "@/lib/mockData";
import type { Agent, LedgerEntry } from "@/types";
import { cn, formatPnl, formatAddress } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const REASONING_FACTORS: Record<string, { label: string; indicators: string[] }> = {
  oracle: {
    label: "Quantitative Signals",
    indicators: [
      "RSI Divergence",
      "MACD Histogram",
      "Volume Profile",
      "Order Flow Imbalance",
      "Statistical Edge",
      "Mean Reversion Signal",
    ],
  },
  rift: {
    label: "Arbitrage Signals",
    indicators: [
      "Price Discrepancy",
      "Funding Rate",
      "Basis Spread",
      "Cross-Exchange Delta",
      "Execution Window",
      "Slippage Estimate",
    ],
  },
  pulse: {
    label: "Momentum Signals",
    indicators: [
      "Trend Strength",
      "Breakout Confirmation",
      "Momentum Score",
      "ATR Multiplier",
      "Volume Surge",
      "Continuation Pattern",
    ],
  },
  nova: {
    label: "Sentiment Signals",
    indicators: [
      "Fear/Greed Index",
      "Social Velocity",
      "News Sentiment",
      "On-chain Accumulation",
      "Whale Activity",
      "Retail Flow",
    ],
  },
  cipher: {
    label: "Pattern Signals",
    indicators: [
      "Fractal Match Score",
      "Neural Confidence",
      "Temporal Alignment",
      "Pattern Similarity",
      "Historical Context",
      "Multi-TF Confluence",
    ],
  },
};

function FactorBar({ label, value, color, delay }: {
  label: string; value: number; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3"
    >
      <span className="text-xs text-[#94a3b8] w-36 flex-shrink-0 text-right">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-mono text-[#94a3b8] w-8">{value}%</span>
    </motion.div>
  );
}

function DecisionCard({ entry, selected, onClick }: {
  entry: LedgerEntry; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl border transition-all duration-200",
        selected
          ? "border-[#00d4ff]/30 bg-[#00d4ff]/05"
          : "border-white/[0.06] hover:border-white/10 hover:bg-white/[0.02]"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-bold" style={{ color: entry.aiColor }}>
          {entry.agentName}
        </span>
        <span className={cn(
          "text-[10px] px-2 py-0.5 rounded-full font-mono",
          entry.outcome === "win" ? "bg-[#00ff9d]/10 text-[#00ff9d]" :
          entry.outcome === "loss" ? "bg-[#ff3366]/10 text-[#ff3366]" :
          "bg-[#fbbf24]/10 text-[#fbbf24]"
        )}>
          {entry.outcome}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-white/80 font-mono">{entry.pair}</span>
        <span className="text-[#475569]">·</span>
        <span className={cn(
          "font-mono font-semibold",
          entry.decision === "BUY" ? "text-[#00ff9d]" :
          entry.decision === "SELL" ? "text-[#ff3366]" : "text-[#fbbf24]"
        )}>
          {entry.decision}
        </span>
        <span className="ml-auto font-mono" style={{
          color: entry.pnlPercent >= 0 ? "#00ff9d" : "#ff3366"
        }}>
          {formatPnl(entry.pnlPercent)}
        </span>
      </div>
      <div className="text-[10px] text-[#475569] mt-1.5">
        {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
      </div>
    </button>
  );
}

export default function ExplainabilityPage() {
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry>(MOCK_LEDGER[0]);
  const agent = AGENTS.find((a) => a.id === selectedEntry.agentId) || AGENTS[0];
  const factors = REASONING_FACTORS[selectedEntry.agentId] || REASONING_FACTORS.oracle;

  const indicatorValues = factors.indicators.map((label) => ({
    label,
    value: Math.floor(Math.random() * 40 + 50),
  }));

  const signalData = [
    { name: "Bullish", value: Math.floor(Math.random() * 30 + 45), fill: "#00ff9d" },
    { name: "Neutral", value: Math.floor(Math.random() * 20 + 15), fill: "#fbbf24" },
    { name: "Bearish", value: Math.floor(Math.random() * 20 + 10), fill: "#ff3366" },
  ];

  const recentEntries = MOCK_LEDGER.slice(0, 12);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#fbbf24]/70 tracking-widest uppercase mb-3">
          <Brain className="w-3 h-3" />
          Explainability Panel
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white">
          Inside the <span className="text-gradient-verdict">Machine Mind</span>
        </h1>
        <p className="text-[#94a3b8] mt-2">
          Every AI decision decoded. See exactly why the machine made each call.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Decision selector */}
        <div className="lg:col-span-1">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-sm font-semibold text-white">Recent Decisions</span>
            </div>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {recentEntries.map((entry) => (
                <DecisionCard
                  key={entry.id}
                  entry={entry}
                  selected={selectedEntry.id === entry.id}
                  onClick={() => setSelectedEntry(entry)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Analysis panel */}
        <div className="lg:col-span-2 space-y-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedEntry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Decision header */}
              <div
                className="glass-card p-5 border"
                style={{ borderColor: `${agent.color}20` }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl font-bold font-mono tracking-widest" style={{ color: agent.color }}>
                        {agent.name}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-mono",
                        selectedEntry.outcome === "win" ? "bg-[#00ff9d]/10 text-[#00ff9d]" :
                        selectedEntry.outcome === "loss" ? "bg-[#ff3366]/10 text-[#ff3366]" :
                        "bg-[#fbbf24]/10 text-[#fbbf24]"
                      )}>
                        {selectedEntry.outcome.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-white font-mono">{selectedEntry.pair}</span>
                      <span
                        className={cn(
                          "font-bold font-mono",
                          selectedEntry.decision === "BUY" ? "text-[#00ff9d]" :
                          selectedEntry.decision === "SELL" ? "text-[#ff3366]" : "text-[#fbbf24]"
                        )}
                      >
                        {selectedEntry.decision}
                      </span>
                      <span className="text-[#475569]">{agent.strategy}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        "text-2xl font-bold font-mono",
                        selectedEntry.pnlPercent >= 0 ? "text-[#00ff9d]" : "text-[#ff3366]"
                      )}
                    >
                      {formatPnl(selectedEntry.pnlPercent)}
                    </div>
                    <div className="text-xs text-[#475569] font-mono">
                      Confidence: {selectedEntry.confidence.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Primary reasoning */}
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-2">
                    Primary Reasoning
                  </div>
                  <p className="text-sm text-[#94a3b8] leading-relaxed">{selectedEntry.reasoning}</p>
                </div>
              </div>

              {/* Signal breakdown */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 className="w-4 h-4" style={{ color: agent.color }} />
                  <span className="text-sm font-semibold text-white">{factors.label}</span>
                </div>
                <div className="space-y-3">
                  {indicatorValues.map((indicator, i) => (
                    <FactorBar
                      key={indicator.label}
                      label={indicator.label}
                      value={indicator.value}
                      color={agent.color}
                      delay={i * 0.06}
                    />
                  ))}
                </div>
              </div>

              {/* Signal distribution + Radar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="glass-card p-5">
                  <div className="text-xs font-mono text-[#94a3b8] uppercase tracking-wider mb-4">
                    Signal Distribution
                  </div>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={signalData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ background: "#0a1020", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                          cursor={{ fill: "rgba(255,255,255,0.03)" }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {signalData.map((entry, i) => (
                            <rect key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-5">
                  <div className="text-xs font-mono text-[#94a3b8] uppercase tracking-wider mb-2">
                    Agent Profile
                  </div>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={agent.radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 8 }} />
                        <Radar
                          dataKey="value"
                          stroke={agent.color}
                          fill={agent.color}
                          fillOpacity={0.15}
                          strokeWidth={1.5}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Context window */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-[#7c3aed]" />
                  <span className="text-sm font-semibold text-white">Decision Context</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Signals Analyzed", value: `${Math.floor(Math.random() * 20 + 35)}` },
                    { label: "Time to Decision", value: `${(Math.random() * 2 + 0.5).toFixed(1)}s` },
                    { label: "Similar Patterns", value: `${Math.floor(Math.random() * 400 + 500)}` },
                    { label: "Model Version", value: `v${Math.floor(Math.random() * 3 + 2)}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 9)}` },
                    { label: "Block at Decision", value: `#${selectedEntry.blockNumber - 3}` },
                    { label: "On-chain Proof", value: formatAddress(selectedEntry.txHash) },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="text-[10px] text-[#475569] uppercase tracking-wider mb-1">{item.label}</div>
                      <div className="text-xs font-mono text-[#94a3b8]">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* On-chain verification */}
              <div className="glass-card p-4 border-[#00d4ff]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#00d4ff]" />
                    <span className="text-sm text-white">Verified on Mantle</span>
                  </div>
                  <a
                    href={`https://explorer.sepolia.mantle.xyz/tx/${selectedEntry.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-mono text-[#00d4ff] hover:text-white transition-colors"
                  >
                    {selectedEntry.txHash.slice(0, 18)}...
                    <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
