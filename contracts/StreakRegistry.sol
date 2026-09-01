// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title StreakRegistry
 * @notice Stores user trading streaks, best streaks, win rates, and trade counts on-chain.
 * @dev Only the owner (StreakTrader app) can update records. Users can read their own data.
 */
contract StreakRegistry {
    address public owner;

    struct UserRecord {
        uint256 streak;        // Current winning streak
        uint256 bestStreak;    // All-time best streak
        uint256 totalTrades;   // Total trades placed
        uint256 wins;          // Total wins
        uint256 lastTradeAt;   // Timestamp of last trade
    }

    mapping(address => UserRecord) public records;

    event StreakUpdated(address indexed user, uint256 newStreak, uint256 bestStreak);
    event TradeRecorded(address indexed user, bool won, uint256 streak);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Record a trade result and update streak
     * @param user The trader's address
     * @param won Whether the trade was won
     */
    function recordTrade(address user, bool won) external onlyOwner {
        UserRecord storage record = records[user];

        record.totalTrades++;
        record.lastTradeAt = block.timestamp;

        if (won) {
            record.wins++;
            record.streak++;
            if (record.streak > record.bestStreak) {
                record.bestStreak = record.streak;
            }
        } else {
            record.streak = 0;
        }

        emit TradeRecorded(user, won, record.streak);
        emit StreakUpdated(user, record.streak, record.bestStreak);
    }

    /**
     * @notice Get user's full record
     * @param user The trader's address
     */
    function getRecord(address user) external view returns (
        uint256 streak,
        uint256 bestStreak,
        uint256 totalTrades,
        uint256 wins,
        uint256 winRate,
        uint256 lastTradeAt
    ) {
        UserRecord storage record = records[user];
        winRate = record.totalTrades > 0
            ? (record.wins * 10000) / record.totalTrades  // Basis points (e.g., 8000 = 80%)
            : 0;
        return (
            record.streak,
            record.bestStreak,
            record.totalTrades,
            record.wins,
            winRate,
            record.lastTradeAt
        );
    }

    /**
     * @notice Reset a user's streak (e.g., for testing)
     */
    function resetStreak(address user) external onlyOwner {
        records[user].streak = 0;
        emit StreakUpdated(user, 0, records[user].bestStreak);
    }

    /**
     * @notice Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
