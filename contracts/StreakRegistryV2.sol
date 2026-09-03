// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title StreakRegistryV2
 * @notice Stores user trading streaks on-chain. Anyone can record their own trades.
 * @dev Users call recordTrade for their own address only.
 */
contract StreakRegistryV2 {
    struct UserRecord {
        uint256 streak;
        uint256 bestStreak;
        uint256 totalTrades;
        uint256 wins;
        uint256 lastTradeAt;
    }

    mapping(address => UserRecord) public records;

    event StreakUpdated(address indexed user, uint256 newStreak, uint256 bestStreak);
    event TradeRecorded(address indexed user, bool won, uint256 streak);

    /**
     * @notice Record a trade result. Only the user themselves can record.
     * @param won Whether the trade was won
     */
    function recordTrade(bool won) external {
        UserRecord storage record = records[msg.sender];

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

        emit TradeRecorded(msg.sender, won, record.streak);
        emit StreakUpdated(msg.sender, record.streak, record.bestStreak);
    }

    /**
     * @notice Get user's full record
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
            ? (record.wins * 10000) / record.totalTrades
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
}
