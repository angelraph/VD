"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CheckCircle2, AlertCircle, ChevronDown, ExternalLink, LogOut } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress, MANTLE_TESTNET } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { switchToMantle } from "@/lib/contract";

interface WalletConnectProps {
  compact?: boolean;
}

export default function WalletConnect({ compact = false }: WalletConnectProps) {
  const { address, isConnected, balance, isConnecting, isWrongNetwork, connect, disconnect } =
    useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className={cn(
          "relative overflow-hidden rounded-xl font-semibold tracking-wide transition-all duration-300 flex items-center gap-2",
          compact ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm",
          "bg-gradient-to-r from-[#00d4ff] to-[#0099cc] text-[#020917]",
          "hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:-translate-y-0.5",
          isConnecting && "opacity-70 cursor-not-allowed"
        )}
      >
        {isConnecting ? (
          <>
            <span className="w-3 h-3 rounded-full border-2 border-[#020917]/30 border-t-[#020917] animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
            {compact ? "Connect" : "Connect Wallet"}
          </>
        )}
      </button>
    );
  }

  if (isWrongNetwork) {
    return (
      <button
        onClick={switchToMantle}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#ff3366]/10 border border-[#ff3366]/30 text-[#ff3366] hover:bg-[#ff3366]/20 transition-all"
      >
        <AlertCircle className="w-3.5 h-3.5" />
        Switch to Mantle
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition-all",
          compact ? "px-3 py-1.5" : "px-4 py-2.5"
        )}
      >
        <span className="w-2 h-2 rounded-full bg-[#00ff9d] shadow-[0_0_6px_rgba(0,255,157,0.8)]" />
        <span className={cn("font-mono text-white/80", compact ? "text-xs" : "text-sm")}>
          {formatAddress(address!)}
        </span>
        {!compact && (
          <span className="text-xs text-[#94a3b8] font-mono">{balance} MNT</span>
        )}
        <ChevronDown className={cn("text-[#94a3b8]", compact ? "w-3 h-3" : "w-4 h-4")} />
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-72 z-50 glass-card p-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-[#7c3aed]/20 border border-white/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#00ff9d]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Connected</div>
                  <div className="text-xs text-[#94a3b8] font-mono">{formatAddress(address!)}</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-white/[0.03]">
                  <span className="text-xs text-[#94a3b8]">Balance</span>
                  <span className="text-sm font-semibold font-mono text-[#00d4ff]">
                    {balance} MNT
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-white/[0.03]">
                  <span className="text-xs text-[#94a3b8]">Network</span>
                  <span className="text-xs font-medium text-[#00ff9d] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d]" />
                    {MANTLE_TESTNET.name}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`${MANTLE_TESTNET.explorer}/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-[#94a3b8] hover:text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  <ExternalLink className="w-3 h-3" />
                  Explorer
                </a>
                <button
                  onClick={() => { disconnect(); setDropdownOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-[#ff3366]/80 hover:text-[#ff3366] border border-[#ff3366]/20 hover:border-[#ff3366]/40 transition-all"
                >
                  <LogOut className="w-3 h-3" />
                  Disconnect
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
