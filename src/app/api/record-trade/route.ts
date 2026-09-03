import { NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  http,
  encodeFunctionData,
  type Address,
} from "viem";
import { somniaShannon } from "@somnia-chain/markets-sdk/chains";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import StreakRegistryABI from "@/lib/abis/StreakRegistry.json";
import ScoreOracleABI from "@/lib/abis/ScoreOracle.json";
import { privateKeyToAccount } from "viem/accounts";

// Deployer wallet — only this wallet can call onlyOwner functions
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}` | undefined;
const DEPLOYER_ADDRESS = "0x7A35f63F81357DaDE2cff8f5699b935786Aa9Da2" as Address;

const RPC_URL = "https://api.infra.testnet.somnia.network";

// Server-side public client
const publicClient = createPublicClient({
  chain: somniaShannon,
  transport: http(RPC_URL),
});

async function signAndSend(encodedData: `0x${string}`, to: `0x${string}`): Promise<`0x${string}`> {
  if (!DEPLOYER_PRIVATE_KEY) throw new Error("DEPLOYER_PRIVATE_KEY not configured");

  const account = privateKeyToAccount(DEPLOYER_PRIVATE_KEY);
  const nonce = await publicClient.getTransactionCount({ address: DEPLOYER_ADDRESS });
  const block = await publicClient.getBlock();
  const baseFee = block.baseFeePerGas || BigInt(0);

  // EIP-1559 transaction — Shannon testnet has baseFeePerGas
  const maxPriorityFeePerGas = BigInt(1000000000); // 1 Gwei tip
  const maxFeePerGas = baseFee * BigInt(2) + maxPriorityFeePerGas; // 2x base + tip

  const tx = {
    to,
    data: encodedData,
    nonce,
    gasLimit: BigInt(300000),
    maxFeePerGas,
    maxPriorityFeePerGas,
    chainId: somniaShannon.id,
    type: "eip1559" as const,
  };

  // Sign locally
  const signed = await account.signTransaction(tx);

  // Broadcast
  const hash = await publicClient.sendRawTransaction({ serializedTransaction: signed });
  return hash;
}

// POST /api/record-trade
// Body: { address: string, won: boolean }
export async function POST(req: NextRequest) {
  try {
    if (!DEPLOYER_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Server not configured — DEPLOYER_PRIVATE_KEY missing" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { address, won } = body as { address: string; won: boolean };

    if (!address || typeof won !== "boolean") {
      return NextResponse.json(
        { error: "Missing address or won parameter" },
        { status: 400 }
      );
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      );
    }

    const userAddress = address as Address;

    // 1. Encode recordTrade call
    const streakData = encodeFunctionData({
      abi: StreakRegistryABI,
      functionName: "recordTrade",
      args: [userAddress, won],
    });

    // 2. Sign and broadcast
    const streakHash = await signAndSend(
      streakData,
      CONTRACT_ADDRESSES.StreakRegistry as Address
    );

    // 3. Wait for confirmation
    const streakReceipt = await publicClient.waitForTransactionReceipt({
      hash: streakHash,
    });

    // 4. Read updated record
    const record = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.StreakRegistry as Address,
      abi: StreakRegistryABI,
      functionName: "getRecord",
      args: [userAddress],
    });

    const [streak, bestStreak, totalTrades, wins] = record as [bigint, bigint, bigint, bigint];

    // 5. Update score on ScoreOracle (best effort)
    let scoreHash: `0x${string}` | null = null;
    try {
      const scoreData = encodeFunctionData({
        abi: ScoreOracleABI,
        functionName: "updateScore",
        args: [userAddress, streak, bestStreak, totalTrades, wins],
      });
      scoreHash = await signAndSend(scoreData, CONTRACT_ADDRESSES.ScoreOracle as Address);
      await publicClient.waitForTransactionReceipt({ hash: scoreHash });
    } catch (e) {
      console.error("ScoreOracle update failed:", e);
    }

    return NextResponse.json({
      success: true,
      streakTxHash: streakHash,
      scoreTxHash: scoreHash,
      streakReceipt: {
        status: streakReceipt.status,
        blockNumber: Number(streakReceipt.blockNumber),
      },
      record: {
        streak: Number(streak),
        bestStreak: Number(bestStreak),
        totalTrades: Number(totalTrades),
        wins: Number(wins),
        winRate: Number(totalTrades) > 0
          ? Math.round((Number(wins) / Number(totalTrades)) * 100)
          : 0,
      },
    });
  } catch (e: any) {
    console.error("record-trade error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to record trade on-chain" },
      { status: 500 }
    );
  }
}
