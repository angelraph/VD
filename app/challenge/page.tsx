"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, TrendingUp, TrendingDown, Minus, ExternalLink,
  RotateCcw, CheckCircle2, Shield, HelpCircle, Share2,
  AlertCircle, ArrowRight, ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { AGENTS, AGENT_QUOTES } from "@/lib/agents";
import { generateThinkingSteps, computeAiDecision, runSimulation } from "@/lib/simulation";
import { mockSubmitChallenge, getMantleExplorerUrl } from "@/lib/mantle";
import { recordVerdictOnChain, isContractDeployed, switchToMantle } from "@/lib/contract";
import { useWallet } from "@/hooks/useWallet";
import type { Agent, Decision, Duration, RiskProfile, TradingPair, ChallengeResult, ThinkingStep } from "@/types";
import { cn, formatPnl, sleep } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────

const PAIRS: TradingPair[] = ["ETH/USDT", "BTC/USDT", "MNT/USDT", "ARB/USDT", "LINK/USDT"];
const RISK_PROFILES: { value: RiskProfile; label: string; desc: string }[] = [
  { value: "conservative", label: "Conservative", desc: "Lower risk, steady gains" },
  { value: "balanced",     label: "Balanced",     desc: "Moderate risk & reward" },
  { value: "aggressive",   label: "Aggressive",   desc: "High risk, high reward" },
];
const DURATIONS: { value: Duration; label: string }[] = [
  { value: "1m",  label: "1 Min"  },
  { value: "5m",  label: "5 Min"  },
  { value: "15m", label: "15 Min" },
  { value: "1h",  label: "1 Hour" },
];

type WizardPhase =
  | "select-agent"
  | "select-battlefield"
  | "decision"
  | "ai-thinking"
  | "simulation"
  | "verdict";

const WIZARD_STEPS: { phase: WizardPhase; label: string }[] = [
  { phase: "select-agent",      label: "Opponent"   },
  { phase: "select-battlefield",label: "Battlefield" },
  { phase: "decision",          label: "Decision"   },
  { phase: "ai-thinking",       label: "Analysis"   },
  { phase: "simulation",        label: "Race"       },
  { phase: "verdict",           label: "Verdict"    },
];

// ── Animation variants ────────────────────────────────────────────────────────

const stepVariants = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -20, scale: 0.97, transition: { duration: 0.25 } },
};

// ── Step indicator ─────────────────────────────────────────────────────────────

