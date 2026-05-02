"use client";
import { useEffect } from "react";
import { useWalletStore } from "@/store/walletStore";
import { MANTLE_TESTNET } from "@/lib/utils";

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const { setAddress, setChainId, disconnect, refreshBalance } = useWalletStore();

  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    const eth = (window as any).ethereum;

    // Auto-reconnect if MetaMask already has an active session
    eth.request({ method: "eth_accounts" }).then(async (accounts: string[]) => {
      if (accounts.length === 0) return;
      const [balanceHex, chainIdHex] = await Promise.all([
        eth.request({ method: "eth_getBalance", params: [accounts[0], "latest"] }),
        eth.request({ method: "eth_chainId" }),
      ]);
      const chainId = parseInt(chainIdHex, 16);
      useWalletStore.setState({
        address: accounts[0],
        isConnected: true,
        balance: (parseInt(balanceHex, 16) / 1e18).toFixed(4),
        chainId,
        isWrongNetwork: chainId !== MANTLE_TESTNET.chainId,
      });
    }).catch(() => {});

    // Account change (user switches wallet or disconnects in MetaMask)
    const onAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
        refreshBalance();
      }
    };

    // Chain change (user switches network in MetaMask)
    const onChainChanged = (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16));
    };

    eth.on("accountsChanged", onAccountsChanged);
    eth.on("chainChanged", onChainChanged);

    return () => {
      eth.removeListener("accountsChanged", onAccountsChanged);
      eth.removeListener("chainChanged", onChainChanged);
    };
  }, [disconnect, setAddress, setChainId, refreshBalance]);

  return <>{children}</>;
}
