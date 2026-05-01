"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Activity,
  X,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
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
import type { Agent } from "@/types";
import { cn } from "@/lib/utils";

function RiskBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-mono text-[#94a3b8] w-8">{score}/10</span>
    </div>
  );
}

function WinRateArc({ rate, color }: { rate: number; color: string }) {
  const circumference = 2 * Math.PI * 28;
  const progress = (rate / 100) * circumference;
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle
          cx="40"
          cy="40"
          r="28"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <span className="text-base font-bold font-mono" style={{ color }}>
        {rate}%
      </span>
    </div>
  );
}

function AgentCard({ agent, onSelect, isSelected }: {
  agent: Agent;
  onSelect: (a: Agent) => void;
  isSelected: boolean;
}) {
  const lastPerf = agent.performance;
  const chartData = lastPerf.slice(-15);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4 }}
      id={agent.id}
      onClick={() => onSelect(agent)}
      className={cn(
        "glass-card-hover p-6 cursor-pointer flex flex-col gap-4 transition-all duration-300",
        isSelected && "ring-1",
      )}
      style={{
        borderColor: isSelected ? `${agent.color}40` : undefined,
        boxShadow: isSelected ? `0 0 30px ${agent.color}15` : undefined,
        ...(isSelected ? { ["--tw-ring-color" as string]: `${agent.color}60` } : {}),
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-lg font-bold tracking-widest"
              style={{ color: agent.color }}
            >
              {agent.name}
            </span>
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                agent.status === "active" ? "animate-pulse" : "opacity-50"
              )}
              style={{
                backgroundColor: agent.color,
                boxShadow: agent.status === "active" ? `0 0 8px ${agent.color}` : "none",
              }}
            />
          </div>
          <div className="text-xs text-[#94a3b8]">{agent.strategy}</div>
        </div>
        <WinRateArc rate={agent.winRate} color={agent.color} />
      </div>

      {/* Mini chart */}
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${agent.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={agent.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={agent.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={agent.color}
              strokeWidth={2}
              fill={`url(#grad-${agent.id})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Avg Return", value: `+${agent.avgReturn}%`, positive: true },
          { label: "Sharpe", value: agent.sharpeRatio.toFixed(2), positive: true },
          { label: "Max DD", value: `${agent.maxDrawdown}%`, positive: false },
          { label: "Trades", value: agent.totalTrades.toLocaleString(), positive: true },
        ].map((stat) => (
          <div key={stat.label} className="p-2 rounded-lg bg-white/[0.03]">
            <div className="text-xs text-[#475569] mb-0.5">{stat.label}</div>
            <div
              className={cn(
                "text-sm font-mono font-semibold",
                stat.positive ? "text-white" : "text-[#ff3366]"
              )}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Risk bar */}
      <div>
        <div className="text-xs text-[#475569] mb-1.5">Risk Score</div>
        <RiskBar score={agent.riskScore} color={agent.color} />
      </div>

      {/* Strengths */}
      <div className="flex flex-wrap gap-1.5">
        {agent.strengths.map((s) => (
          <span
            key={s}
            className="text-xs px-2 py-0.5 rounded-full border font-medium"
            style={{ borderColor: `${agent.color}30`, color: agent.color, backgroundColor: `${agent.color}10` }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/challenge"
        onClick={(e) => e.stopPropagation()}
        className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border"
        style={{
          borderColor: `${agent.color}30`,
          color: agent.color,
          backgroundColor: `${agent.color}10`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = `${agent.color}20`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = `${agent.color}10`;
        }}
      >
        Challenge {agent.name}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

function AgentDetailPanel({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      className="sticky top-24 glass-card p-6 flex flex-col gap-6"
      style={{ borderColor: `${agent.color}20` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-2xl font-bold tracking-widest" style={{ color: agent.color }}>
            {agent.name}
          </span>
          <div className="text-sm text-[#94a3b8] mt-1">{agent.tagline}</div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/[0.05] transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-[#94a3b8] leading-relaxed">{agent.description}</p>

      {/* Radar chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={agent.radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.06)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
            />
            <Radar
              name={agent.name}
              dataKey="value"
              stroke={agent.color}
              fill={agent.color}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Full performance chart */}
      <div>
        <div className="text-xs text-[#475569] uppercase tracking-wider mb-2 font-mono">
          30-Day Performance
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={agent.performance}>
              <defs>
                <linearGradient id={`detail-grad-${agent.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={agent.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={agent.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  background: "#0a1020",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#94a3b8" }}
                itemStyle={{ color: agent.color }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={agent.color}
                strokeWidth={2}
                fill={`url(#detail-grad-${agent.id})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-[#ff3366]/5 border border-[#ff3366]/15">
        <div className="text-xs text-[#ff3366] font-semibold mb-1">Known Weakness</div>
        <div className="text-xs text-[#94a3b8]">{agent.weakness}</div>
      </div>

      <Link href="/challenge">
        <button
          className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${agent.color}CC, ${agent.color}99)`,
            color: "#020917",
          }}
        >
          Challenge {agent.name} Now
          <ArrowRight className="w-4 h-4" />
        </button>
      </Link>
    </motion.div>
  );
}

export default function ArenaPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [sortBy, setSortBy] = useState<"winRate" | "sharpe" | "risk">("winRate");

  const sorted = [...AGENTS].sort((a, b) => {
    if (sortBy === "winRate") return b.winRate - a.winRate;
    if (sortBy === "sharpe") return b.sharpeRatio - a.sharpeRatio;
    return a.riskScore - b.riskScore;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 text-xs font-mono text-[#00d4ff]/70 tracking-widest uppercase mb-3">
          <Activity className="w-3 h-3" />
          Agent Arena
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              Your <span className="text-gradient-verdict">Opponents</span>
            </h1>
            <p className="text-[#94a3b8]">
              Five AI agents. Different strategies. One goal: outperform you.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#475569] font-mono">Sort:</span>
            {(["winRate", "sharpe", "risk"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setSortBy(opt)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  sortBy === opt
                    ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20"
                    : "text-[#94a3b8] hover:text-white border border-transparent hover:border-white/10"
                )}
              >
                {opt === "winRate" ? "Win Rate" : opt === "sharpe" ? "Sharpe" : "Low Risk"}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className={cn("grid gap-6", selectedAgent ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5")}>
        <div className={cn("grid gap-6", selectedAgent ? "lg:col-span-2 grid-cols-1 sm:grid-cols-2" : "contents")}>
          {sorted.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onSelect={setSelectedAgent}
              isSelected={selectedAgent?.id === agent.id}
            />
          ))}
        </div>

        <AnimatePresence>
          {selectedAgent && (
            <AgentDetailPanel
              agent={selectedAgent}
              onClose={() => setSelectedAgent(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-16 glass-card p-6"
      >
        <div className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#00d4ff]" />
          Agent Comparison Matrix
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Agent", "Strategy", "Win Rate", "Avg Return", "Sharpe", "Max DD", "Risk", "Status"].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-mono text-[#475569] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AGENTS.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <td className="py-3 px-3">
                    <span className="font-bold font-mono text-sm" style={{ color: agent.color }}>
                      {agent.name}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#94a3b8] text-xs whitespace-nowrap">{agent.strategy}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-[#00ff9d]">{agent.winRate}%</td>
                  <td className="py-3 px-3 font-mono text-[#00ff9d]">+{agent.avgReturn}%</td>
                  <td className="py-3 px-3 font-mono text-white">{agent.sharpeRatio}</td>
                  <td className="py-3 px-3 font-mono text-[#ff3366]">{agent.maxDrawdown}%</td>
                  <td className="py-3 px-3">
                    <RiskBar score={agent.riskScore} color={agent.color} />
                  </td>
                  <td className="py-3 px-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-mono",
                      agent.status === "active"
                        ? "bg-[#00ff9d]/10 text-[#00ff9d]"
                        : "bg-[#fbbf24]/10 text-[#fbbf24]"
                    )}>
                      {agent.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
