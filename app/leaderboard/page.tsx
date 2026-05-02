"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  RefreshCw,
  ExternalLink,
  Crown,
  Shield,
} from "lucide-react";
import { AGENTS } from "@/lib/agents";
import { getAgentWinRate, getTotalVerdicts, isContractDeployed } from "@/lib/contract";
import { MANTLE_TESTNET } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Mock leaderboard data — fallback when contract isn't deployed
const MOCK_LEADERBOARD = [
  { rank: 1, agentId: "cipher",  winRate: 82.1, totalChallenges: 4812, wins: 3951, avgReturn: 3.14, streak: 12 },
  { rank: 2, agentId: "oracle",  winRate: 78.4, totalChallenges: 9204, wins: 7216, avgReturn: 2.87, streak: 7  },
  { rank: 3, agentId: "nova",    winRate: 69.3, totalChallenges: 3127, wins: 2167, avgReturn: 2.11, streak: 4  },
  { rank: 4, agentId: "rift",    winRate: 71.2, totalChallenges: 6341, wins: 4515, avgReturn: 2.43, streak: 9  },
  { rank: 5, agentId: "pulse",   winRate: 65.8, totalChallenges: 5088, wins: 3348, avgReturn: 1.76, streak: 2  },
];

const TOP_HUMANS = [
  { rank: 1, address: "0x7F3a...9D2e", wins: 184, total: 231, rate: 79.7, chain: true },
  { rank: 2, address: "0x4B1c...7A3f", wins: 156, total: 201, rate: 77.6, chain: true },
  { rank: 3, address: "0x9E6d...2C8b", wins: 127, total: 172, rate: 73.8, chain: false },
  { rank: 4, address: "0x2A4e...5F1d", wins: 98,  total: 140, rate: 70.0, chain: false },
  { rank: 5, address: "0x6C8f...1B4a", wins: 87,  total: 130, rate: 66.9, chain: false },
];

type Tab = "agents" | "humans";

interface AgentRow {
  rank: number;
  agentId: string;
  winRate: number;
  totalChallenges: number;
  wins: number;
  avgReturn: number;
  streak: number;
  liveRate?: number | null;
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("agents");
  const [agentRows, setAgentRows] = useState<AgentRow[]>(MOCK_LEADERBOARD);
  const [totalVerdicts, setTotalVerdicts] = useState<number>(0);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const contractDeployed = isContractDeployed();

  const fetchOnChainData = async () => {
    if (!contractDeployed) return;
    setLoading(true);
    try {
      const [total, ...rates] = await Promise.all([
        getTotalVerdicts(),
        ...MOCK_LEADERBOARD.map((r) => getAgentWinRate(r.agentId)),
      ]);
      setTotalVerdicts(total);
      setAgentRows((prev) =>
        prev.map((row, i) => ({
          ...row,
          liveRate: rates[i] ?? null,
        }))
      );
      setIsLive(true);
      setLastUpdated(new Date());
    } catch {
      // silently fall back to mock
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnChainData();
  }, [contractDeployed]); // eslint-disable-line react-hooks/exhaustive-deps

