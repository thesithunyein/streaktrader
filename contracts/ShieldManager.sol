// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ShieldManager
 * @notice Manages Streak Shields — on-chain protection tokens that absorb one loss.
 * @dev Users get 1 free shield every 24 hours. Max 3 shields stored. Can buy extra.
 */
contract ShieldManager {
    address public owner;

    uint256 public constant MAX_SHIELDS = 3;
    uint256 public constant SHIELD_COOLDOWN = 24 hours;
    uint256 public constant SHIELD_COST = 1e6; // 1 USDC (6 decimals)

    struct ShieldState {
        uint256 count;          // Current shield count
        uint256 lastFreeAt;     // Timestamp of last free shield claim
        uint256 totalUsed;      // Lifetime shields used
        uint256 totalBought;    // Lifetime shields purchased
    }

    mapping(address => ShieldState) public shields;

    event ShieldClaimed(address indexed user, uint256 newCount);
    event ShieldActivated(address indexed user, uint256 remaining);
    event ShieldPurchased(address indexed user, uint256 amount, uint256 newCount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Claim a free shield (once every 24 hours)
     * @param user The trader's address
     */
    function claimFreeShield(address user) external onlyOwner {
        ShieldState storage state = shields[user];

        require(
            block.timestamp >= state.lastFreeAt + SHIELD_COOLDOWN,
            "Shield cooldown not reached"
        );
        require(state.count < MAX_SHIELDS, "Max shields reached");

        state.count++;
        state.lastFreeAt = block.timestamp;

        emit ShieldClaimed(user, state.count);
    }

    /**
     * @notice Activate a shield before trading (marks it for use)
     * @param user The trader's address
     * @return activated Whether a shield was activated
     */
    function activateShield(address user) external onlyOwner returns (bool) {
        ShieldState storage state = shields[user];

        if (state.count == 0) {
            return false;
        }

        // Shield will be consumed on next trade loss
        // For simplicity, we consume it immediately and let the app handle the logic
        state.count--;
        state.totalUsed++;

        emit ShieldActivated(user, state.count);
        return true;
    }

    /**
     * @notice Purchase additional shields with USDC
     * @param user The buyer's address
     * @param amount Number of shields to buy
     */
    function purchaseShields(address user, uint256 amount) external onlyOwner {
        ShieldState storage state = shields[user];
        require(state.count + amount <= MAX_SHIELDS, "Would exceed max shields");

        state.count += amount;
        state.totalBought += amount;

        emit ShieldPurchased(user, amount, state.count);
    }

    /**
     * @notice Get user's shield state
     * @param user The trader's address
     */
    function getShieldState(address user) external view returns (
        uint256 count,
        bool canClaim,
        uint256 totalUsed,
        uint256 totalBought
    ) {
        ShieldState storage state = shields[user];
        canClaim = block.timestamp >= state.lastFreeAt + SHIELD_COOLDOWN
            && state.count < MAX_SHIELDS;
        return (
            state.count,
            canClaim,
            state.totalUsed,
            state.totalBought
        );
    }

    /**
     * @notice Check if user can claim a free shield
     */
    function canClaimFree(address user) external view returns (bool) {
        ShieldState storage state = shields[user];
        return block.timestamp >= state.lastFreeAt + SHIELD_COOLDOWN
            && state.count < MAX_SHIELDS;
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
