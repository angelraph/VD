"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Activity,
  ChevronDown,
} from "lucide-react";
import { MOCK_LEDGER } from "@/lib/mockData";
import { getMantleExplorerUrl } from "@/lib/mantle";
import type { LedgerEntry, AgentId } from "@/types";
import { cn, formatPnl, formatAddress } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const AGENT_OPTIONS = ["ALL", "ORACLE", "RIFT", "PULSE", "NOVA", "CIPHER"] as const;
const OUTCOME_OPTIONS = ["ALL", "win", "loss", "pending"] as const;

function DecisionIcon({ decision }: { decision: string }) {
  if (decision === "BUY") return <TrendingUp className="w-3.5 h-3.5 text-[#00ff9d]" />;
  if (decision === "SELL") return <TrendingDown className="w-3.5 h-3.5 text-[#ff3366]" />;
  return <Minus className="w-3.5 h-3.5 text-[#fbbf24]" />;
}

function LedgerRow({ entry, index }: { entry: LedgerEntry; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.3 }}
        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Block */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: `${entry.aiColor}40` }} />
            <div>
              <div className="text-xs font-mono text-[#94a3b8]">#{entry.blockNumber}</div>
              <div className="text-[10px] text-[#475569]">
                {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
              </div>
            </div>
          </div>
        </td>

        {/* Agent */}
        <td className="py-3 px-4">
          <span
            className="text-xs font-bold font-mono tracking-wider"
            style={{ color: entry.aiColor }}
          >
            {entry.agentName}
          </span>
        </td>

        {/* Pair */}
        <td className="py-3 px-4">
          <span className="text-sm font-mono text-white/80">{entry.pair}</span>
        </td>

        {/* AI Decision */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-1.5">
            <DecisionIcon decision={entry.decision} />
            <span className={cn(
              "text-xs font-mono font-semibold",
              entry.decision === "BUY" ? "text-[#00ff9d]" :
              entry.decision === "SELL" ? "text-[#ff3366]" : "text-[#fbbf24]"
            )}>
              {entry.decision}
            </span>
          </div>
        </td>

        {/* Human Decision */}
        <td className="py-3 px-4">
          {entry.humanDecision ? (
            <div className="flex items-center gap-1.5">
              <DecisionIcon decision={entry.humanDecision} />
              <span className={cn(
                "text-xs font-mono font-semibold opacity-70",
                entry.humanDecision === "BUY" ? "text-[#00ff9d]" :
                entry.humanDecision === "SELL" ? "text-[#ff3366]" : "text-[#fbbf24]"
              )}>
                {entry.humanDecision}
              </span>
            </div>
          ) : <span className="text-[#475569] text-xs">—</span>}
        </td>

        {/* P&L */}
        <td className="py-3 px-4">
          <div>
            <div className={cn(
              "text-sm font-bold font-mono",
              entry.pnlPercent >= 0 ? "text-[#00ff9d]" : "text-[#ff3366]"
            )}>
              {formatPnl(entry.pnlPercent)}
            </div>
            {entry.humanPnl !== undefined && (
              <div className={cn(
                "text-[10px] font-mono opacity-60",
                entry.humanPnl >= 0 ? "text-[#00ff9d]" : "text-[#ff3366]"
              )}>
                H: {formatPnl(entry.humanPnl)}
              </div>
            )}
          </div>
        </td>

        {/* Outcome */}
        <td className="py-3 px-4">
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold",
            entry.outcome === "win" ? "bg-[#00ff9d]/10 text-[#00ff9d]" :
            entry.outcome === "loss" ? "bg-[#ff3366]/10 text-[#ff3366]" :
            "bg-[#fbbf24]/10 text-[#fbbf24]"
          )}>
            {entry.outcome}
          </span>
        </td>

        {/* Confidence */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${entry.confidence}%`,
                  backgroundColor: entry.aiColor,
                }}
              />
            </div>
            <span className="text-xs font-mono text-[#94a3b8]">{entry.confidence.toFixed(0)}%</span>
          </div>
        </td>

        {/* Tx */}
        <td className="py-3 px-4">
          <a
            href={getMantleExplorerUrl(entry.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs font-mono text-[#94a3b8] hover:text-[#00d4ff] transition-colors"
          >
            {formatAddress(entry.txHash)}
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </td>

        <td className="py-3 px-4">
          <ChevronDown className={cn("w-3.5 h-3.5 text-[#475569] transition-transform duration-200", expanded && "rotate-180")} />
        </td>
      </motion.tr>

      {/* Expanded reasoning */}
      {expanded && (
        <tr className="border-b border-white/[0.04]">
          <td colSpan={10} className="px-4 pb-4 pt-0">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] ml-7"
            >
              <div className="flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-[#94a3b8] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-1">
                    AI Reasoning
                  </div>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">{entry.reasoning}</p>
                </div>
              </div>
            </motion.div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function LedgerPage() {
  const [agentFilter, setAgentFilter] = useState<string>("ALL");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return MOCK_LEDGER.filter((e) => {
      const agentMatch = agentFilter === "ALL" || e.agentName === agentFilter;
      const outcomeMatch = outcomeFilter === "ALL" || e.outcome === outcomeFilter;
      return agentMatch && outcomeMatch;
    });
  }, [agentFilter, outcomeFilter]);

  const stats = useMemo(() => {
    const wins = MOCK_LEDGER.filter((e) => e.outcome === "win").length;
    const total = MOCK_LEDGER.length;
    const totalPnl = MOCK_LEDGER.reduce((acc, e) => acc + e.pnlPercent, 0);
    return {
      total,
      wins,
      winRate: ((wins / total) * 100).toFixed(1),
      avgPnl: (totalPnl / total).toFixed(2),
    };
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00ff9d]/70 tracking-widest uppercase mb-3">
          <Shield className="w-3 h-3" />
          Reputation Ledger
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white">
          On-Chain <span className="text-gradient-verdict">Decision Log</span>
        </h1>
        <p className="text-[#94a3b8] mt-2">
          Every decision recorded. Every outcome immortalized. Verified on Mantle.
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Decisions", value: stats.total.toString(), color: "#00d4ff" },
          { label: "AI Wins", value: stats.wins.toString(), color: "#00ff9d" },
          { label: "Win Rate", value: `${stats.winRate}%`, color: "#7c3aed" },
          { label: "Avg Return", value: `${parseFloat(stats.avgPnl) >= 0 ? "+" : ""}${stats.avgPnl}%`, color: "#fbbf24" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4"
          >
            <div className="text-2xl font-bold font-mono mb-1" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-xs text-[#94a3b8] uppercase tracking-wider">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5 text-xs text-[#475569] font-mono">
          <Filter className="w-3 h-3" />
          Filter:
        </div>

        <div className="flex flex-wrap gap-1.5">
          {AGENT_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setAgentFilter(opt)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all",
                agentFilter === opt
                  ? "bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30"
                  : "border border-white/[0.06] text-[#94a3b8] hover:text-white"
              )}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-white/[0.1]" />

        <div className="flex gap-1.5">
          {OUTCOME_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setOutcomeFilter(opt)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all",
                outcomeFilter === opt
                  ? opt === "win"
                    ? "bg-[#00ff9d]/15 text-[#00ff9d] border border-[#00ff9d]/30"
                    : opt === "loss"
                    ? "bg-[#ff3366]/15 text-[#ff3366] border border-[#ff3366]/30"
                    : "bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30"
                  : "border border-white/[0.06] text-[#94a3b8] hover:text-white"
              )}
            >
              {opt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {["Block", "Agent", "Pair", "AI Call", "Human Call", "P&L", "Outcome", "Confidence", "Tx Hash", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 text-[10px] font-mono text-[#475569] uppercase tracking-widest whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => (
                <LedgerRow key={entry.id} entry={entry} index={i} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-[#475569] font-mono">
            Showing {filtered.length} of {MOCK_LEDGER.length} entries
          </span>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-[#00ff9d] animate-pulse" />
            <span className="text-xs text-[#94a3b8] font-mono">Live updates from Mantle</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
