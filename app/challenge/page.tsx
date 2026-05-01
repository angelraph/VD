"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Zap,
  Shield,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { AGENTS } from "@/lib/agents";
import {
  generateThinkingSteps,
  computeAiDecision,
  runSimulation,
} from "@/lib/simulation";
import { mockSubmitChallenge, getMantleExplorerUrl } from "@/lib/mantle";
import type {
  Agent,
  Decision,
  Duration,
  RiskProfile,
  TradingPair,
  ChallengePhase,
  ChallengeResult,
  ThinkingStep,
} from "@/types";
import { cn, formatPnl, sleep } from "@/lib/utils";

const PAIRS: TradingPair[] = ["ETH/USDT", "BTC/USDT", "MNT/USDT", "ARB/USDT", "LINK/USDT"];
const RISK_PROFILES: { value: RiskProfile; label: string; desc: string }[] = [
  { value: "conservative", label: "Conservative", desc: "Lower risk, steady returns" },
  { value: "balanced", label: "Balanced", desc: "Moderate risk and reward" },
  { value: "aggressive", label: "Aggressive", desc: "High risk, high reward" },
];
const DURATIONS: { value: Duration; label: string }[] = [
  { value: "1m", label: "1 Min" },
  { value: "5m", label: "5 Min" },
  { value: "15m", label: "15 Min" },
  { value: "1h", label: "1 Hour" },
];

function DecisionButton({
  decision, selected, onClick, disabled,
}: {
  decision: Decision; selected: boolean; onClick: () => void; disabled?: boolean;
}) {
  const config = {
    BUY: { color: "#00ff9d", icon: TrendingUp, label: "BUY", desc: "Go Long" },
    SELL: { color: "#ff3366", icon: TrendingDown, label: "SELL", desc: "Go Short" },
    HOLD: { color: "#fbbf24", icon: Minus, label: "HOLD", desc: "Stay Neutral" },
  }[decision];
  const Icon = config.icon;

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={disabled ? undefined : onClick}
      className={cn(
        "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 w-full",
        disabled && "opacity-40 cursor-not-allowed",
        selected
          ? "bg-opacity-10"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      )}
      style={selected ? {
        borderColor: `${config.color}60`,
        backgroundColor: `${config.color}10`,
        boxShadow: `0 0 20px ${config.color}20`,
      } : undefined}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: selected ? `${config.color}20` : "rgba(255,255,255,0.05)" }}
      >
        <Icon
          className="w-6 h-6 transition-colors"
          style={{ color: selected ? config.color : "#94a3b8" }}
        />
      </div>
      <div>
        <div
          className="text-base font-bold font-mono tracking-widest"
          style={{ color: selected ? config.color : "#94a3b8" }}
        >
          {config.label}
        </div>
        <div className="text-xs text-[#475569]">{config.desc}</div>
      </div>
    </motion.button>
  );
}

function ThinkingTerminal({ steps, agent }: { steps: ThinkingStep[]; agent: Agent }) {
  const [completed, setCompleted] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let idx = 0;
    const advance = () => {
      if (idx >= steps.length) return;
      setTimeout(() => {
        setCompleted((prev) => [...prev, idx]);
        idx++;
        if (idx < steps.length) {
          setCurrent(idx);
          advance();
        }
      }, steps[idx].duration);
    };
    advance();
  }, [steps]);

  return (
    <div className="glass-card p-5 font-mono text-xs">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff3366]/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#00ff9d]/70" />
        </div>
        <span className="text-[#475569] uppercase tracking-widest text-[10px]">
          {agent.name} ANALYSIS ENGINE
        </span>
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i <= current ? 1 : 0.2, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-2"
          >
            <span
              className="mt-0.5 flex-shrink-0 transition-all duration-300"
              style={{ color: completed.includes(i) ? agent.color : "#475569" }}
            >
              {completed.includes(i) ? "✓" : i === current ? "▶" : "○"}
            </span>
            <div>
              <span
                className="transition-colors duration-300"
                style={{ color: completed.includes(i) ? "#f0f4ff" : "#94a3b8" }}
              >
                {step.label}
              </span>
              {completed.includes(i) && (
                <span className="text-[#475569] ml-2">— {step.detail}</span>
              )}
            </div>
          </motion.div>
        ))}
        {completed.length < steps.length && (
          <div className="flex items-center gap-1 text-[#94a3b8]">
            <span className="typing-cursor" />
          </div>
        )}
      </div>
    </div>
  );
}

