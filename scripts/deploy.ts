// @ts-nocheck
import hre from "hardhat";

async function main() {
  const ethers = (hre as any).ethers;
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // 1. Deploy StreakRegistry
  console.log("\n--- Deploying StreakRegistry ---");
  const StreakRegistry = await ethers.getContractFactory("StreakRegistry");
  const streakRegistry = await StreakRegistry.deploy();
  await streakRegistry.waitForDeployment();
  const streakAddr = await streakRegistry.getAddress();
  console.log("StreakRegistry deployed to:", streakAddr);

  // 2. Deploy ShieldManager
  console.log("\n--- Deploying ShieldManager ---");
  const ShieldManager = await ethers.getContractFactory("ShieldManager");
  const shieldManager = await ShieldManager.deploy();
  await shieldManager.waitForDeployment();
  const shieldAddr = await shieldManager.getAddress();
  console.log("ShieldManager deployed to:", shieldAddr);

  // 3. Deploy ChallengeArena
  console.log("\n--- Deploying ChallengeArena ---");
  const ChallengeArena = await ethers.getContractFactory("ChallengeArena");
  const challengeArena = await ChallengeArena.deploy();
  await challengeArena.waitForDeployment();
  const challengeAddr = await challengeArena.getAddress();
  console.log("ChallengeArena deployed to:", challengeAddr);

  // 4. Deploy ScoreOracle
  console.log("\n--- Deploying ScoreOracle ---");
  const ScoreOracle = await ethers.getContractFactory("ScoreOracle");
  const scoreOracle = await ScoreOracle.deploy();
  await scoreOracle.waitForDeployment();
  const scoreAddr = await scoreOracle.getAddress();
  console.log("ScoreOracle deployed to:", scoreAddr);

  // Summary
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Network: Shannon Testnet (Chain 50312)");
  console.log("Deployer:", deployer.address);
  console.log("\nContract Addresses:");
  console.log("StreakRegistry:", streakAddr);
  console.log("ShieldManager:", shieldAddr);
  console.log("ChallengeArena:", challengeAddr);
  console.log("ScoreOracle:", scoreAddr);

  // Save addresses to file
  const fs = require("fs");
  const addresses = {
    network: "Shannon Testnet",
    chainId: 50312,
    deployer: deployer.address,
    contracts: {
      StreakRegistry: streakAddr,
      ShieldManager: shieldAddr,
      ChallengeArena: challengeAddr,
      ScoreOracle: scoreAddr,
    },
    deployedAt: new Date().toISOString(),
  };
  fs.writeFileSync(
    "src/lib/contracts.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\nAddresses saved to src/lib/contracts.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
