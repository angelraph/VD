import Link from "next/link";
import { Activity } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-base tracking-wider">
                VER<span className="text-gradient-blue">DICT</span>
                <span className="text-[#94a3b8] font-normal text-sm ml-2">Protocol</span>
              </span>
            </div>
            <p className="text-sm text-[#94a3b8] leading-relaxed max-w-xs">
              The transparent on-chain arena where human intuition meets machine intelligence.
              Every decision immortalized on Mantle.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-[#94a3b8] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#00ff9d] shadow-[0_0_6px_rgba(0,255,157,0.6)]" />
              <span>Live on Mantle Sepolia Testnet</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-4">
              Platform
            </div>
            <ul className="space-y-2.5">
              {[
                { href: "/arena", label: "Agent Arena" },
                { href: "/challenge", label: "Challenge Simulator" },
                { href: "/ledger", label: "Reputation Ledger" },
                { href: "/explainability", label: "Explainability Panel" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#94a3b8] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-4">
              Built With
            </div>
            <ul className="space-y-2.5">
              {["Mantle Testnet", "Next.js 15", "Framer Motion", "ethers.js", "TailwindCSS"].map(
                (tech) => (
                  <li key={tech} className="text-sm text-[#94a3b8] flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#00d4ff]/50" />
                    {tech}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[#475569] font-mono">
            © 2025 VERDICT Protocol. Built for Mantle Hackathon.
          </span>
          <div className="flex items-center gap-4 text-xs text-[#475569]">
            <span className="font-mono">Chain ID: 5003</span>
            <span className="w-1 h-1 rounded-full bg-[#475569]" />
            <span>Mantle Sepolia</span>
            <span className="w-1 h-1 rounded-full bg-[#475569]" />
            <span className="font-mono">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
