import { create } from "zustand";
import { MANTLE_TESTNET } from "@/lib/utils";

interface WalletStore {
  address: string | null;
  isConnected: boolean;
  balance: string;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
  isWrongNetwork: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  setChainId: (chainId: number) => void;
  setAddress: (address: string | null) => void;
  refreshBalance: () => Promise<void>;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  address: null,
  isConnected: false,
  balance: "0",
  chainId: null,
  isConnecting: false,
  error: null,
  isWrongNetwork: false,

  connect: async () => {
    set({ isConnecting: true, error: null });
    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        set({ isConnecting: false, error: "MetaMask not found. Please install MetaMask to connect." });
        return;
      }
      const eth = (window as any).ethereum;
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      const [balanceHex, chainIdHex] = await Promise.all([
        eth.request({ method: "eth_getBalance", params: [accounts[0], "latest"] }),
        eth.request({ method: "eth_chainId" }),
      ]);
      const chainId = parseInt(chainIdHex, 16);
      set({
        address: accounts[0],
        isConnected: true,
        balance: (parseInt(balanceHex, 16) / 1e18).toFixed(4),
        chainId,
        isWrongNetwork: chainId !== MANTLE_TESTNET.chainId,
        isConnecting: false,
        error: null,
      });
    } catch (err: any) {
      const msg = err?.code === 4001
        ? "Connection rejected."
        : (err?.message ?? "Failed to connect wallet.");
      set({ isConnecting: false, error: msg });
    }
  },

  disconnect: () => {
    set({ address: null, isConnected: false, balance: "0", chainId: null, isWrongNetwork: false, error: null });
  },

  setChainId: (chainId: number) => {
    set({ chainId, isWrongNetwork: chainId !== MANTLE_TESTNET.chainId });
  },

  setAddress: (address: string | null) => {
    if (!address) {
      set({ address: null, isConnected: false, balance: "0", chainId: null, isWrongNetwork: false });
    } else {
      set({ address, isConnected: true });
    }
  },

  refreshBalance: async () => {
    const { address } = get();
    if (!address || typeof window === "undefined" || !(window as any).ethereum) return;
    try {
      const balanceHex = await (window as any).ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      set({ balance: (parseInt(balanceHex, 16) / 1e18).toFixed(4) });
    } catch {}
  },
}));
