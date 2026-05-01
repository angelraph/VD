"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  BarChart3,
  Lock,
  ChevronRight,
  RotateCcw,
  Activity,
  Shield,
} from "lucide-react";
import { useCounter } from "@/hooks/useCounter";
import { AGENTS, AGENT_QUOTES } from "@/lib/agents";
import { LIVE_STATS } from "@/lib/mockData";
import { computeAiDecision } from "@/lib/simulation";
import type { Decision } from "@/types";
import { cn, formatPnl, sleep } from "@/lib/utils";

// ── Inline hero challenge (no scroll required) ────────────────────────────────

type HeroPhase = "idle" | "deciding" | "result";

function HeroChallenge() {
  const [phase, setPhase] = useState<HeroPhase>("idle");
  const [humanDecision, setHumanDecision] = useState<Decision | null>(null);
  const [result, setResult] = useState<{
    aiDecision: Decision;
    humanReturn: number;
    aiReturn: number;
    winner: "human" | "ai" | "tie";
  } | null>(null);
  const [livePair, setLivePair] = useState("ETH/USDT");
  const [livePrice, setLivePrice] = useState(3247.82);

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice((p) => parseFloat((p + (Math.random() - 0.5) * 4).toFixed(2)));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handleDecision = async (decision: Decision) => {
    if (phase !== "idle") return;
    setHumanDecision(decision);
    setPhase("deciding");

    await sleep(900);

    const aiDecision = computeAiDecision(AGENTS[0], "ETH/USDT", "balanced");
    const trend = Math.random() > 0.5 ? 1 : -1;
    const hMult = decision === "BUY" ? 1 : decision === "SELL" ? -1 : 0.05;
    const aMult = aiDecision === "BUY" ? 1 : aiDecision === "SELL" ? -1 : 0.05;
    const move = parseFloat((Math.random() * 2.8 + 0.5).toFixed(2));
    const humanReturn = parseFloat((trend * hMult * move).toFixed(2));
    const aiReturn = parseFloat((trend * aMult * move * 1.15).toFixed(2));
    const winner =
      humanReturn > aiReturn ? "human" : aiReturn > humanReturn ? "ai" : "tie";

    setResult({ aiDecision, humanReturn, aiReturn, winner });
    setPhase("result");
  };

  const reset = () => {
    setPhase("idle");
    setHumanDecision(null);
    setResult(null);
  };

  const agent = AGENTS[0]; // Oracle

  return (
    <div
      className="glass-card border overflow-hidden"
      style={{ borderColor: `${agent.color}20` }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: agent.color, boxShadow: `0 0 8px ${agent.color}` }}
          />
          <span className="text-xs font-mono font-bold" style={{ color: agent.color }}>
            ORACLE
          </span>
          <span className="text-xs text-[#475569] font-mono">is live</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-white/60">{livePair}</span>
          <span className="text-sm font-bold font-mono text-white">
            ${livePrice.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {/* IDLE — waiting for decision */}
          {phase === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-4"
            >
              <div className="text-center">
                <p className="text-sm text-[#94a3b8] mb-1">Oracle is watching. Make your call.</p>
                <p className="text-xs text-[#475569] font-mono">No wallet required</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(["BUY", "SELL", "HOLD"] as Decision[]).map((d) => {
                  const cfg = {
                    BUY:  { color: "#00ff9d", Icon: TrendingUp,  label: "BUY" },
                    SELL: { color: "#ff3366", Icon: TrendingDown, label: "SELL" },
                    HOLD: { color: "#fbbf24", Icon: Minus,        label: "HOLD" },
                  }[d];
                  return (
                    <motion.button
                      key={d}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleDecision(d)}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200 group"
                    >
                      <cfg.Icon
                        className="w-6 h-6 transition-colors duration-200"
                        style={{ color: cfg.color }}
                      />
                      <span
                        className="text-sm font-bold font-mono tracking-widest"
                        style={{ color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* DECIDING — AI thinking */}
          {phase === "deciding" && (
            <motion.div
              key="deciding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 flex flex-col items-center gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${agent.color}20` }}
                >
                  <Brain className="w-5 h-5 animate-pulse" style={{ color: agent.color }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: agent.color }}>
                    Oracle is deciding...
                  </div>
                  <div className="text-xs text-[#475569]">
                    Your call: <span className="text-white font-mono">{humanDecision}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: agent.color, animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* RESULT — verdict revealed */}
          {phase === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Winner banner */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cn(
                  "text-center py-3 rounded-xl border text-sm font-bold",
                  result.winner === "human"
                    ? "border-[#00ff9d]/30 bg-[#00ff9d]/08 text-[#00ff9d]"
                    : result.winner === "ai"
                    ? "border-[#ff3366]/30 bg-[#ff3366]/08 text-[#ff3366]"
                    : "border-[#fbbf24]/30 bg-[#fbbf24]/08 text-[#fbbf24]"
                )}
              >
                {result.winner === "human"
                  ? "🏆 YOU WIN — Human upset!"
                  : result.winner === "ai"
                  ? "🤖 ORACLE WINS — Machine prevails"
                  : "🤝 TIE — Equal minds"}
              </motion.div>

              {/* Score comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <div className="text-[10px] font-mono text-[#94a3b8] mb-1">YOU ({humanDecision})</div>
                  <div
                    className={cn(
                      "text-xl font-bold font-mono",
                      result.humanReturn >= 0 ? "text-[#00ff9d]" : "text-[#ff3366]"
                    )}
                  >
                    {formatPnl(result.humanReturn)}
                  </div>
                </div>
                <div
                  className="p-3 rounded-xl text-center border"
                  style={{ borderColor: `${agent.color}25`, backgroundColor: `${agent.color}08` }}
                >
                  <div className="text-[10px] font-mono mb-1" style={{ color: `${agent.color}90` }}>
                    ORACLE ({result.aiDecision})
                  </div>
                  <div
                    className={cn(
                      "text-xl font-bold font-mono",
                      result.aiReturn >= 0 ? "text-[#00ff9d]" : "text-[#ff3366]"
                    )}
                  >
                    {formatPnl(result.aiReturn)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[#94a3b8] hover:text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  Again
                </button>
                <Link href="/challenge" className="flex-1">
                  <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${agent.color}CC, ${agent.color}99)`,
                      color: "#020917",
                    }}
                  >
                    Full Challenge
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Stat counter card ─────────────────────────────────────────────────────────

function StatCard({ label, value, suffix, delay, color = "#00d4ff" }: {
  label: string; value: number; suffix: string; delay: number; color?: string;
}) {
  const count = useCounter(value, 2200, 0, delay);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 + 0.3, duration: 0.6 }}
      className="glass-card p-5"
    >
      <span className="text-3xl font-bold font-mono" style={{ color }}>
        {count.toLocaleString()}{suffix}
      </span>
      <div className="text-xs text-[#94a3b8] uppercase tracking-wider mt-1">{label}</div>
    </motion.div>
  );
}

// ── How it works step ─────────────────────────────────────────────────────────

function Step({ num, title, desc, icon, delay }: {
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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center px-4 pt-20 pb-16 overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-1/3 -left-72 w-[600px] h-[600px] rounded-full bg-[#00d4ff]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-72 w-[700px] h-[700px] rounded-full bg-[#7c3aed]/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: headline + context */}
            <div>
              {/* Hackathon badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#fbbf24]/30 bg-[#fbbf24]/5 text-[#fbbf24] text-xs font-semibold tracking-wider mb-6"
              >
                <Zap className="w-3 h-3" />
                MANTLE TURING TEST HACKATHON 2026
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-5"
              >
                <span className="text-white">Can You Pass</span>
                <br />
                <span className="text-white">the</span>{" "}
                <span className="text-gradient-verdict">Turing Test?</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-lg text-[#94a3b8] leading-relaxed mb-8 max-w-lg"
              >
                Human intuition vs machine intelligence — on the same market data,
                at the same time. Every verdict recorded on{" "}
                <span className="text-white font-medium">Mantle</span>.
                <span className="text-[#00d4ff]"> Transparent. Unforgiving.</span>
              </motion.p>

              {/* Live stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-4 mb-8"
              >
                {[
                  { label: "Decisions", value: "284K+", color: "#00d4ff" },
                  { label: "AI wins", value: "73.2%", color: "#ff3366" },
                  { label: "Human upsets", value: "26.8%", color: "#00ff9d" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="text-lg font-bold font-mono" style={{ color: s.color }}>
                      {s.value}
                    </span>
                    <span className="text-xs text-[#475569]">{s.label}</span>
                    <span className="w-px h-4 bg-white/[0.1]" />
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                <Link href="/challenge">
                  <button className="btn-primary flex items-center gap-2 text-base px-7 py-3.5">
                    Full Challenge
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/arena">
                  <button className="btn-ghost flex items-center gap-2 text-base px-7 py-3.5">
                    Agent Arena
                    <Zap className="w-4 h-4 text-[#00d4ff]" />
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Right: live interactive challenge */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#00ff9d] shadow-[0_0_8px_rgba(0,255,157,0.8)] animate-pulse" />
                <span className="text-xs font-mono font-semibold text-[#00ff9d] tracking-wider">
                  LIVE — TRY IT NOW
                </span>
              </div>
              <HeroChallenge />

              {/* Turing mode teaser */}
              <Link href="/challenge?mode=turing">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-3 flex items-center justify-between p-3 rounded-xl border border-[#7c3aed]/25 bg-[#7c3aed]/05 hover:bg-[#7c3aed]/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Brain className="w-4 h-4 text-[#7c3aed]" />
                    <div>
                      <span className="text-xs font-bold text-[#7c3aed] tracking-wider">TURING MODE</span>
                      <p className="text-[10px] text-[#475569]">
                        You don't know if you face AI or human
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#7c3aed] group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Decisions Recorded"  value={LIVE_STATS.totalDecisions}           suffix="" delay={0}   />
          <StatCard label="Active Challenges"   value={LIVE_STATS.activeChallenges}          suffix="" delay={200} color="#7c3aed" />
          <StatCard label="AI Win Rate"         value={Math.round(LIVE_STATS.aiWinRate)}     suffix="%" delay={400} color="#ff3366" />
          <StatCard label="Human Upsets"        value={Math.round(LIVE_STATS.humanWinRate)}  suffix="%" delay={600} color="#00ff9d" />
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
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
          <Step num="01" title="Choose Your Opponent" icon={<Brain className="w-5 h-5" />} delay={0}
            desc="Pick one of 5 specialized AI agents — or enter Turing Mode and face an unknown challenger. Oracle, Rift, Pulse, Nova, Cipher." />
          <Step num="02" title="Make Your Decision" icon={<BarChart3 className="w-5 h-5" />} delay={0.1}
            desc="Select a trading pair, set your risk profile, and make your call. The AI analyzes the same market data at the same time." />
          <Step num="03" title="Get the Verdict" icon={<Lock className="w-5 h-5" />} delay={0.2}
            desc="Watch the simulation. The outcome is written to Mantle — a permanent, tamper-proof record of who was right." />
        </div>
      </section>

      {/* ── AGENT PREVIEW ────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <div className="text-xs font-mono text-[#7c3aed]/70 tracking-widest uppercase mb-2">The Opponents</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Meet the Agents</h2>
          </div>
          <Link href="/arena" className="hidden sm:flex items-center gap-1.5 text-sm text-[#94a3b8] hover:text-white transition-colors">
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
                    <span className="text-sm font-bold font-mono tracking-widest" style={{ color: agent.color }}>
                      {agent.name}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: agent.color, boxShadow: `0 0 6px ${agent.color}` }}
                    />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">{agent.winRate}%</div>
                  <div className="text-xs text-[#475569] leading-relaxed italic flex-1">
                    "{AGENT_QUOTES[agent.id]?.split(".")[0]}."
                  </div>
                  <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between">
                    <span className="text-xs text-[#475569]">{agent.strategy.split(" ")[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#475569] group-hover:text-[#00d4ff] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MANTLE BANNER ────────────────────────────────────────────────── */}
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
                Every verdict is a contract call on Mantle Sepolia. Agent reputations
                are on-chain facts — not marketing. No database, no manipulation.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-w-[220px]">
              {[
                { label: "Network", value: "Mantle Sepolia", color: "#00ff9d" },
                { label: "Chain ID", value: "5003", color: "#00d4ff" },
                { label: "Contract", value: "VerdictProtocol.sol", color: "#7c3aed" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <span className="text-xs text-[#94a3b8]">{item.label}</span>
                  <span className="text-xs font-mono font-semibold" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-32 max-w-4xl mx-auto w-full text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            The Machine Has Already<br />
            <span className="text-gradient-verdict">Made Its Decision.</span>
          </h2>
          <p className="text-[#94a3b8] mb-8 text-lg">
            73% of the time, it's right. The question isn't whether AI can trade.
            <br />
            <span className="text-white">The question is: can it beat you?</span>
          </p>
          <Link href="/challenge">
            <button className="btn-primary text-lg px-10 py-5 inline-flex items-center gap-3">
              <Activity className="w-5 h-5" />
              Accept the Challenge
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
