"use client";
import { useState, useCallback } from "react";
import type { WalletState } from "@/types";
import { mockConnectWallet } from "@/lib/mantle";
import { MANTLE_TESTNET } from "@/lib/utils";

const initialState: WalletState = {
  address: null,
  isConnected: false,
  balance: "0",
  chainId: null,
  isConnecting: false,
  error: null,
};

export function useWallet() {
  const [state, setState] = useState<WalletState>(initialState);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, isConnecting: true, error: null }));
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        const balance = await (window as any).ethereum.request({
          method: "eth_getBalance",
          params: [accounts[0], "latest"],
        });
        const chainIdHex = await (window as any).ethereum.request({
          method: "eth_chainId",
        });
        setState({
          address: accounts[0],
          isConnected: true,
          balance: (parseInt(balance, 16) / 1e18).toFixed(4),
          chainId: parseInt(chainIdHex, 16),
          isConnecting: false,
          error: null,
        });
      } else {
        const { address, balance } = await mockConnectWallet();
        setState({
          address,
          isConnected: true,
          balance,
          chainId: MANTLE_TESTNET.chainId,
          isConnecting: false,
          error: null,
        });
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: "Failed to connect wallet. Please try again.",
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState(initialState);
  }, []);

  const isWrongNetwork = state.isConnected && state.chainId !== MANTLE_TESTNET.chainId;

  return { ...state, connect, disconnect, isWrongNetwork };
}
