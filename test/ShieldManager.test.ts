// @ts-nocheck
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShieldManager", function () {
  let shieldManager: any;
  let owner: any;
  let user1: any;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const ShieldManager = await ethers.getContractFactory("ShieldManager");
    shieldManager = await ShieldManager.deploy();
    await shieldManager.waitForDeployment();
  });

  describe("claimFreeShield", function () {
    it("should grant 1 free shield", async function () {
      await shieldManager.claimFreeShield(user1.address);
      const state = await shieldManager.getShieldState(user1.address);
      expect(state.count).to.equal(1);
      expect(state.totalUsed).to.equal(0);
    });

    it("should not allow claiming twice without cooldown", async function () {
      await shieldManager.claimFreeShield(user1.address);
      // Second claim fails because cooldown (24h) hasn't elapsed
      await expect(
        shieldManager.claimFreeShield(user1.address)
      ).to.be.revertedWith("Shield cooldown not reached");
    });
  });

  describe("activateShield", function () {
    it("should consume a shield and increment totalUsed", async function () {
      await shieldManager.claimFreeShield(user1.address);
      const tx = await shieldManager.activateShield(user1.address);
      const receipt = await tx.wait();
      const state = await shieldManager.getShieldState(user1.address);
      expect(state.count).to.equal(0);
      expect(state.totalUsed).to.equal(1);
    });

    it("should return false with no shields (no revert)", async function () {
      const result = await shieldManager.activateShield(user1.address);
      const state = await shieldManager.getShieldState(user1.address);
      expect(state.totalUsed).to.equal(0);
    });
  });

  describe("getShieldState", function () {
    it("should return correct state for new user", async function () {
      const state = await shieldManager.getShieldState(user1.address);
      expect(state.count).to.equal(0);
      expect(state.canClaim).to.equal(true);
      expect(state.totalUsed).to.equal(0);
    });

    it("should return canClaim=false after claiming", async function () {
      await shieldManager.claimFreeShield(user1.address);
      const state = await shieldManager.getShieldState(user1.address);
      expect(state.count).to.equal(1);
      expect(state.canClaim).to.equal(false);
    });
  });
});
