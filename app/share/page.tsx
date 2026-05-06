import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  searchParams: Promise<{
    winner?: string; pair?: string;
    human?: string; ai?: string; agent?: string;
  }>;
}

const BASE_URL = "https://vd-o8ml.vercel.app";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p      = await searchParams;
  const winner = p.winner ?? "human";
  const pair   = p.pair   ?? "ETH/USDT";
  const human  = parseFloat(p.human ?? "0");
  const ai     = parseFloat(p.ai    ?? "0");
  const agent  = p.agent  ?? "ORACLE";

  const fmt = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
  const isHuman = winner === "human";
  const isAi    = winner === "ai";

  const title = isHuman
    ? `🏆 Human beat ${agent} AI — ${fmt(human)} vs ${fmt(ai)}`
    : isAi
    ? `🤖 ${agent} AI wins — ${fmt(ai)} vs ${fmt(human)}`
    : `🤝 Tie on ${pair} — ${fmt(human)} each`;

  const description = isHuman
    ? `A human challenger just beat ${agent} AI on ${pair}. Return: ${fmt(human)} vs ${fmt(ai)}. Every verdict is permanently recorded on Mantle. Can you do the same?`
    : isAi
    ? `${agent} AI just beat a human challenger on ${pair}. AI return: ${fmt(ai)} vs human: ${fmt(human)}. On-chain proof on Mantle Sepolia. Think you can win?`
    : `Human and AI tied on ${pair} with ${fmt(human)} each. When intuition and algorithm agree, who's really in control? Find out on VERDICT Protocol.`;

  const ogImage = `${BASE_URL}/api/og?winner=${winner}&pair=${encodeURIComponent(pair)}&human=${human.toFixed(2)}&ai=${ai.toFixed(2)}&agent=${encodeURIComponent(agent)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/share?winner=${winner}&pair=${encodeURIComponent(pair)}&human=${human.toFixed(2)}&ai=${ai.toFixed(2)}&agent=${encodeURIComponent(agent)}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `VERDICT: ${title}` }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const p      = await searchParams;
  const winner = p.winner ?? "human";
  const pair   = p.pair   ?? "ETH/USDT";
  const human  = parseFloat(p.human ?? "0");
  const ai     = parseFloat(p.ai    ?? "0");
  const agent  = p.agent  ?? "ORACLE";

  const isHuman = winner === "human";
  const isAi    = winner === "ai";
  const fmt = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
  const accent = isHuman ? "#00ff9d" : isAi ? "#ff3366" : "#fbbf24";
  const emoji  = isHuman ? "🏆" : isAi ? "🤖" : "🤝";
  const label  = isHuman ? "Human Wins" : isAi ? `${agent} AI Wins` : "Tie";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Result card */}
        <div
          className="glass-card p-8 rounded-2xl border-2"
          style={{
            borderColor: `${accent}30`,
            background: `${accent}06`,
            boxShadow: `0 0 40px ${accent}15`,
          }}
        >
          <div className="text-6xl mb-4">{emoji}</div>
          <div className="text-3xl font-bold text-white mb-1">{label}</div>
          <div className="text-sm text-[#94a3b8] mb-6">{pair} · On Mantle Sepolia</div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="rounded-xl bg-white/[0.04] p-4">
              <div className="text-xs font-mono text-[#94a3b8] uppercase mb-1">Human</div>
              <div
                className="text-2xl font-bold font-mono"
                style={{ color: human >= 0 ? "#00ff9d" : "#ff3366" }}
              >
                {fmt(human)}
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-4">
              <div className="text-xs font-mono text-[#94a3b8] uppercase mb-1">{agent} AI</div>
              <div
                className="text-2xl font-bold font-mono"
                style={{ color: ai >= 0 ? "#00ff9d" : "#ff3366" }}
              >
                {fmt(ai)}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[#94a3b8] text-sm leading-relaxed">
            Every verdict is recorded permanently on Mantle Sepolia.{" "}
            <span className="text-white font-semibold">Can you beat the AI?</span>
          </p>

          <Link
            href="/challenge"
            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 rounded-xl"
          >
            Start Your Challenge →
          </Link>

          <Link
            href="/"
            className="block text-xs text-[#475569] hover:text-[#94a3b8] transition-colors font-mono"
          >
            vd-o8ml.vercel.app
          </Link>
        </div>
      </div>
    </div>
  );
}