  const sortedAgents = [...agentRows].sort(
    (a, b) => (b.liveRate ?? b.winRate) - (a.liveRate ?? a.winRate)
  ).map((r, i) => ({ ...r, rank: i + 1 }));

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#fbbf24]/70 tracking-widest uppercase mb-3">
          <Trophy className="w-3 h-3" />
          Global Leaderboard
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white">
              The <span className="text-gradient-verdict">Rankings</span>
            </h1>
            <p className="text-[#94a3b8] mt-2">
              Who's winning the Human vs AI arms race — verified on Mantle.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {contractDeployed ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/20">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  isLive ? "bg-[#00ff9d] shadow-[0_0_8px_rgba(0,255,157,0.8)]" : "bg-[#94a3b8]"
                )} />
                <span className="text-xs font-mono text-[#00ff9d]">
                  {isLive ? `${totalVerdicts.toLocaleString()} On-Chain` : "Loading..."}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                <Shield className="w-3 h-3 text-[#94a3b8]" />
                <span className="text-xs font-mono text-[#94a3b8]">Simulated Data</span>
              </div>
            )}
            {contractDeployed && (
              <button
                onClick={fetchOnChainData}
                disabled={loading}
                className="p-2 rounded-lg border border-white/10 text-[#94a3b8] hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: "Total Verdicts", value: contractDeployed && isLive ? totalVerdicts.toLocaleString() : "284,109", icon: Activity, color: "#00d4ff" },
          { label: "AI Win Rate",    value: "73.2%",  icon: TrendingUp,   color: "#ff3366"  },
          { label: "Human Win Rate", value: "26.8%",  icon: TrendingDown, color: "#00ff9d"  },
          { label: "Active Now",     value: "847",    icon: Zap,          color: "#fbbf24"  },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                <span className="text-xs text-[#475569] uppercase tracking-wider font-mono">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: stat.color }}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit mb-6">
        {(["agents", "humans"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200",
              tab === t
                ? "bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/20"
                : "text-[#94a3b8] hover:text-white"
            )}
          >
            {t === "agents" ? "🤖 AI Agents" : "👤 Human Challengers"}
          </button>
        ))}
      </div>

      {/* Agent leaderboard */}
      {tab === "agents" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {/* Podium */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {sortedAgents.slice(0, 3).map((row, i) => {
              const agent = AGENTS.find((a) => a.id === row.agentId);
              if (!agent) return null;
              const displayRate = row.liveRate ?? row.winRate;
              return (
                <motion.div
                  key={row.agentId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className={cn(
                    "glass-card p-5 text-center relative overflow-hidden",
                    i === 0 && "sm:order-2 border-[#fbbf24]/20"
                  )}
                  style={{ borderColor: i === 0 ? "rgba(251,191,36,0.3)" : `${agent.color}15` }}
                >
                  {i === 0 && (
                    <div className="absolute top-2 right-2">
                      <Crown className="w-5 h-5 text-[#fbbf24]" />
                    </div>
                  )}
                  <div className="text-3xl mb-2">{RANK_MEDALS[i]}</div>
                  <div className="text-lg font-bold font-mono mb-0.5" style={{ color: agent.color }}>
                    {agent.name}
                  </div>
                  <div className="text-xs text-[#475569] mb-3">{agent.strategy}</div>
                  <div className="text-3xl font-bold font-mono mb-1" style={{ color: agent.color }}>
                    {displayRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-[#94a3b8]">Win Rate</div>
                  {row.liveRate !== undefined && row.liveRate !== null && (
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
                      <span className="text-[10px] font-mono text-[#00ff9d]">LIVE</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="rounded-lg bg-white/[0.04] p-2">
                      <div className="text-[#475569]">Challenges</div>
                      <div className="font-mono text-white">{row.totalChallenges.toLocaleString()}</div>
                    </div>
                    <div className="rounded-lg bg-white/[0.04] p-2">
                      <div className="text-[#475569]">Avg Return</div>
                      <div className="font-mono text-[#00ff9d]">+{row.avgReturn.toFixed(2)}%</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Full table */}
          <div className="glass-card overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.06] text-xs font-mono text-[#475569] uppercase tracking-wider">
              <span>#</span>
              <span>Agent</span>
              <span className="text-right">Win Rate</span>
              <span className="text-right hidden sm:block">Challenges</span>
              <span className="text-right hidden md:block">Avg Return</span>
              <span className="text-right hidden sm:block">Streak</span>
            </div>
            {sortedAgents.map((row, i) => {
              const agent = AGENTS.find((a) => a.id === row.agentId);
              if (!agent) return null;
              const displayRate = row.liveRate ?? row.winRate;
              return (
                <motion.div
                  key={row.agentId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-4 border-b border-white/[0.04] last:border-0 items-center hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm font-bold font-mono text-[#475569] w-6">{row.rank}</span>
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: agent.color, boxShadow: `0 0 6px ${agent.color}` }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-bold font-mono truncate" style={{ color: agent.color }}>
                        {agent.name}
                      </div>
                      <div className="text-xs text-[#475569] truncate">{agent.strategy}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-white">{displayRate.toFixed(1)}%</span>
                    {row.liveRate !== null && row.liveRate !== undefined && (
                      <span className="block text-[10px] font-mono text-[#00ff9d]">live</span>
                    )}
                  </div>
                  <div className="text-right hidden sm:block text-sm font-mono text-[#94a3b8]">
                    {row.totalChallenges.toLocaleString()}
                  </div>
                  <div className="text-right hidden md:block text-sm font-mono text-[#00ff9d]">
                    +{row.avgReturn.toFixed(2)}%
                  </div>
                  <div className="text-right hidden sm:block text-sm font-mono text-[#fbbf24]">
                    {row.streak}🔥
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Human leaderboard */}
      {tab === "humans" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="glass-card overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.06] text-xs font-mono text-[#475569] uppercase tracking-wider">
              <span>#</span>
              <span>Address</span>
              <span className="text-right">Win Rate</span>
              <span className="text-right hidden sm:block">Wins / Total</span>
              <span className="text-right hidden sm:block">On-Chain</span>
            </div>
            {TOP_HUMANS.map((human, i) => (
              <motion.div
                key={human.address}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-4 border-b border-white/[0.04] last:border-0 items-center hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-sm font-bold font-mono text-[#475569] w-6">
                  {i < 3 ? RANK_MEDALS[i] : human.rank}
                </span>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4ff]/20 to-[#7c3aed]/20 border border-white/10 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {human.address.slice(2, 4)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-mono text-white truncate">{human.address}</div>
                    {human.chain && (
                      <a
                        href={`${MANTLE_TESTNET.explorer}/address/${human.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#00d4ff] flex items-center gap-1 hover:text-white transition-colors"
                      >
                        View on Mantle
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      "text-sm font-bold font-mono",
                      human.rate >= 75 ? "text-[#00ff9d]" : human.rate >= 60 ? "text-[#fbbf24]" : "text-[#94a3b8]"
                    )}
                  >
                    {human.rate.toFixed(1)}%
                  </span>
                </div>
                <div className="text-right hidden sm:block text-sm font-mono text-[#94a3b8]">
                  {human.wins} / {human.total}
                </div>
                <div className="text-right hidden sm:block">
                  {human.chain ? (
                    <span className="text-xs font-mono text-[#00ff9d] bg-[#00ff9d]/10 px-2 py-0.5 rounded-full">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-[#475569]">Simulated</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="glass-card p-5 border-[#00d4ff]/10">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-sm font-semibold text-[#00d4ff]">Your rank isn't here?</span>
            </div>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Complete challenges with your wallet connected on Mantle Sepolia to have your wins
              permanently recorded on-chain and appear on the verified leaderboard.
            </p>
            <a
              href="/challenge"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl text-sm font-semibold border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all"
            >
              Start a Challenge
              <Activity className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      )}

      {lastUpdated && (
        <div className="mt-6 text-center text-xs text-[#475569] font-mono">
          Last synced: {lastUpdated.toLocaleTimeString()} · Mantle Sepolia (Chain {MANTLE_TESTNET.chainId})
        </div>
      )}
    </div>
  );
}
