"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Brain,
  ChevronRight,
  ExternalLink,
  Activity,
  BarChart3,
  Lock,
} from "lucide-react";
import { useCounter } from "@/hooks/useCounter";
import { AGENTS } from "@/lib/agents";
import { LIVE_STATS } from "@/lib/mockData";
import { cn, formatPnl } from "@/lib/utils";

const TRADING_PAIRS = ["ETH/USDT", "BTC/USDT", "MNT/USDT", "ARB/USDT"];

function LiveTickerItem({ pair, change, agent }: { pair: string; change: number; agent: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
      <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse" />
      <span className="text-xs font-mono text-[#94a3b8]">{pair}</span>
      <span className={cn("text-xs font-bold font-mono", change >= 0 ? "text-[#00ff9d]" : "text-[#ff3366]")}>
        {formatPnl(change)}
      </span>
      <span className="text-xs text-[#475569]">{agent}</span>
    </div>
  );
}

function StatCard({ label, value, suffix, delay, color = "#00d4ff" }: {
  label: string; value: number; suffix: string; delay: number; color?: string;
}) {
  const count = useCounter(value, 2200, 0, delay);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 + 0.3, duration: 0.6 }}
      className="glass-card p-5 flex flex-col gap-1"
    >
      <span className="text-3xl font-bold font-mono" style={{ color }}>
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-xs text-[#94a3b8] uppercase tracking-wider">{label}</span>
    </motion.div>
  );
}

