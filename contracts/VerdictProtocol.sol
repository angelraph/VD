// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VerdictProtocol
 * @notice On-chain registry for Human vs AI trading challenge outcomes.
 *         Deployed on Mantle Sepolia Testnet (Chain ID: 5003).
 *
 *         Every time a human challenges an AI agent and gets a verdict,
 *         the result is recorded here — immutable, public, verifiable.
 */
contract VerdictProtocol {

    // ─── Types ────────────────────────────────────────────────────────────────

    enum Winner { TIE, HUMAN, AI }

    struct Verdict {
        address challenger;      // human wallet
        bytes32 agentId;         // keccak256 of agent name ("oracle", "cipher", etc.)
        bytes32 tradingPair;     // keccak256 of trading pair ("ETH/USDT", etc.)
        int32   humanReturnBps;  // human return in basis points (1 bp = 0.01%)
        int32   aiReturnBps;     // AI return in basis points
        Winner  winner;
        uint40  timestamp;
        uint32  blockNum;
    }

    // ─── Storage ──────────────────────────────────────────────────────────────

    mapping(bytes32 => Verdict) public verdicts;
    bytes32[] public verdictIds;

    mapping(address => uint256) public humanWins;
    mapping(address => uint256) public humanChallenges;
    mapping(bytes32 => uint256) public agentWins;    // agentId → win count
    mapping(bytes32 => uint256) public agentChallenges;

    // ─── Events ───────────────────────────────────────────────────────────────

    event VerdictRecorded(
        bytes32 indexed verdictId,
        address indexed challenger,
        bytes32 indexed agentId,
        Winner  winner,
        int32   humanReturnBps,
        int32   aiReturnBps
    );

    // ─── Write ────────────────────────────────────────────────────────────────

    /**
     * @notice Record the outcome of a Human vs AI challenge.
     * @param agentId       keccak256 hash of the agent name string
     * @param tradingPair   keccak256 hash of the trading pair string
     * @param humanReturnBps Human's return in basis points (e.g. 234 = +2.34%)
     * @param aiReturnBps    AI's return in basis points
     * @param winner         0=TIE, 1=HUMAN, 2=AI
     * @return verdictId     Unique identifier for this verdict
     */
    function recordVerdict(
        bytes32 agentId,
        bytes32 tradingPair,
        int32   humanReturnBps,
        int32   aiReturnBps,
        Winner  winner
    ) external returns (bytes32 verdictId) {
        verdictId = keccak256(abi.encodePacked(
            msg.sender,
            agentId,
            tradingPair,
            block.timestamp,
            verdictIds.length
        ));

        verdicts[verdictId] = Verdict({
            challenger:     msg.sender,
            agentId:        agentId,
            tradingPair:    tradingPair,
            humanReturnBps: humanReturnBps,
            aiReturnBps:    aiReturnBps,
            winner:         winner,
            timestamp:      uint40(block.timestamp),
            blockNum:       uint32(block.number)
        });

        verdictIds.push(verdictId);

        humanChallenges[msg.sender]++;
        agentChallenges[agentId]++;
        if (winner == Winner.HUMAN) humanWins[msg.sender]++;
        if (winner == Winner.AI)    agentWins[agentId]++;

        emit VerdictRecorded(
            verdictId,
            msg.sender,
            agentId,
            winner,
            humanReturnBps,
            aiReturnBps
        );
    }

    // ─── Read ─────────────────────────────────────────────────────────────────

    function totalVerdicts() external view returns (uint256) {
        return verdictIds.length;
    }

    function getVerdict(bytes32 verdictId) external view returns (Verdict memory) {
        return verdicts[verdictId];
    }

    /**
     * @notice Returns the most recent `count` verdict IDs, newest first.
     */
    function getRecentVerdictIds(uint256 count)
        external
        view
        returns (bytes32[] memory result)
    {
        uint256 len = verdictIds.length;
        uint256 n   = count > len ? len : count;
        result = new bytes32[](n);
        for (uint256 i = 0; i < n; i++) {
            result[i] = verdictIds[len - 1 - i];
        }
    }

    /**
     * @notice Returns win rate for a human challenger (0–10000 = 0–100.00%)
     */
    function humanWinRate(address challenger) external view returns (uint256) {
        uint256 total = humanChallenges[challenger];
        if (total == 0) return 0;
        return (humanWins[challenger] * 10000) / total;
    }

    /**
     * @notice Returns win rate for an AI agent (0–10000 = 0–100.00%)
     */
    function agentWinRate(bytes32 agentId) external view returns (uint256) {
        uint256 total = agentChallenges[agentId];
        if (total == 0) return 0;
        return (agentWins[agentId] * 10000) / total;
    }

    // ─── Helpers (off-chain encoding) ─────────────────────────────────────────

    function encodeAgentId(string calldata name) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(name));
    }

    function encodePair(string calldata pair) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(pair));
    }
}
