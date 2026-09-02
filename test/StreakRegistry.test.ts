// @ts-nocheck
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StreakRegistry", function () {
  let streakRegistry: any;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const StreakRegistry = await ethers.getContractFactory("StreakRegistry");
    streakRegistry = await StreakRegistry.deploy();
    await streakRegistry.waitForDeployment();
  });

  describe("recordTrade", function () {
    it("should record a win and increment streak", async function () {
      await streakRegistry.recordTrade(user1.address, true);
      const record = await streakRegistry.getRecord(user1.address);
      expect(record.streak).to.equal(1);
      expect(record.wins).to.equal(1);
      expect(record.totalTrades).to.equal(1);
    });

    it("should record a loss and reset streak to 0", async function () {
      await streakRegistry.recordTrade(user1.address, true);
      await streakRegistry.recordTrade(user1.address, true);
      await streakRegistry.recordTrade(user1.address, false);
      const record = await streakRegistry.getRecord(user1.address);
      expect(record.streak).to.equal(0);
      expect(record.totalTrades).to.equal(3);
      expect(record.wins).to.equal(2);
    });

    it("should track best streak", async function () {
      for (let i = 0; i < 3; i++) {
        await streakRegistry.recordTrade(user1.address, true);
      }
      await streakRegistry.recordTrade(user1.address, false);
      for (let i = 0; i < 2; i++) {
        await streakRegistry.recordTrade(user1.address, true);
      }
      const record = await streakRegistry.getRecord(user1.address);
      expect(record.bestStreak).to.equal(3);
      expect(record.streak).to.equal(2);
    });

    it("should calculate win rate correctly", async function () {
      await streakRegistry.recordTrade(user1.address, true);
      await streakRegistry.recordTrade(user1.address, true);
      await streakRegistry.recordTrade(user1.address, true);
      await streakRegistry.recordTrade(user1.address, false);
      const record = await streakRegistry.getRecord(user1.address);
      expect(record.winRate).to.equal(7500);
    });

    it("should track multiple users independently", async function () {
      await streakRegistry.recordTrade(user1.address, true);
      await streakRegistry.recordTrade(user1.address, true);
      await streakRegistry.recordTrade(user2.address, true);
      const record1 = await streakRegistry.getRecord(user1.address);
      const record2 = await streakRegistry.getRecord(user2.address);
      expect(record1.streak).to.equal(2);
      expect(record2.streak).to.equal(1);
    });
  });

  describe("getRecord", function () {
    it("should return zeros for new user", async function () {
      const record = await streakRegistry.getRecord(user1.address);
      expect(record.streak).to.equal(0);
      expect(record.bestStreak).to.equal(0);
      expect(record.totalTrades).to.equal(0);
      expect(record.wins).to.equal(0);
      expect(record.winRate).to.equal(0);
    });
  });

  describe("resetStreak", function () {
    it("should only be callable by owner", async function () {
      await expect(
        streakRegistry.connect(user1).resetStreak(user1.address)
      ).to.be.revertedWith("Not owner");
    });

    it("owner can reset streak", async function () {
      await streakRegistry.recordTrade(user1.address, true);
      await streakRegistry.recordTrade(user1.address, true);
      await streakRegistry.resetStreak(user1.address);
      const record = await streakRegistry.getRecord(user1.address);
      expect(record.streak).to.equal(0);
      expect(record.bestStreak).to.equal(2);
    });
  });
});
