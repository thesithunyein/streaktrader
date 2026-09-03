import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http, type Address } from "viem";
import { somniaShannon } from "@somnia-chain/markets-sdk/chains";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import StreakRegistryABI from "@/lib/abis/StreakRegistry.json";
import ScoreOracleABI from "@/lib/abis/ScoreOracle.json";

// Deployer wallet — only this wallet can call onlyOwner functions
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}` | undefined;
const DEPLOYER_ADDRESS = "0x7A35f63F81357DaDE2cff8f5699b935786Aa9Da2" as Address;

// Server-side clients (created once)
const publicClient = createPublicClient({
  chain: somniaShannon,
  transport: http("https://api.infra.testnet.somnia.network"),
});

function getWalletClient() {
  if (!DEPLOYER_PRIVATE_KEY) {
    throw new Error("DEPLOYER_PRIVATE_KEY not configured");
  }
  return createWalletClient({
    account: DEPLOYER_ADDRESS,
    chain: somniaShannon,
    transport: http("https://api.infra.testnet.somnia.network"),
    key: DEPLOYER_PRIVATE_KEY,
  });
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

    const wallet = getWalletClient();
    const userAddress = address as Address;

    // 1. Record trade on StreakRegistry
    const streakHash = await wallet.writeContract({
      address: CONTRACT_ADDRESSES.StreakRegistry as Address,
      abi: StreakRegistryABI,
      functionName: "recordTrade",
      args: [userAddress, won],
    });

    // Wait for confirmation
    const streakReceipt = await publicClient.waitForTransactionReceipt({
      hash: streakHash,
    });

    // 2. Read updated record to get current streak
    const record = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.StreakRegistry as Address,
      abi: StreakRegistryABI,
      functionName: "getRecord",
      args: [userAddress],
    });

    const [streak, bestStreak, totalTrades, wins] = record as [bigint, bigint, bigint, bigint];

    // 3. Update score on ScoreOracle
    let scoreHash: `0x${string}` | null = null;
    try {
      scoreHash = await wallet.writeContract({
        address: CONTRACT_ADDRESSES.ScoreOracle as Address,
        abi: ScoreOracleABI,
        functionName: "updateScore",
        args: [userAddress, streak, bestStreak, totalTrades, wins],
      });
      await publicClient.waitForTransactionReceipt({ hash: scoreHash });
    } catch (e) {
      // ScoreOracle might fail — don't block the main flow
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
