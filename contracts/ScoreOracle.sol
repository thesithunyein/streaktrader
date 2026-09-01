// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ScoreOracle
 * @notice Computes and stores prediction scores (0-100) from on-chain trading data.
 * @dev Score = WinRate(40%) + Streak(30%) + Volume(20%) + Consistency(10%)
 */
contract ScoreOracle {
    address public owner;

    struct ScoreData {
        uint256 streak;          // Current streak
        uint256 bestStreak;      // Best streak ever
        uint256 totalTrades;     // Total trades
        uint256 wins;            // Total wins
        uint256 firstTradeAt;    // First trade timestamp
        uint256 lastTradeAt;     // Last trade timestamp
        uint256 score;           // Computed score (0-10000 basis points, e.g., 8200 = 82)
    }

    mapping(address => ScoreData) public scores;

    event ScoreUpdated(address indexed user, uint256 newScore);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Update score data and recompute score
     * @param user The trader's address
     * @param streak Current streak
     * @param bestStreak Best streak
     * @param totalTrades Total trades
     * @param wins Total wins
     */
    function updateScore(
        address user,
        uint256 streak,
        uint256 bestStreak,
        uint256 totalTrades,
        uint256 wins
    ) external onlyOwner {
        ScoreData storage data = scores[user];

        data.streak = streak;
        data.bestStreak = bestStreak;
        data.totalTrades = totalTrades;
        data.wins = wins;
        data.lastTradeAt = block.timestamp;

        if (data.firstTradeAt == 0) {
            data.firstTradeAt = block.timestamp;
        }

        // Compute score
        data.score = _computeScore(streak, totalTrades, wins, data.firstTradeAt);

        emit ScoreUpdated(user, data.score);
    }

    /**
     * @notice Internal score computation
     * @dev Score breakdown:
     *   - Win Rate: 40% weight (0-4000 basis points)
     *   - Streak: 30% weight (0-3000 basis points)
     *   - Volume: 20% weight (0-2000 basis points)
     *   - Consistency: 10% weight (0-1000 basis points)
     */
    function _computeScore(
        uint256 streak,
        uint256 totalTrades,
        uint256 wins,
        uint256 firstTradeAt
    ) internal view returns (uint256) {
        if (totalTrades == 0) return 0;

        // Win Rate component (40% weight)
        // winRate = wins / totalTrades, scaled to 0-4000
        uint256 winRateBps = (wins * 10000) / totalTrades; // 0-10000 basis points
        uint256 winRateScore = (winRateBps * 40) / 100; // 0-4000

        // Streak component (30% weight)
        // 10x streak = max points (3000)
        uint256 streakScore = streak > 10 ? 3000 : (streak * 300);

        // Volume component (20% weight)
        // 100 trades = max points (2000), logarithmic scale
        uint256 volumeScore;
        if (totalTrades >= 100) {
            volumeScore = 2000;
        } else if (totalTrades >= 50) {
            volumeScore = 1500;
        } else if (totalTrades >= 20) {
            volumeScore = 1000;
        } else if (totalTrades >= 10) {
            volumeScore = 700;
        } else if (totalTrades >= 5) {
            volumeScore = 400;
        } else {
            volumeScore = totalTrades * 80;
        }

        // Consistency component (10% weight)
        // 30 days active = max points (1000)
        uint256 daysActive = (block.timestamp - firstTradeAt) / 1 days;
        uint256 consistencyScore = daysActive > 30 ? 1000 : (daysActive * 33);

        return winRateScore + streakScore + volumeScore + consistencyScore;
    }

    /**
     * @notice Get user's score (0-100)
     */
    function getScore(address user) external view returns (uint256) {
        return scores[user].score / 100; // Convert from basis points to 0-100
    }

    /**
     * @notice Get full score data
     */
    function getScoreData(address user) external view returns (
        uint256 streak,
        uint256 bestStreak,
        uint256 totalTrades,
        uint256 wins,
        uint256 score,
        uint256 firstTradeAt,
        uint256 lastTradeAt
    ) {
        ScoreData storage data = scores[user];
        return (
            data.streak,
            data.bestStreak,
            data.totalTrades,
            data.wins,
            data.score / 100,
            data.firstTradeAt,
            data.lastTradeAt
        );
    }

    /**
     * @notice Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
}
