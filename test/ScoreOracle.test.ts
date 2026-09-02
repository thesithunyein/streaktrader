// @ts-nocheck
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ScoreOracle", function () {
  let scoreOracle: any;
  let owner: any;
  let user1: any;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const ScoreOracle = await ethers.getContractFactory("ScoreOracle");
    scoreOracle = await ScoreOracle.deploy();
    await scoreOracle.waitForDeployment();
  });

  describe("updateScore", function () {
    it("should compute score from inputs", async function () {
      await scoreOracle.updateScore(user1.address, 5, 5, 10, 8);
      const score = await scoreOracle.getScore(user1.address);
      expect(score).to.be.greaterThan(0);
      expect(score).to.be.lessThanOrEqual(100);
    });

    it("should return 0 for zero trades", async function () {
      const score = await scoreOracle.getScore(user1.address);
      expect(score).to.equal(0);
    });

    it("should update score when called again", async function () {
      await scoreOracle.updateScore(user1.address, 1, 1, 5, 3);
      const score1 = await scoreOracle.getScore(user1.address);
      await scoreOracle.updateScore(user1.address, 5, 5, 20, 16);
      const score2 = await scoreOracle.getScore(user1.address);
      expect(score2).to.be.greaterThan(score1);
    });
  });

  describe("getScoreData", function () {
    it("should return full score breakdown as tuple", async function () {
      await scoreOracle.updateScore(user1.address, 5, 5, 10, 8);
      // getScoreData returns (streak, bestStreak, totalTrades, wins, score, firstTradeAt, lastTradeAt)
      const data = await scoreOracle.getScoreData(user1.address);
      expect(data[0]).to.equal(5);   // streak
      expect(data[1]).to.equal(5);   // bestStreak
      expect(data[2]).to.equal(10);  // totalTrades
      expect(data[3]).to.equal(8);   // wins
      expect(data[4]).to.be.greaterThan(0); // score
    });

    it("should return zeros for new user", async function () {
      const data = await scoreOracle.getScoreData(user1.address);
      expect(data[0]).to.equal(0); // streak
      expect(data[1]).to.equal(0); // bestStreak
      expect(data[2]).to.equal(0); // totalTrades
      expect(data[3]).to.equal(0); // wins
      expect(data[4]).to.equal(0); // score
    });
  });

  describe("score formula", function () {
    it("higher win rate = higher score", async function () {
      await scoreOracle.updateScore(user1.address, 1, 1, 10, 5);
      const score1 = await scoreOracle.getScore(user1.address);
      await scoreOracle.updateScore(user1.address, 5, 5, 10, 9);
      const score2 = await scoreOracle.getScore(user1.address);
      expect(score2).to.be.greaterThan(score1);
    });

    it("higher streak = higher score", async function () {
      await scoreOracle.updateScore(user1.address, 1, 1, 10, 8);
      const score1 = await scoreOracle.getScore(user1.address);
      await scoreOracle.updateScore(user1.address, 8, 8, 10, 8);
      const score2 = await scoreOracle.getScore(user1.address);
      expect(score2).to.be.greaterThan(score1);
    });
  });
});
