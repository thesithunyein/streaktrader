// @ts-nocheck
// Load .env manually before anything else
import { readFileSync } from "fs";
const envContent = readFileSync(".env", "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim();
      process.env[key] = val;
    }
  }
}

import { createWalletClient, http, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { somniaTestnet } from "viem/chains";
import path from "path";

const SHANNON_RPC = "https://api.infra.testnet.somnia.network";
const rawKey = process.env.DEPLOYER_PRIVATE_KEY || "";
const pk = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;

function loadBytecode(contractName: string): `0x${string}` {
  const artifact = JSON.parse(
    readFileSync(path.join("artifacts", "contracts", `${contractName}.sol`, `${contractName}.json`), "utf-8")
  );
  return artifact.bytecode;
}

function loadABI(contractName: string) {
  const artifact = JSON.parse(
    readFileSync(path.join("artifacts", "contracts", `${contractName}.sol`, `${contractName}.json`), "utf-8")
  );
  return artifact.abi;
}

async function main() {
  console.log("Private key length:", pk.length);
  console.log("Private key prefix:", pk.substring(0, 6));
  
  const account = privateKeyToAccount(pk as `0x${string}`);
  console.log("Deployer address:", account.address);

  const client = createWalletClient({
    account,
    chain: somniaTestnet,
    transport: http(SHANNON_RPC),
  });

  const chainId = await client.getChainId();
  console.log("Connected to chain:", chainId);

  const pubClient = createPublicClient({
    chain: somniaTestnet,
    transport: http(SHANNON_RPC),
  });

  const contracts: Record<string, string> = {};
  const contractNames = ["StreakRegistry", "ShieldManager", "ChallengeArena", "ScoreOracle"];

  for (const name of contractNames) {
    console.log(`\n--- Deploying ${name} ---`);
    const bytecode = loadBytecode(name);
    const hash = await client.deployContract({
      abi: loadABI(name),
      bytecode,
      chain: somniaTestnet,
    });
    console.log(`  Tx hash: ${hash}`);
    
    const receipt = await pubClient.waitForTransactionReceipt({ hash });
    console.log(`  Deployed at: ${receipt.contractAddress}`);
    contracts[name] = receipt.contractAddress!;
  }

  // Summary
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Network: Shannon Testnet (Chain 50312)");
  console.log("Deployer:", account.address);
  for (const [name, addr] of Object.entries(contracts)) {
    console.log(`${name}: ${addr}`);
  }

  // Save addresses
  const addresses = {
    network: "Shannon Testnet",
    chainId: 50312,
    deployer: account.address,
    contracts,
    deployedAt: new Date().toISOString(),
  };
  const { writeFileSync } = await import("fs");
  writeFileSync("src/lib/contracts.json", JSON.stringify(addresses, null, 2));
  console.log("\nAddresses saved to src/lib/contracts.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("DEPLOY FAILED:", error);
    process.exit(1);
  });
