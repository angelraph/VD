import { generateTxHash, generateBlockNumber, MANTLE_TESTNET } from "@/lib/utils";

export interface MockTx {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  status: "pending" | "confirmed" | "failed";
  timestamp: number;
  data: string;
}

export async function mockConnectWallet(): Promise<{ address: string; balance: string }> {
  await new Promise((r) => setTimeout(r, 1200));
  const address = "0x" + Array.from({ length: 40 }, () =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]
  ).join("");
  const balance = (Math.random() * 50 + 5).toFixed(4);
  return { address, balance };
}

export async function mockSubmitChallenge(
  agentId: string,
  pair: string,
  decision: string
): Promise<MockTx> {
  await new Promise((r) => setTimeout(r, 2000));
  return {
    hash: generateTxHash(),
    blockNumber: generateBlockNumber(),
    from: "0x" + Array.from({ length: 40 }, () =>
      "0123456789abcdef"[Math.floor(Math.random() * 16)]
    ).join(""),
    to: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    value: "0.01",
    gasUsed: (Math.floor(Math.random() * 50000) + 21000).toString(),
    status: "confirmed",
    timestamp: Date.now(),
    data: `challenge(${agentId},${pair},${decision})`,
  };
}

export async function mockRecordVerdict(
  txHash: string,
  winner: string,
  score: number
): Promise<MockTx> {
  await new Promise((r) => setTimeout(r, 1500));
  return {
    hash: generateTxHash(),
    blockNumber: generateBlockNumber(),
    from: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    to: "0xAbcDef1234567890AbcDef1234567890AbcDef12",
    value: "0",
    gasUsed: "43000",
    status: "confirmed",
    timestamp: Date.now(),
    data: `recordVerdict(${txHash},${winner},${score})`,
  };
}

export function getMantleExplorerUrl(txHash: string): string {
  return `${MANTLE_TESTNET.explorer}/tx/${txHash}`;
}

export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const MOCK_CONTRACT_ABI = [
  "function submitChallenge(address agent, string pair, uint8 decision) returns (bytes32)",
  "function recordVerdict(bytes32 challengeId, address winner, uint256 score) external",
  "function getChallengeResult(bytes32 challengeId) view returns (address winner, uint256 score, uint256 timestamp)",
  "event ChallengeCreated(bytes32 indexed challengeId, address indexed human, address indexed agent)",
  "event VerdictRecorded(bytes32 indexed challengeId, address winner, uint256 score)",
];