function VerdictReveal({ result, agent, onReset }: {
  result: ChallengeResult; agent: Agent; onReset: () => void;
}) {
  const [txSubmitted, setTxSubmitted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    const submitTx = async () => {
      await sleep(1500);
      const tx = await mockSubmitChallenge(agent.id, "ETH/USDT", result.aiDecision);
      setTxHash(tx.hash);
      setTxSubmitted(true);
    };
    submitTx();
  }, [agent.id, result.aiDecision]);

  const isAiWinner = result.winner === "ai";
  const isHumanWinner = result.winner === "human";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-5"
    >
      {/* Verdict banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 text-center border"
        style={{
          borderColor: isHumanWinner ? "rgba(0,255,157,0.3)" : isAiWinner ? "rgba(255,51,102,0.3)" : "rgba(251,191,36,0.3)",
          background: isHumanWinner ? "rgba(0,255,157,0.05)" : isAiWinner ? "rgba(255,51,102,0.05)" : "rgba(251,191,36,0.05)",
        }}
      >
        <div className="text-5xl mb-3">{isHumanWinner ? "🏆" : isAiWinner ? "🤖" : "🤝"}</div>
        <div className="text-2xl font-bold text-white mb-1">
          {isHumanWinner ? "You Win!" : isAiWinner ? `${agent.name} Wins` : "Tie Game"}
        </div>
        <div className="text-sm text-[#94a3b8]">
          {isHumanWinner
            ? "You beat the machine. Exceptional call."
            : isAiWinner
            ? "The algorithm prevailed this time."
            : "Minds think alike — both chose correctly."}
        </div>
      </div>

      {/* Score comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-xs font-mono text-[#94a3b8] mb-2 uppercase">Your Decision</div>
          <div className="text-base font-bold text-white mb-1">{result.humanDecision}</div>
          <div
            className={cn(
              "text-2xl font-bold font-mono",
              result.humanReturn >= 0 ? "text-[#00ff9d]" : "text-[#ff3366]"
            )}
          >
            {formatPnl(result.humanReturn)}
          </div>
        </div>
        <div className="glass-card p-4 text-center" style={{ borderColor: `${agent.color}20` }}>
          <div className="text-xs font-mono mb-2 uppercase" style={{ color: `${agent.color}90` }}>
            {agent.name}
          </div>
          <div className="text-base font-bold text-white mb-1">{result.aiDecision}</div>
          <div
            className={cn(
              "text-2xl font-bold font-mono",
              result.aiReturn >= 0 ? "text-[#00ff9d]" : "text-[#ff3366]"
            )}
          >
            {formatPnl(result.aiReturn)}
          </div>
        </div>
      </div>

      {/* Verdict score */}
      <div className="glass-card p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-mono text-[#94a3b8] uppercase tracking-wider">
            Verdict Score
          </span>
          <span className="text-xs font-mono" style={{ color: agent.color }}>
            AI: {result.verdictScore.toFixed(1)} / Human: {(100 - result.verdictScore).toFixed(1)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${agent.color}, #ff3366)`,
              width: `${result.verdictScore}%`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${result.verdictScore}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* AI reasoning preview */}
      <div className="glass-card p-4">
        <div className="text-xs font-mono text-[#94a3b8] uppercase tracking-wider mb-3">
          {agent.name} Reasoning
        </div>
        <div className="space-y-2">
          {result.reasoning.slice(0, 3).map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="mt-0.5 flex-shrink-0" style={{ color: agent.color }}>▸</span>
              <span className="text-[#94a3b8]">{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* On-chain proof */}
      <div className="glass-card p-4 border-[#00d4ff]/10">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-[#00d4ff]" />
          <span className="text-xs font-mono text-[#00d4ff] uppercase tracking-wider">
            On-Chain Proof
          </span>
        </div>
        {txSubmitted && txHash ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#475569]">Tx Hash</span>
              <a
                href={getMantleExplorerUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-mono text-[#00d4ff] hover:text-white transition-colors"
              >
                {txHash.slice(0, 14)}...{txHash.slice(-6)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#475569]">Block</span>
              <span className="text-xs font-mono text-white">#{result.blockNumber}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff9d]" />
              <span className="text-xs text-[#00ff9d]">Recorded on Mantle Sepolia</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
            <span className="w-3 h-3 rounded-full border-2 border-[#00d4ff]/30 border-t-[#00d4ff] animate-spin" />
            Submitting to Mantle...
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-white/10 text-[#94a3b8] hover:text-white hover:border-white/20 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          New Challenge
        </button>
        <a
          href="/ledger"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-[#00d4ff]/20 text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all"
        >
          View Ledger
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
}

export default function ChallengePage() {
  const [phase, setPhase] = useState<ChallengePhase>("setup");
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0]);
  const [selectedPair, setSelectedPair] = useState<TradingPair>("ETH/USDT");
  const [riskProfile, setRiskProfile] = useState<RiskProfile>("balanced");
  const [duration, setDuration] = useState<Duration>("5m");
  const [humanDecision, setHumanDecision] = useState<Decision | null>(null);
  const [aiDecision, setAiDecision] = useState<Decision | null>(null);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [simIndex, setSimIndex] = useState(0);
  const [countdown, setCountdown] = useState(5);

  const handleDecision = async (decision: Decision) => {
    setHumanDecision(decision);
    setPhase("ai-thinking");

    const steps = generateThinkingSteps(selectedAgent, selectedPair);
    setThinkingSteps(steps);
    const totalTime = steps.reduce((acc, s) => acc + s.duration, 0) + 800;

    await sleep(totalTime);

    const aiChoice = computeAiDecision(selectedAgent, selectedPair, riskProfile);
    setAiDecision(aiChoice);
    setPhase("simulation");

    const sim = runSimulation(
      selectedAgent, selectedPair, decision, aiChoice, duration, riskProfile
    );
    setResult(sim);

    let idx = 0;
    const interval = setInterval(() => {
      idx += 2;
      setSimIndex(idx);
      if (idx >= sim.simulationData.length - 1) {
        clearInterval(interval);
        setTimeout(() => setPhase("verdict"), 500);
      }
    }, 80);
  };

  const handleReset = () => {
    setPhase("setup");
    setHumanDecision(null);
    setAiDecision(null);
    setResult(null);
    setSimIndex(0);
    setCountdown(5);
  };

  useEffect(() => {
    if (phase === "decision") {
      setCountdown(5);
      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const visibleSimData = result
    ? result.simulationData.slice(0, Math.max(2, simIndex))
    : [];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#7c3aed]/70 tracking-widest uppercase mb-3">
          <Zap className="w-3 h-3" />
          Challenge Simulator
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white">
          Face the <span className="text-gradient-verdict">Machine</span>
        </h1>
        <p className="text-[#94a3b8] mt-2">Select your opponent, make your call. Let Mantle decide.</p>
      </motion.div>

      {/* Phase progress */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {["Setup", "Decision", "AI Thinking", "Simulation", "Verdict"].map((label, i) => {
          const phases: ChallengePhase[] = ["setup", "decision", "ai-thinking", "simulation", "verdict"];
          const isActive = phases[i] === phase;
          const isDone = phases.indexOf(phase) > i;
          return (
            <div key={label} className="flex items-center gap-2 flex-shrink-0">
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-300",
                isActive ? "bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30" :
                isDone ? "text-[#94a3b8] bg-white/[0.04]" : "text-[#475569]"
              )}>
                {isDone && <CheckCircle2 className="w-3 h-3 text-[#00ff9d]" />}
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />}
                {label}
              </div>
              {i < 4 && <ChevronRight className="w-3 h-3 text-[#475569] flex-shrink-0" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left config panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Agent selector */}
          <div className="glass-card p-5">
            <div className="text-xs font-mono text-[#94a3b8] uppercase tracking-wider mb-3">
              Select Opponent
            </div>
            <div className="grid grid-cols-1 gap-2">
              {AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => phase === "setup" && setSelectedAgent(agent)}
                  disabled={phase !== "setup"}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 border",
                    selectedAgent.id === agent.id
                      ? "bg-white/[0.05]"
                      : "border-transparent hover:bg-white/[0.03]",
                    phase !== "setup" && "cursor-not-allowed"
                  )}
                  style={selectedAgent.id === agent.id ? {
                    borderColor: `${agent.color}30`,
                  } : undefined}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: agent.color, boxShadow: `0 0 6px ${agent.color}` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold font-mono" style={{ color: selectedAgent.id === agent.id ? agent.color : "#f0f4ff" }}>
                      {agent.name}
                    </div>
                    <div className="text-xs text-[#475569] truncate">{agent.strategy}</div>
                  </div>
                  <span className="text-xs font-mono text-[#94a3b8] flex-shrink-0">
                    {agent.winRate}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Trading pair */}
          <div className="glass-card p-5">
            <div className="text-xs font-mono text-[#94a3b8] uppercase tracking-wider mb-3">
              Trading Pair
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PAIRS.map((pair) => (
                <button
                  key={pair}
                  onClick={() => phase === "setup" && setSelectedPair(pair)}
                  disabled={phase !== "setup"}
                  className={cn(
                    "py-2 px-3 rounded-lg text-xs font-mono font-semibold border transition-all",
                    selectedPair === pair
                      ? "border-[#00d4ff]/40 bg-[#00d4ff]/10 text-[#00d4ff]"
                      : "border-white/10 text-[#94a3b8] hover:text-white hover:border-white/20",
                    phase !== "setup" && "cursor-not-allowed"
                  )}
                >
                  {pair}
                </button>
              ))}
            </div>
          </div>

          {/* Risk & Duration */}
          <div className="glass-card p-5">
            <div className="text-xs font-mono text-[#94a3b8] uppercase tracking-wider mb-3">
              Risk Profile
            </div>
            <div className="space-y-2 mb-4">
              {RISK_PROFILES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => phase === "setup" && setRiskProfile(r.value)}
                  disabled={phase !== "setup"}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                    riskProfile === r.value
                      ? "border-[#00d4ff]/30 bg-[#00d4ff]/05"
                      : "border-white/[0.06] hover:border-white/10",
                    phase !== "setup" && "cursor-not-allowed"
                  )}
                >
                  <div>
                    <div className={cn("text-sm font-medium", riskProfile === r.value ? "text-[#00d4ff]" : "text-white/80")}>{r.label}</div>
                    <div className="text-xs text-[#475569]">{r.desc}</div>
                  </div>
                  {riskProfile === r.value && <CheckCircle2 className="w-4 h-4 text-[#00d4ff]" />}
                </button>
              ))}
            </div>

            <div className="text-xs font-mono text-[#94a3b8] uppercase tracking-wider mb-2">
              Duration
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => phase === "setup" && setDuration(d.value)}
                  disabled={phase !== "setup"}
                  className={cn(
                    "py-2 rounded-lg text-xs font-mono transition-all border",
                    duration === d.value
                      ? "border-[#7c3aed]/40 bg-[#7c3aed]/10 text-[#7c3aed]"
                      : "border-white/[0.06] text-[#94a3b8] hover:text-white"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {phase === "setup" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPhase("decision")}
              className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2"
            >
              <Activity className="w-5 h-5" />
              Enter the Arena
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Right battle panel */}
        <div className="lg:col-span-3 space-y-5">
          <AnimatePresence mode="wait">
            {/* DECISION PHASE */}
            {phase === "decision" && (
              <motion.div
                key="decision"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-5"
              >
                <div className="glass-card p-5 text-center">
                  <div className="text-xs font-mono text-[#fbbf24] mb-2 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#fbbf24] animate-pulse" />
                    DECISION REQUIRED
                  </div>
                  <div className="text-xl font-bold text-white mb-1">
                    {selectedPair} — What's your move?
                  </div>
                  <div className="text-sm text-[#94a3b8]">
                    {selectedAgent.name} is already analyzing the same data.
                  </div>
                  {countdown > 0 && (
                    <div className="mt-3 text-3xl font-bold font-mono" style={{
                      color: countdown <= 2 ? "#ff3366" : "#00d4ff"
                    }}>
                      {countdown}s
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(["BUY", "SELL", "HOLD"] as Decision[]).map((d) => (
                    <DecisionButton key={d} decision={d} selected={false} onClick={() => handleDecision(d)} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* AI THINKING PHASE */}
            {phase === "ai-thinking" && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="glass-card p-4 flex items-center gap-3 border-[#7c3aed]/20">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${selectedAgent.color}20` }}>
                    <Brain className="w-5 h-5" style={{ color: selectedAgent.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: selectedAgent.color }}>
                      {selectedAgent.name} is analyzing...
                    </div>
                    <div className="text-xs text-[#94a3b8]">Your decision: <span className="font-mono font-bold text-white">{humanDecision}</span></div>
                  </div>
                  <div className="ml-auto flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ backgroundColor: selectedAgent.color, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>

                <ThinkingTerminal steps={thinkingSteps} agent={selectedAgent} />
              </motion.div>
            )}

            {/* SIMULATION PHASE */}
            {(phase === "simulation" || phase === "verdict") && result && (
              <motion.div
                key="simulation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Live comparison header */}
                <div className="glass-card p-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-[#94a3b8] font-mono mb-1">YOU ({humanDecision})</div>
                    <div className={cn(
                      "text-2xl font-bold font-mono",
                      (visibleSimData[visibleSimData.length - 1]?.humanPnl ?? 0) >= 0 ? "text-[#00ff9d]" : "text-[#ff3366]"
                    )}>
                      {formatPnl(visibleSimData[visibleSimData.length - 1]?.humanPnl ?? 0)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono mb-1" style={{ color: `${selectedAgent.color}90` }}>
                      {selectedAgent.name} ({aiDecision})
                    </div>
                    <div className={cn(
                      "text-2xl font-bold font-mono",
                      (visibleSimData[visibleSimData.length - 1]?.aiPnl ?? 0) >= 0 ? "text-[#00ff9d]" : "text-[#ff3366]"
                    )}>
                      {formatPnl(visibleSimData[visibleSimData.length - 1]?.aiPnl ?? 0)}
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="glass-card p-4">
                  <div className="text-xs font-mono text-[#475569] uppercase tracking-wider mb-3">
                    Live P&L Comparison
                  </div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={visibleSimData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="humanGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00ff9d" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#00ff9d" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={selectedAgent.color} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={selectedAgent.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis tickFormatter={(v) => `${v.toFixed(1)}%`} tick={{ fontSize: 9, fill: "#475569" }} />
                        <Tooltip
                          contentStyle={{ background: "#0a1020", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                          formatter={(value: number, name: string) => [
                            `${value.toFixed(2)}%`,
                            name === "humanPnl" ? "You" : selectedAgent.name,
                          ]}
                        />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                        <Area type="monotone" dataKey="humanPnl" stroke="#00ff9d" strokeWidth={2} fill="url(#humanGrad)" dot={false} name="humanPnl" />
                        <Area type="monotone" dataKey="aiPnl" stroke={selectedAgent.color} strokeWidth={2} fill="url(#aiGrad)" dot={false} name="aiPnl" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {phase === "verdict" && result && (
                  <VerdictReveal result={result} agent={selectedAgent} onReset={handleReset} />
                )}
              </motion.div>
            )}

            {/* DEFAULT SETUP VIEW */}
            {phase === "setup" && (
              <motion.div
                key="setup-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-8 flex flex-col items-center justify-center text-center min-h-[300px] gap-4"
                style={{ borderColor: `${selectedAgent.color}15` }}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${selectedAgent.color}15`, border: `1px solid ${selectedAgent.color}30` }}>
                  <Brain className="w-8 h-8" style={{ color: selectedAgent.color }} />
                </div>
                <div>
                  <div className="text-xl font-bold font-mono mb-1" style={{ color: selectedAgent.color }}>
                    {selectedAgent.name}
                  </div>
                  <div className="text-sm text-[#94a3b8] mb-1">{selectedAgent.tagline}</div>
                  <div className="text-xs text-[#475569]">
                    Win Rate: <span className="text-white font-mono">{selectedAgent.winRate}%</span>
                    {" · "}
                    {selectedAgent.totalTrades.toLocaleString()} trades
                  </div>
                </div>
                <div className="max-w-xs text-sm text-[#94a3b8] leading-relaxed">
                  {selectedAgent.description.slice(0, 100)}...
                </div>
                <div className="text-xs text-[#475569] font-mono">
                  Configure your challenge on the left, then enter the arena.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