function StepDots({ phase }: { phase: WizardPhase }) {
  const current = WIZARD_STEPS.findIndex((s) => s.phase === phase);
  return (
    <div className="fixed top-16 left-0 right-0 z-30 flex items-center justify-center gap-0 bg-[#020917]/80 backdrop-blur-sm border-b border-white/[0.05] px-4 py-3">
      {WIZARD_STEPS.map((step, i) => {
        const isDone    = i < current;
        const isActive  = i === current;
        return (
          <div key={step.phase} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all duration-300",
                isActive ? "bg-[#00d4ff] text-[#020917] shadow-[0_0_12px_rgba(0,212,255,0.5)]" :
                isDone   ? "bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40" :
                           "bg-white/[0.05] text-[#475569] border border-white/[0.08]"
              )}>
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={cn(
                "text-[9px] font-mono uppercase tracking-widest hidden sm:block",
                isActive ? "text-[#00d4ff]" : isDone ? "text-[#00ff9d]" : "text-[#475569]"
              )}>
                {step.label}
              </span>
            </div>
            {i < WIZARD_STEPS.length - 1 && (
              <div className={cn(
                "w-6 sm:w-10 h-px mx-1 transition-all duration-500",
                i < current ? "bg-[#00ff9d]/40" : "bg-white/[0.08]"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Shared full-screen wrapper ─────────────────────────────────────────────────

function StepShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "min-h-[calc(100vh-112px)] flex flex-col items-center justify-center px-4 sm:px-8 py-12 max-w-5xl mx-auto w-full",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// ── Step label helper ─────────────────────────────────────────────────────────

function StepLabel({ num, total, text }: { num: number; total: number; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 text-xs font-mono text-[#475569] uppercase tracking-[0.2em]">
      <span className="text-[#00d4ff]">Step {num}</span>
      <span>/</span>
      <span>{total}</span>
      <span className="mx-2 text-white/20">—</span>
      <span>{text}</span>
    </div>
  );
}

// ── STEP 1: Select Agent ──────────────────────────────────────────────────────

function SelectAgentStep({
  selected, turingMode, onSelect, onToggleTuring, onNext,
}: {
  selected: Agent; turingMode: boolean;
  onSelect: (a: Agent) => void; onToggleTuring: () => void; onNext: () => void;
}) {
  return (
    <StepShell>
      <StepLabel num={1} total={3} text="Choose your opponent" />

      <h1 className="text-4xl sm:text-6xl font-bold text-white text-center mb-2">
        Who do you <span className="text-gradient-verdict">dare</span> to face?
      </h1>
      <p className="text-[#94a3b8] text-center mb-10 max-w-xl">
        Each agent has a distinct strategy, a verifiable track record, and something to say about you.
      </p>

      {/* Turing Mode toggle */}
      <button
        onClick={onToggleTuring}
        className={cn(
          "flex items-center gap-2.5 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 mb-8",
          turingMode
            ? "border-[#7c3aed]/50 bg-[#7c3aed]/15 text-[#7c3aed] shadow-glow-violet"
            : "border-white/10 text-[#94a3b8] hover:border-[#7c3aed]/30 hover:text-[#7c3aed]"
        )}
      >
        <HelpCircle className="w-4 h-4" />
        {turingMode ? "Turing Mode ON — opponent hidden" : "Enable Turing Mode"}
        {turingMode && <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] animate-pulse" />}
      </button>

      {turingMode ? (
        /* Mystery card */
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm glass-card p-10 flex flex-col items-center gap-4 border-[#7c3aed]/30 mb-10"
        >
          <div className="w-16 h-16 rounded-2xl border-2 border-[#7c3aed]/40 border-dashed flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-[#7c3aed]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#7c3aed]">UNKNOWN</div>
          <p className="text-sm text-[#94a3b8] text-center">
            AI or Human — you won't know until the Verdict is revealed.
            <br />
            <span className="text-[#7c3aed] font-semibold">This is the Turing Test.</span>
          </p>
        </motion.div>
      ) : (
        /* Agent grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full mb-10">
          {AGENTS.map((agent, i) => {
            const isSelected = selected.id === agent.id;
            return (
              <motion.button
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(agent)}
                className={cn(
                  "relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-left transition-all duration-200 group",
                  isSelected
                    ? "bg-white/[0.06]"
                    : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                )}
                style={isSelected ? {
                  borderColor: `${agent.color}50`,
                  boxShadow: `0 0 24px ${agent.color}20`,
                } : undefined}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3">
                    <CheckCircle2 className="w-4 h-4" style={{ color: agent.color }} />
                  </span>
                )}
                {/* Win rate arc */}
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
                    <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                    <circle
                      cx="30" cy="30" r="26" fill="none"
                      stroke={agent.color} strokeWidth="5"
                      strokeDasharray={`${(agent.winRate / 100) * 163.4} 163.4`}
                      strokeLinecap="round"
                      style={{ filter: `drop-shadow(0 0 4px ${agent.color})` }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold font-mono" style={{ color: agent.color }}>
                      {agent.winRate}%
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-base font-bold font-mono mb-0.5" style={{ color: isSelected ? agent.color : "#f0f4ff" }}>
                    {agent.name}
                  </div>
                  <div className="text-[10px] text-[#475569] leading-tight">{agent.strategy}</div>
                </div>

                {/* Quote on hover */}
                <div className="text-[10px] text-[#94a3b8] italic text-center leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-200 line-clamp-3">
                  "{AGENT_QUOTES[agent.id]}"
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        className="btn-primary px-10 py-4 text-base flex items-center gap-3"
      >
        {turingMode ? "Accept the Challenge" : `Challenge ${selected.name}`}
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </StepShell>
  );
}

// ── STEP 2: Select Battlefield ────────────────────────────────────────────────

function SelectBattlefieldStep({
  agent, turingMode, pair, risk, duration,
  onPair, onRisk, onDuration, onBack, onNext,
}: {
  agent: Agent; turingMode: boolean;
  pair: TradingPair; risk: RiskProfile; duration: Duration;
  onPair: (p: TradingPair) => void; onRisk: (r: RiskProfile) => void;
  onDuration: (d: Duration) => void; onBack: () => void; onNext: () => void;
}) {
  return (
    <StepShell>
      <StepLabel num={2} total={3} text="Set the terms" />

      <h1 className="text-4xl sm:text-6xl font-bold text-white text-center mb-2">
        Pick your <span className="text-gradient-verdict">battlefield</span>
      </h1>
      <p className="text-[#94a3b8] text-center mb-10">
        {turingMode
          ? "Your hidden opponent is waiting. Choose your terms."
          : `${agent.name} has agreed to the fight. You choose the conditions.`}
      </p>

      <div className="w-full max-w-2xl space-y-8">
        {/* Trading pair */}
        <div>
          <div className="text-xs font-mono text-[#94a3b8] uppercase tracking-widest mb-3">Trading Pair</div>
          <div className="flex flex-wrap gap-3">
            {PAIRS.map((p) => (
              <button
                key={p}
                onClick={() => onPair(p)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-mono font-bold border-2 transition-all duration-200",
                  pair === p
                    ? "border-[#00d4ff] bg-[#00d4ff]/15 text-[#00d4ff] shadow-[0_0_12px_rgba(0,212,255,0.25)]"
                    : "border-white/10 text-[#94a3b8] hover:border-white/20 hover:text-white"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Risk profile */}
        <div>
          <div className="text-xs font-mono text-[#94a3b8] uppercase tracking-widest mb-3">Risk Profile</div>
          <div className="grid grid-cols-3 gap-3">
            {RISK_PROFILES.map((r) => (
              <button
                key={r.value}
                onClick={() => onRisk(r.value)}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all duration-200",
                  risk === r.value
                    ? "border-[#7c3aed]/60 bg-[#7c3aed]/15 shadow-[0_0_12px_rgba(124,58,237,0.2)]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                )}
              >
                <div className={cn("text-sm font-bold mb-0.5", risk === r.value ? "text-[#7c3aed]" : "text-white")}>
                  {r.label}
                </div>
                <div className="text-xs text-[#475569]">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <div className="text-xs font-mono text-[#94a3b8] uppercase tracking-widest mb-3">Duration</div>
          <div className="flex gap-3">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => onDuration(d.value)}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-mono font-bold border-2 transition-all duration-200",
                  duration === d.value
                    ? "border-[#fbbf24]/60 bg-[#fbbf24]/10 text-[#fbbf24]"
                    : "border-white/[0.08] text-[#94a3b8] hover:border-white/20 hover:text-white"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-10">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl text-sm font-semibold border border-white/10 text-[#94a3b8] hover:text-white hover:border-white/20 transition-all"
        >
          ← Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="btn-primary px-10 py-4 text-base flex items-center gap-3"
        >
          Enter the Arena
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </StepShell>
  );
}

// ── STEP 3: Decision ──────────────────────────────────────────────────────────

function DecisionStep({
  agent, pair, turingMode, countdown, onDecision,
}: {
  agent: Agent; pair: TradingPair; turingMode: boolean;
  countdown: number; onDecision: (d: Decision) => void;
}) {
  const buttons: { d: Decision; color: string; bg: string; Icon: React.ElementType; label: string; sub: string }[] = [
    { d: "BUY",  color: "#00ff9d", bg: "rgba(0,255,157,0.08)",  Icon: TrendingUp,   label: "BUY",  sub: "Go Long"    },
    { d: "SELL", color: "#ff3366", bg: "rgba(255,51,102,0.08)", Icon: TrendingDown, label: "SELL", sub: "Go Short"   },
    { d: "HOLD", color: "#fbbf24", bg: "rgba(251,191,36,0.08)", Icon: Minus,        label: "HOLD", sub: "Stay Flat"  },
  ];

  return (
    <StepShell className="gap-0">
      {/* Context bar */}
      <div className="flex items-center gap-3 mb-8 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: turingMode ? "#7c3aed" : agent.color, boxShadow: `0 0 8px ${turingMode ? "#7c3aed" : agent.color}` }}
        />
        <span className="text-xs font-mono text-[#94a3b8]">
          {turingMode ? "UNKNOWN OPPONENT" : agent.name} is already analyzing
        </span>
        <span className="ml-auto text-xs font-mono text-[#475569]">{pair}</span>
      </div>

      {/* Countdown */}
      <div className="mb-6 text-center">
        <div
          className={cn(
            "text-7xl sm:text-9xl font-bold font-mono leading-none transition-colors duration-300",
            countdown <= 2 ? "text-[#ff3366]" : countdown <= 3 ? "text-[#fbbf24]" : "text-[#00d4ff]"
          )}
          style={{ textShadow: `0 0 40px ${countdown <= 2 ? "rgba(255,51,102,0.4)" : "rgba(0,212,255,0.3)"}` }}
        >
          {countdown > 0 ? countdown : "GO"}
        </div>
        <div className="text-[#94a3b8] text-sm mt-2 font-mono uppercase tracking-widest">
          seconds to decide
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
        What's your move on <span className="font-mono" style={{ color: agent.color }}>{pair}</span>?
      </h2>

      {/* Decision buttons */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
        {buttons.map(({ d, color, bg, Icon, label, sub }) => (
          <motion.button
            key={d}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onDecision(d)}
            className="flex flex-col items-center justify-center gap-3 py-8 sm:py-12 rounded-2xl border-2 transition-all duration-200"
            style={{ borderColor: `${color}30`, backgroundColor: bg }}
            onHoverStart={(e) => {
              (e.target as HTMLElement).style.borderColor = `${color}60`;
              (e.target as HTMLElement).style.boxShadow = `0 0 30px ${color}20`;
            }}
            onHoverEnd={(e) => {
              (e.target as HTMLElement).style.borderColor = `${color}30`;
              (e.target as HTMLElement).style.boxShadow = "none";
            }}
          >
            <Icon className="w-8 h-8 sm:w-10 sm:h-10" style={{ color }} />
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-widest" style={{ color }}>
                {label}
              </div>
              <div className="text-xs text-[#475569] mt-0.5">{sub}</div>
            </div>
          </motion.button>
        ))}
      </div>

      <p className="text-xs text-[#475569] mt-8 font-mono">
        Your decision is final. The algorithm is waiting.
      </p>
    </StepShell>
  );
}

// ── STEP 4: AI Thinking ───────────────────────────────────────────────────────

function ThinkingStep({
  steps, agent, humanDecision, turingMode,
}: {
  steps: ThinkingStep[]; agent: Agent; humanDecision: Decision; turingMode: boolean;
}) {
  const [completed, setCompleted] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let idx = 0;
    const advance = () => {
      if (idx >= steps.length) return;
      setTimeout(() => {
        setCompleted((prev) => [...prev, idx]);
        idx++;
        if (idx < steps.length) { setCurrent(idx); advance(); }
      }, steps[idx].duration);
    };
    advance();
  }, [steps]);

  return (
    <StepShell>
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: turingMode ? "rgba(124,58,237,0.2)" : `${agent.color}20` }}
          >
            <Brain className="w-6 h-6" style={{ color: turingMode ? "#7c3aed" : agent.color }} />
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: turingMode ? "#7c3aed" : agent.color }}>
              {turingMode ? "Opponent is deciding..." : `${agent.name} is analyzing...`}
            </div>
            <div className="text-sm text-[#94a3b8]">
              Your call: <span className="font-mono font-bold text-white">{humanDecision}</span>
            </div>
          </div>
          <div className="ml-auto flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: turingMode ? "#7c3aed" : agent.color, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>

        {/* Terminal */}
        <div className="glass-card p-5 font-mono text-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff3366]/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ff9d]/70" />
            </div>
            <span className="text-[#475569] uppercase tracking-widest text-[10px]">
              {turingMode ? "OPPONENT ANALYSIS ENGINE" : `${agent.name} ANALYSIS ENGINE`}
            </span>
          </div>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: i <= current ? 1 : 0.2, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-2"
              >
                <span
                  className="mt-0.5 flex-shrink-0 transition-all duration-300"
                  style={{ color: completed.includes(i) ? agent.color : "#475569" }}
                >
                  {completed.includes(i) ? "✓" : i === current ? "▶" : "○"}
                </span>
                <div>
                  <span className="transition-colors duration-300" style={{ color: completed.includes(i) ? "#f0f4ff" : "#94a3b8" }}>
                    {step.label}
                  </span>
                  {completed.includes(i) && (
                    <span className="text-[#475569] ml-2">— {step.detail}</span>
                  )}
                </div>
              </motion.div>
            ))}
            {completed.length < steps.length && (
              <div className="flex items-center gap-1 text-[#94a3b8] mt-1">
                <span className="inline-block w-2 h-3 bg-[#00d4ff] animate-pulse rounded-sm" />
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[#475569] font-mono mt-4">
          Processing market signals on {turingMode ? "Mantle" : `${agent.name}'s neural network`}...
        </p>
      </div>
    </StepShell>
  );
}

// ── STEP 5: Simulation ────────────────────────────────────────────────────────

function SimulationStep({
  result, agent, aiDecision, humanDecision, simIndex,
}: {
  result: ChallengeResult; agent: Agent; aiDecision: Decision;
  humanDecision: Decision; simIndex: number;
}) {
  const visibleData = result.simulationData.slice(0, Math.max(2, simIndex));
  const lastHuman = visibleData[visibleData.length - 1]?.humanPnl ?? 0;
  const lastAi    = visibleData[visibleData.length - 1]?.aiPnl ?? 0;
  const isHumanLeading = lastHuman >= lastAi;

  return (
    <StepShell>
      <div className="w-full max-w-3xl">
        {/* Score cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={cn(
            "glass-card p-5 text-center transition-all duration-300",
            isHumanLeading ? "border-[#00ff9d]/30 shadow-[0_0_20px_rgba(0,255,157,0.1)]" : ""
          )}>
            <div className="text-xs font-mono text-[#94a3b8] mb-1 uppercase tracking-wider">You ({humanDecision})</div>
            <div className={cn(
              "text-4xl font-bold font-mono transition-all duration-500",
              lastHuman >= 0 ? "text-[#00ff9d]" : "text-[#ff3366]"
            )}>
              {formatPnl(lastHuman)}
            </div>
            {isHumanLeading && (
              <div className="text-[10px] text-[#00ff9d] font-mono mt-1 animate-pulse">▲ LEADING</div>
            )}
          </div>
          <div className={cn(
            "glass-card p-5 text-center transition-all duration-300",
            !isHumanLeading ? "shadow-[0_0_20px_rgba(255,51,102,0.1)]" : ""
          )}
            style={!isHumanLeading ? { borderColor: `${agent.color}30` } : undefined}
          >
            <div className="text-xs font-mono mb-1 uppercase tracking-wider" style={{ color: `${agent.color}90` }}>
              {agent.name} ({aiDecision})
            </div>
            <div className={cn(
              "text-4xl font-bold font-mono transition-all duration-500",
              lastAi >= 0 ? "text-[#00ff9d]" : "text-[#ff3366]"
            )}>
              {formatPnl(lastAi)}
            </div>
            {!isHumanLeading && (
              <div className="text-[10px] font-mono mt-1 animate-pulse" style={{ color: agent.color }}>▲ LEADING</div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="glass-card p-5">
          <div className="text-xs font-mono text-[#475569] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff3366] animate-pulse" />
            Live P&L Race
          </div>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visibleData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="humanG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00ff9d" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00ff9d" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="aiG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={agent.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={agent.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis tickFormatter={(v) => `${v.toFixed(1)}%`} tick={{ fontSize: 9, fill: "#475569" }} />
                <Tooltip
                  contentStyle={{ background: "#0a1020", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                  formatter={(v: number, n: string) => [`${v.toFixed(2)}%`, n === "humanPnl" ? "You" : agent.name]}
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="humanPnl" stroke="#00ff9d" strokeWidth={2.5} fill="url(#humanG)" dot={false} />
                <Area type="monotone" dataKey="aiPnl"    stroke={agent.color} strokeWidth={2.5} fill="url(#aiG)"    dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-3 justify-center text-xs font-mono">
            <span className="flex items-center gap-1.5 text-[#00ff9d]">
              <span className="w-3 h-0.5 bg-[#00ff9d] rounded" /> You
            </span>
            <span className="flex items-center gap-1.5" style={{ color: agent.color }}>
              <span className="w-3 h-0.5 rounded" style={{ backgroundColor: agent.color }} /> {agent.name}
            </span>
          </div>
        </div>
      </div>
    </StepShell>
  );
}

// ── STEP 6: Verdict ───────────────────────────────────────────────────────────

function VerdictReveal({
  result, agent, pair, turingMode, turingIsAI, onReset,
}: {
  result: ChallengeResult; agent: Agent; pair: TradingPair;
  turingMode: boolean; turingIsAI: boolean; onReset: () => void;
}) {
  const { isConnected, isWrongNetwork, connect } = useWallet();
  const [txSubmitted, setTxSubmitted]   = useState(false);
  const [txHash, setTxHash]             = useState<string | null>(null);
  const [txBlock, setTxBlock]           = useState<number | null>(null);
  const [explorerUrl, setExplorerUrl]   = useState<string | null>(null);
  const [txError, setTxError]           = useState<string | null>(null);
  const [isOnChain, setIsOnChain]       = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [turingRevealed, setTuringRevealed] = useState(false);

  const contractDeployed = isContractDeployed();
  const isAiWinner    = result.winner === "ai";
  const isHumanWinner = result.winner === "human";

  useEffect(() => {
    if (contractDeployed) return;
    const run = async () => {
      await sleep(1500);
      const tx = await mockSubmitChallenge(agent.id, pair, result.aiDecision);
      setTxHash(tx.hash);
      setExplorerUrl(getMantleExplorerUrl(tx.hash));
      setTxBlock(result.blockNumber ?? null);
      setTxSubmitted(true);
    };
    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (turingMode) {
      const t = setTimeout(() => setTuringRevealed(true), 2000);
      return () => clearTimeout(t);
    }
  }, [turingMode]);

  const handleRecordOnChain = async () => {
    setSubmitting(true);
    setTxError(null);
    try {
      const receipt = await recordVerdictOnChain({
        agentName: agent.id, pair,
        humanReturn: result.humanReturn,
        aiReturn: result.aiReturn,
        winner: result.winner,
      });
      setTxHash(receipt.txHash);
      setTxBlock(receipt.blockNumber);
      setExplorerUrl(receipt.explorerUrl);
      setIsOnChain(true);
      setTxSubmitted(true);
    } catch (err: any) {
      setTxError((err?.message ?? "Transaction failed").slice(0, 80));
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
  const sharePageUrl = `https://vd-o8ml.vercel.app/share?winner=${result.winner}&pair=${encodeURIComponent(pair)}&human=${result.humanReturn.toFixed(2)}&ai=${result.aiReturn.toFixed(2)}&agent=${encodeURIComponent(agent.name)}`;

  const shareText = isHumanWinner
    ? `Just beat an AI at its own game 🏆\n\nMe: ${fmt(result.humanReturn)} vs ${agent.name} AI: ${fmt(result.aiReturn)}\nPair: ${pair} — verdict locked on @0xMantle forever\n\nThink you can do it? 👇\n#VERDICTProtocol #Mantle #DeFi`
    : isAiWinner
    ? `The AI won this round 🤖\n\n${agent.name} AI: ${fmt(result.aiReturn)} vs Me: ${fmt(result.humanReturn)}\nPair: ${pair} on @0xMantle\n\nRematch incoming — you try:\n#VERDICTProtocol #Mantle #DeFi`
    : `Tied an AI in a live trading battle 🤝\n\nBoth got ${fmt(result.humanReturn)} on ${pair}\nWhen human intuition meets machine logic on @0xMantle\n\nCan YOU tell the difference?\n#VERDICTProtocol #Mantle #DeFi`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(sharePageUrl)}`;

  return (
    <StepShell>
      <div className="w-full max-w-lg space-y-5">
        {/* Verdict banner */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative overflow-hidden rounded-2xl p-8 text-center border"
          style={{
            borderColor: isHumanWinner ? "rgba(0,255,157,0.4)" : isAiWinner ? "rgba(255,51,102,0.4)" : "rgba(251,191,36,0.4)",
            background:  isHumanWinner ? "rgba(0,255,157,0.07)" : isAiWinner ? "rgba(255,51,102,0.07)" : "rgba(251,191,36,0.07)",
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="text-6xl mb-3"
          >
            {isHumanWinner ? "🏆" : isAiWinner ? "🤖" : "🤝"}
          </motion.div>
          <div className="text-3xl font-bold text-white mb-2">
            {isHumanWinner ? "You Win!" : isAiWinner ? `${agent.name} Wins` : "Tie Game"}
          </div>
          <div className="text-sm text-[#94a3b8]">
            {isHumanWinner ? "You beat the machine. Exceptional call." :
             isAiWinner    ? "The algorithm prevailed this time." :
                             "Minds think alike — both chose correctly."}
          </div>
        </motion.div>

        {/* Turing reveal */}
        {turingMode && (
          <div className="glass-card p-5 border border-[#7c3aed]/30">
            <div className="text-xs font-mono text-[#7c3aed] uppercase tracking-widest mb-3 flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" /> Turing Reveal
            </div>
            <AnimatePresence mode="wait">
              {!turingRevealed ? (
                <motion.div key="hidden" className="flex items-center justify-center gap-2 py-3">
                  {[0,1,2,3,4].map((i) => (
                    <motion.span key={i} className="text-xl font-bold font-mono text-[#475569]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}>?</motion.span>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="revealed"
                  initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                  className="flex items-center gap-4 p-3 rounded-xl border"
                  style={{
                    borderColor: turingIsAI ? `${agent.color}40` : "rgba(0,255,157,0.3)",
                    backgroundColor: turingIsAI ? `${agent.color}08` : "rgba(0,255,157,0.05)",
                  }}
                >
                  <div className="text-4xl">{turingIsAI ? "🤖" : "👤"}</div>
                  <div>
                    <div className="text-lg font-bold mb-0.5" style={{ color: turingIsAI ? agent.color : "#00ff9d" }}>
                      {turingIsAI ? agent.name : "Human Trader"}
                    </div>
                    <div className="text-xs text-[#94a3b8]">
                      {turingIsAI ? "You were facing a machine. Could you tell?" : "Another human challenger. Did you suspect?"}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Score comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 text-center">
            <div className="text-xs font-mono text-[#94a3b8] mb-1 uppercase">You ({result.humanDecision})</div>
            <div className={cn("text-2xl font-bold font-mono", result.humanReturn >= 0 ? "text-[#00ff9d]" : "text-[#ff3366]")}>
              {formatPnl(result.humanReturn)}
            </div>
          </div>
          <div className="glass-card p-4 text-center" style={{ borderColor: `${agent.color}20` }}>
            <div className="text-xs font-mono mb-1 uppercase" style={{ color: `${agent.color}90` }}>{agent.name} ({result.aiDecision})</div>
            <div className={cn("text-2xl font-bold font-mono", result.aiReturn >= 0 ? "text-[#00ff9d]" : "text-[#ff3366]")}>
              {formatPnl(result.aiReturn)}
            </div>
          </div>
        </div>

        {/* AI reasoning */}
        <div className="glass-card p-4">
          <div className="text-xs font-mono text-[#94a3b8] uppercase tracking-wider mb-3">{agent.name} Reasoning</div>
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
            <span className="text-xs font-mono text-[#00d4ff] uppercase tracking-wider">On-Chain Proof</span>
            {isOnChain && (
              <span className="ml-auto text-[10px] font-mono text-[#00ff9d] bg-[#00ff9d]/10 px-2 py-0.5 rounded-full border border-[#00ff9d]/20">LIVE</span>
            )}
          </div>

          {!contractDeployed && !txSubmitted && (
            <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
              <span className="w-3 h-3 rounded-full border-2 border-[#00d4ff]/30 border-t-[#00d4ff] animate-spin" />
              Submitting to Mantle...
            </div>
          )}

          {contractDeployed && !txSubmitted && !submitting && (
            <div className="space-y-2">
              {!isConnected ? (
                <>
                  <p className="text-xs text-[#94a3b8] mb-2">Connect wallet to record permanently on Mantle Sepolia.</p>
                  <button onClick={connect} className="w-full py-2 rounded-xl text-xs font-semibold border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all">
                    Connect Wallet to Record
                  </button>
                </>
              ) : isWrongNetwork ? (
                <>
                  <p className="text-xs text-[#94a3b8] mb-2">Switch to Mantle Sepolia to record on-chain.</p>
                  <button onClick={switchToMantle} className="w-full py-2 rounded-xl text-xs font-semibold border border-[#fbbf24]/30 text-[#fbbf24] hover:bg-[#fbbf24]/10 transition-all">
                    Switch to Mantle Sepolia
                  </button>
                </>
              ) : (
                <button onClick={handleRecordOnChain} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#00d4ff]/10 to-[#7c3aed]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:from-[#00d4ff]/20 hover:to-[#7c3aed]/20 transition-all flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" /> Record Verdict on Mantle
                </button>
              )}
            </div>
          )}

          {submitting && (
            <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
              <span className="w-3 h-3 rounded-full border-2 border-[#00d4ff]/30 border-t-[#00d4ff] animate-spin" />
              Submitting to Mantle Sepolia...
            </div>
          )}

          {txError && (
            <div className="flex items-center gap-2 text-xs text-[#ff3366]">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {txError}
            </div>
          )}

          {txSubmitted && txHash && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#475569]">Tx Hash</span>
                <a href={explorerUrl ?? getMantleExplorerUrl(txHash)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-mono text-[#00d4ff] hover:text-white transition-colors">
                  {txHash.slice(0, 14)}...{txHash.slice(-6)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {txBlock && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#475569]">Block</span>
                  <span className="text-xs font-mono text-white">#{txBlock}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff9d]" />
                <span className="text-xs text-[#00ff9d]">
                  {isOnChain ? "Permanently on Mantle Sepolia" : "Recorded on Mantle Sepolia"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button onClick={onReset} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border border-white/10 text-[#94a3b8] hover:text-white hover:border-white/20 transition-all">
            <RotateCcw className="w-4 h-4" /> Again
          </button>
          <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-[#7c3aed]/20 text-[#7c3aed] hover:bg-[#7c3aed]/10 transition-all">
            <Share2 className="w-4 h-4" /> Share
          </a>
          <a href="/leaderboard"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-[#00d4ff]/20 text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all">
            Leaderboard <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </StepShell>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ChallengePage() {
  const [phase, setPhase]               = useState<WizardPhase>("select-agent");
  const [turingMode, setTuringMode]     = useState(false);
  const [turingIsAI]                    = useState(() => Math.random() > 0.35);
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [selectedPair, setSelectedPair] = useState<TradingPair>("ETH/USDT");
  const [riskProfile, setRiskProfile]   = useState<RiskProfile>("balanced");
  const [duration, setDuration]         = useState<Duration>("5m");
  const [humanDecision, setHumanDecision] = useState<Decision | null>(null);
  const [aiDecision, setAiDecision]     = useState<Decision | null>(null);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [result, setResult]             = useState<ChallengeResult | null>(null);
  const [simIndex, setSimIndex]         = useState(0);
  const [countdown, setCountdown]       = useState(5);

  // Countdown timer for decision phase
  useEffect(() => {
    if (phase !== "decision") return;
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

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

    const sim = runSimulation(selectedAgent, selectedPair, decision, aiChoice, duration, riskProfile);
    setResult(sim);

    let idx = 0;
    const interval = setInterval(() => {
      idx += 2;
      setSimIndex(idx);
      if (idx >= sim.simulationData.length - 1) {
        clearInterval(interval);
        setTimeout(() => setPhase("verdict"), 600);
      }
    }, 80);
  };

  const handleReset = () => {
    setPhase("select-agent");
    setHumanDecision(null);
    setAiDecision(null);
    setResult(null);
    setSimIndex(0);
    setCountdown(5);
  };

  return (
    <div className="min-h-screen pt-28">
      <StepDots phase={phase} />

      <AnimatePresence mode="wait">
        {phase === "select-agent" && (
          <SelectAgentStep
            key="select-agent"
            selected={selectedAgent}
            turingMode={turingMode}
            onSelect={setSelectedAgent}
            onToggleTuring={() => setTuringMode((m) => !m)}
            onNext={() => setPhase("select-battlefield")}
          />
        )}

        {phase === "select-battlefield" && (
          <SelectBattlefieldStep
            key="select-battlefield"
            agent={selectedAgent}
            turingMode={turingMode}
            pair={selectedPair}
            risk={riskProfile}
            duration={duration}
            onPair={setSelectedPair}
            onRisk={setRiskProfile}
            onDuration={setDuration}
            onBack={() => setPhase("select-agent")}
            onNext={() => setPhase("decision")}
          />
        )}

        {phase === "decision" && (
          <DecisionStep
            key="decision"
            agent={selectedAgent}
            pair={selectedPair}
            turingMode={turingMode}
            countdown={countdown}
            onDecision={handleDecision}
          />
        )}

        {phase === "ai-thinking" && humanDecision && (
          <ThinkingStep
            key="ai-thinking"
            steps={thinkingSteps}
            agent={selectedAgent}
            humanDecision={humanDecision}
            turingMode={turingMode}
          />
        )}

        {phase === "simulation" && result && humanDecision && aiDecision && (
          <SimulationStep
            key="simulation"
            result={result}
            agent={selectedAgent}
            aiDecision={aiDecision}
            humanDecision={humanDecision}
            simIndex={simIndex}
          />
        )}

        {phase === "verdict" && result && (
          <VerdictReveal
            key="verdict"
            result={result}
            agent={selectedAgent}
            pair={selectedPair}
            turingMode={turingMode}
            turingIsAI={turingIsAI}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
