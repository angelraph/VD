import { ethers } from "ethers";
import { MANTLE_TESTNET } from "@/lib/utils";

// ── Contract config ───────────────────────────────────────────────────────────

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS ?? "";

export const CONTRACT_ABI = [
  // Write
  "function recordVerdict(bytes32 agentId, bytes32 tradingPair, int32 humanReturnBps, int32 aiReturnBps, uint8 winner) external returns (bytes32)",
  // Read
  "function totalVerdicts() external view returns (uint256)",
  "function getVerdict(bytes32 verdictId) external view returns (tuple(address challenger, bytes32 agentId, bytes32 tradingPair, int32 humanReturnBps, int32 aiReturnBps, uint8 winner, uint40 timestamp, uint32 blockNum))",
  "function getRecentVerdictIds(uint256 count) external view returns (bytes32[])",
  "function agentWinRate(bytes32 agentId) external view returns (uint256)",
  "function humanWinRate(address challenger) external view returns (uint256)",
  "function agentWins(bytes32 agentId) external view returns (uint256)",
  "function agentChallenges(bytes32 agentId) external view returns (uint256)",
  "function humanWins(address challenger) external view returns (uint256)",
  "function humanChallenges(address challenger) external view returns (uint256)",
  // Events
  "event VerdictRecorded(bytes32 indexed verdictId, address indexed challenger, bytes32 indexed agentId, uint8 winner, int32 humanReturnBps, int32 aiReturnBps)",
];

// ── Encoding helpers ──────────────────────────────────────────────────────────

export const encodeAgentId   = (name: string) => ethers.keccak256(ethers.toUtf8Bytes(name.toLowerCase()));
export const encodePair      = (pair: string) => ethers.keccak256(ethers.toUtf8Bytes(pair));
export const encodeWinner    = (w: "human" | "ai" | "tie") => w === "tie" ? 0 : w === "human" ? 1 : 2;

// ── Provider / signer ─────────────────────────────────────────────────────────

export function getBrowserProvider(): ethers.BrowserProvider | null {
  if (typeof window === "undefined" || !(window as any).ethereum) return null;
  return new ethers.BrowserProvider((window as any).ethereum);
}

export async function getSigner(): Promise<ethers.Signer | null> {
  try {
    const p = getBrowserProvider();
    return p ? await p.getSigner() : null;
  } catch {
    return null;
  }
}

function getReadProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(MANTLE_TESTNET.rpcUrl);
}

export async function getContract(write = false): Promise<ethers.Contract | null> {
  if (!CONTRACT_ADDRESS) return null;
  if (write) {
    const signer = await getSigner();
    if (!signer) return null;
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }
  const provider = getBrowserProvider() ?? getReadProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

// ── Network switch ────────────────────────────────────────────────────────────

export async function switchToMantle(): Promise<boolean> {
  if (typeof window === "undefined" || !(window as any).ethereum) return false;
  const chainHex = `0x${MANTLE_TESTNET.chainId.toString(16)}`;
  try {
    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainHex }],
    });
    return true;
  } catch (err: any) {
    if (err.code === 4902) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: chainHex,
            chainName: MANTLE_TESTNET.name,
            nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
            rpcUrls: [MANTLE_TESTNET.rpcUrl],
            blockExplorerUrls: [MANTLE_TESTNET.explorer],
          }],
        });
        return true;
      } catch { return false; }
    }
    return false;
  }
}

// ── Write ─────────────────────────────────────────────────────────────────────

export interface RecordParams {
  agentName: string;
  pair: string;
  humanReturn: number;
  aiReturn: number;
  winner: "human" | "ai" | "tie";
}

export interface OnChainReceipt {
  txHash: string;
  blockNumber: number;
  verdictId: string;
  explorerUrl: string;
}

export async function recordVerdictOnChain(p: RecordParams): Promise<OnChainReceipt> {
  const contract = await getContract(true);
  if (!contract) throw new Error("Contract unavailable");

  const tx = await contract.recordVerdict(
    encodeAgentId(p.agentName),
    encodePair(p.pair),
    Math.round(p.humanReturn * 100),
    Math.round(p.aiReturn * 100),
    encodeWinner(p.winner),
  );

  const receipt = await tx.wait();

  const event = receipt.logs
    .map((log: any) => { try { return contract.interface.parseLog(log); } catch { return null; } })
    .find((e: any) => e?.name === "VerdictRecorded");

  return {
    txHash: receipt.hash,
    blockNumber: Number(receipt.blockNumber),
    verdictId: event?.args?.verdictId ?? receipt.hash,
    explorerUrl: `${MANTLE_TESTNET.explorer}/tx/${receipt.hash}`,
  };
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getTotalVerdicts(): Promise<number> {
  try {
    const c = await getContract(false);
    if (!c) return 0;
    return Number(await c.totalVerdicts());
  } catch { return 0; }
}

export async function getAgentWinRate(agentName: string): Promise<number | null> {
  try {
    const c = await getContract(false);
    if (!c) return null;
    const rate = await c.agentWinRate(encodeAgentId(agentName));
    return Number(rate) / 100;
  } catch { return null; }
}

export async function getHumanStats(address: string): Promise<{ wins: number; total: number; rate: number } | null> {
  try {
    const c = await getContract(false);
    if (!c) return null;
    const [wins, total] = await Promise.all([
      c.humanWins(address),
      c.humanChallenges(address),
    ]);
    const w = Number(wins);
    const t = Number(total);
    return { wins: w, total: t, rate: t > 0 ? (w / t) * 100 : 0 };
  } catch { return null; }
}

export const isContractDeployed = () => Boolean(CONTRACT_ADDRESS);