function HowItWorksStep({ num, title, desc, icon, delay }: {
  num: string; title: string; desc: string; icon: React.ReactNode; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.6 }}
      className="glass-card-hover p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff]">
          {icon}
        </div>
        <span className="text-xs font-mono text-[#00d4ff]/50 tracking-widest">STEP {num}</span>
      </div>
      <div>
        <h3 className="text-base font-semibold text-white mb-1.5">{title}</h3>
        <p className="text-sm text-[#94a3b8] leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const [activePair, setActivePair] = useState(0);
  const [liveChanges, setLiveChanges] = useState([2.34, -1.18, 0.87, 3.41]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePair((p) => (p + 1) % TRADING_PAIRS.length);
      setLiveChanges((prev) =>
        prev.map((v) => parseFloat((v + (Math.random() - 0.5) * 0.8).toFixed(2)))
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] rounded-full bg-[#00d4ff]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] rounded-full bg-[#7c3aed]/5 blur-3xl pointer-events-none" />

        {/* Hackathon badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full border border-[#fbbf24]/30 bg-[#fbbf24]/5 text-[#fbbf24] text-xs font-semibold tracking-wider"
        >
          <Zap className="w-3 h-3" />
          MANTLE HACKATHON 2025
          <span className="w-1 h-1 rounded-full bg-[#fbbf24]" />
          LIVE DEMO
        </motion.div>

        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-center max-w-5xl"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight mb-6">
            <span className="text-white">Every Decision</span>
            <br />
            <span className="text-gradient-verdict">Leaves a Verdict</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#94a3b8] max-w-2xl mx-auto leading-relaxed">
            Human intuition vs machine intelligence. Challenge AI agents, compare decisions,
            and let <span className="text-white font-medium">Mantle</span> be the final judge.
            <span className="text-[#00d4ff]"> Transparent. On-chain. Unforgiving.</span>
          </p>
        </motion.div>

        {/* Live battle preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 w-full max-w-2xl glass-card p-5 border-[#00d4ff]/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00ff9d] shadow-[0_0_8px_rgba(0,255,157,0.8)] animate-pulse" />
              <span className="text-xs font-mono text-[#00ff9d] font-semibold tracking-wider">
                LIVE BATTLE
              </span>
            </div>
            <span className="text-xs font-mono text-[#475569]">Oracle vs @trader_anon</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#00d4ff]/5 border border-[#00d4ff]/15">
              <div className="text-xs text-[#94a3b8] mb-1 font-mono">ORACLE AI</div>
              <div className="text-sm font-bold text-white">BUY ETH/USDT</div>
              <div className="text-lg font-bold font-mono text-[#00ff9d]">+2.34%</div>
            </div>
            <div className="p-3 rounded-xl bg-[#ff3366]/5 border border-[#ff3366]/15">
              <div className="text-xs text-[#94a3b8] mb-1 font-mono">HUMAN</div>
              <div className="text-sm font-bold text-white">SELL ETH/USDT</div>
              <div className="text-lg font-bold font-mono text-[#ff3366]">-1.18%</div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-[#94a3b8] font-mono">
              Verdict in <span className="text-[#fbbf24]">3m 47s</span>
            </span>
            <Link
              href="/challenge"
              className="text-xs text-[#00d4ff] hover:text-white transition-colors flex items-center gap-1"
            >
              Join 847 active challenges
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-8"
        >
          <Link href="/challenge">
            <button className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              Challenge an AI Agent
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/arena">
            <button className="btn-ghost flex items-center gap-2 text-base px-8 py-4">
              View Agent Arena
              <Zap className="w-4 h-4 text-[#00d4ff]" />
            </button>
          </Link>
        </motion.div>

        {/* Live ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          {TRADING_PAIRS.map((pair, i) => (
            <LiveTickerItem
              key={pair}
              pair={pair}
              change={liveChanges[i]}
              agent={AGENTS[i % AGENTS.length].name}
            />
          ))}
        </motion.div>
      </section>

      {/* ── LIVE STATS ── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Decisions Recorded" value={LIVE_STATS.totalDecisions} suffix="" delay={0} />
          <StatCard label="Active Challenges" value={LIVE_STATS.activeChallenges} suffix="" delay={200} color="#7c3aed" />
          <StatCard label="AI Win Rate" value={Math.round(LIVE_STATS.aiWinRate)} suffix="%" delay={400} color="#00ff9d" />
          <StatCard label="Human Upsets" value={Math.round(LIVE_STATS.humanWinRate)} suffix="%" delay={600} color="#fbbf24" />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="text-xs font-mono text-[#00d4ff]/70 tracking-widest uppercase mb-3">
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Three Steps to the Verdict
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HowItWorksStep
            num="01"
            title="Choose Your Opponent"
            desc="Pick one of 5 specialized AI agents — each with unique strategies, win rates, and risk profiles. Oracle, Rift, Pulse, Nova, or Cipher."
            icon={<Brain className="w-5 h-5" />}
            delay={0}
          />
          <HowItWorksStep
            num="02"
            title="Make Your Decision"
            desc="Select a trading pair, set your risk profile, and make your call: BUY, SELL, or HOLD. The AI analyzes the same market data simultaneously."
            icon={<BarChart3 className="w-5 h-5" />}
            delay={0.1}
          />
          <HowItWorksStep
            num="03"
            title="Get the Verdict"
            desc="Watch the simulation play out in real-time. The outcome is recorded on Mantle — immutable, transparent, and verifiable by anyone."
            icon={<Lock className="w-5 h-5" />}
            delay={0.2}
          />
        </div>
      </section>

      {/* ── AGENT PREVIEW ── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <div className="text-xs font-mono text-[#7c3aed]/70 tracking-widest uppercase mb-2">
              The Opponents
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Meet the Agents</h2>
          </div>
          <Link
            href="/arena"
            className="hidden sm:flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white transition-colors"
          >
            Full Arena <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {AGENTS.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link href={`/arena#${agent.id}`}>
                <div
                  className="glass-card-hover p-5 flex flex-col gap-3 group cursor-pointer h-full"
                  style={{ borderColor: `${agent.color}20` }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-mono font-bold tracking-widest"
                      style={{ color: agent.color }}
                    >
                      {agent.name}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{
                        backgroundColor: agent.color,
                        boxShadow: `0 0 6px ${agent.color}`,
                      }}
                    />
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {agent.winRate}%
                  </div>
                  <div className="text-xs text-[#94a3b8]">Win Rate</div>
                  <div className="mt-auto pt-2 border-t border-white/[0.05] flex items-center justify-between">
                    <span className="text-xs text-[#94a3b8]">{agent.strategy.split(" ")[0]}</span>
                    <ArrowRight
                      className="w-3.5 h-3.5 text-[#475569] group-hover:text-[#00d4ff] group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MANTLE BANNER ── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-[#7c3aed]/20 bg-gradient-to-br from-[#7c3aed]/10 via-transparent to-[#00d4ff]/10 p-8 sm:p-12"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7c3aed]/50 to-transparent" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/20 text-[#00ff9d] text-xs font-semibold mb-4">
                <Shield className="w-3 h-3" />
                On-Chain Proof
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Powered by Mantle Network
              </h2>
              <p className="text-[#94a3b8] max-w-md leading-relaxed">
                Every challenge, every decision, every verdict is recorded as immutable
                on-chain proof on Mantle Sepolia. No manipulation. No disputes.
              </p>
            </div>

            <div className="flex flex-col gap-3 min-w-[220px]">
              {[
                { label: "Network", value: "Mantle Sepolia", color: "#00ff9d" },
                { label: "Chain ID", value: "5003", color: "#00d4ff" },
                { label: "Avg Finality", value: "~2 seconds", color: "#fbbf24" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                >
                  <span className="text-xs text-[#94a3b8]">{item.label}</span>
                  <span className="text-xs font-mono font-semibold" style={{ color: item.color }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-32 max-w-4xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Are You Smarter
            <br />
            <span className="text-gradient-verdict">Than the Machine?</span>
          </h2>
          <p className="text-[#94a3b8] mb-8 text-lg">
            Thousands of challenges have been run. The AI wins 73% of the time.
            <br />
            <span className="text-white">You could be the next upset.</span>
          </p>
          <Link href="/challenge">
            <button className="btn-primary text-lg px-10 py-5 inline-flex items-center gap-3">
              <Activity className="w-5 h-5" />
              Start Your First Challenge
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <p className="mt-4 text-xs text-[#475569] font-mono">
            No wallet required to demo · Connect for on-chain proof
          </p>
        </motion.div>
      </section>
    </div>
  );
}
