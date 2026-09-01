// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ChallengeArena
 * @notice On-chain head-to-head prediction challenges with stakes.
 * @dev Creator picks a side, opponent picks the other. Winner takes bragging rights on-chain.
 */
contract ChallengeArena {
    address public owner;

    enum ChallengeStatus { Pending, Active, Settled }

    struct Challenge {
        address creator;
        address opponent;
        string marketSymbol;    // Market identifier
        uint8 creatorSide;      // 0 = UP, 1 = DOWN
        uint8 opponentSide;     // 0 = UP, 1 = DOWN
        uint256 stake;          // Stake amount in tUSDC
        ChallengeStatus status;
        uint8 result;           // 0 = Creator won, 1 = Opponent won, 2 = Draw
        uint256 createdAt;
        uint256 settledAt;
    }

    Challenge[] public challenges;
    mapping(uint256 => bool) public challengeExists;

    event ChallengeCreated(uint256 indexed id, address indexed creator, string marketSymbol, uint8 side, uint256 stake);
    event ChallengeAccepted(uint256 indexed id, address indexed opponent, uint8 side);
    event ChallengeSettled(uint256 indexed id, uint8 result, uint256 payout);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Create a new challenge
     * @param creator The challenger's address
     * @param marketSymbol Market identifier (e.g., "BTC-118500-31DEC26/USDC")
     * @param creatorSide 0 for UP, 1 for DOWN
     * @param stake Stake amount
     */
    function createChallenge(
        address creator,
        string calldata marketSymbol,
        uint8 creatorSide,
        uint256 stake
    ) external onlyOwner returns (uint256) {
        require(creatorSide <= 1, "Invalid side");

        uint256 id = challenges.length;
        challenges.push(Challenge({
            creator: creator,
            opponent: address(0),
            marketSymbol: marketSymbol,
            creatorSide: creatorSide,
            opponentSide: creatorSide == 0 ? 1 : 0,
            stake: stake,
            status: ChallengeStatus.Pending,
            result: 0,
            createdAt: block.timestamp,
            settledAt: 0
        }));

        challengeExists[id] = true;
        emit ChallengeCreated(id, creator, marketSymbol, creatorSide, stake);
        return id;
    }

    /**
     * @notice Accept a challenge by picking the opposite side
     * @param challengeId The challenge to accept
     * @param opponent The accepter's address
     * @param side The side they're picking (must be opposite of creator)
     */
    function acceptChallenge(
        uint256 challengeId,
        address opponent,
        uint8 side
    ) external onlyOwner {
        require(challengeId < challenges.length, "Challenge not found");
        Challenge storage c = challenges[challengeId];
        require(c.status == ChallengeStatus.Pending, "Not pending");
        require(side != c.creatorSide, "Must pick opposite side");

        c.opponent = opponent;
        c.opponentSide = side;
        c.status = ChallengeStatus.Active;

        emit ChallengeAccepted(challengeId, opponent, side);
    }

    /**
     * @notice Settle a challenge after market resolution
     * @param challengeId The challenge to settle
     * @param winner 0 = Creator won, 1 = Opponent won, 2 = Draw
     */
    function settleChallenge(uint256 challengeId, uint8 winner) external onlyOwner {
        require(challengeId < challenges.length, "Challenge not found");
        Challenge storage c = challenges[challengeId];
        require(c.status == ChallengeStatus.Active, "Not active");
        require(winner <= 2, "Invalid result");

        c.status = ChallengeStatus.Settled;
        c.result = winner;
        c.settledAt = block.timestamp;

        uint256 payout = winner == 2 ? 0 : c.stake; // Draw returns no extra
        emit ChallengeSettled(challengeId, winner, payout);
    }

    /**
     * @notice Get challenge details
     */
    function getChallenge(uint256 challengeId) external view returns (
        address creator,
        address opponent,
        string memory marketSymbol,
        uint8 creatorSide,
        uint8 opponentSide,
        uint256 stake,
        ChallengeStatus status,
        uint8 result,
        uint256 createdAt,
        uint256 settledAt
    ) {
        require(challengeId < challenges.length, "Challenge not found");
        Challenge storage c = challenges[challengeId];
        return (
            c.creator,
            c.opponent,
            c.marketSymbol,
            c.creatorSide,
            c.opponentSide,
            c.stake,
            c.status,
            c.result,
            c.createdAt,
            c.settledAt
        );
    }

    /**
     * @notice Get total number of challenges
     */
    function totalChallenges() external view returns (uint256) {
        return challenges.length;
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
