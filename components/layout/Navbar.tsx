"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, Activity } from "lucide-react";
import WalletConnect from "@/components/mantle/WalletConnect";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/arena", label: "Agent Arena", icon: "⚡" },
  { href: "/challenge", label: "Challenge", icon: "⚔" },
  { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
  { href: "/ledger", label: "Ledger", icon: "📜" },
  { href: "/explainability", label: "Explainability", icon: "🧠" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [livePulse, setLivePulse] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setLivePulse((p) => !p), 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[#020917]/90 backdrop-blur-xl border-b border-white/[0.06]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0.5 rounded-[6px] bg-[#020917] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-[#00d4ff]" />
                </div>
              </div>
              <div>
                <span className="text-white font-bold text-lg tracking-wider">
                  VER<span className="text-gradient-blue">DICT</span>
                </span>
                <div className="text-[10px] text-[#94a3b8] tracking-[0.2em] -mt-1 uppercase font-mono">
                  Protocol
                </div>
              </div>
            </Link>

            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
              <span
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-500",
                  livePulse ? "bg-[#00ff9d] shadow-[0_0_8px_rgba(0,255,157,0.8)]" : "bg-[#00ff9d]/40"
                )}
              />
              <span className="text-xs text-[#94a3b8] font-mono">847 LIVE</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    pathname === link.href
                      ? "text-[#00d4ff] bg-[#00d4ff]/10"
                      : "text-[#94a3b8] hover:text-white hover:bg-white/[0.05]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <WalletConnect compact />
              </div>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/[0.05] transition-all"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#020917]/95 backdrop-blur-xl border-b border-white/[0.06] lg:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    pathname === link.href
                      ? "text-[#00d4ff] bg-[#00d4ff]/10"
                      : "text-[#94a3b8] hover:text-white hover:bg-white/[0.05]"
                  )}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-white/[0.06]">
                <WalletConnect />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
