"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPublicClient, createWalletClient, custom, http, type PublicClient, type WalletClient, type Address } from "viem";
import { somniaShannon } from "@somnia-chain/markets-sdk/chains";
import { CONTRACT_ADDRESSES, ABIS } from "@/lib/contracts";

interface OnChainState {
  streak: number;
  bestStreak: number;
  totalTrades: number;
  wins: number;
  winRate: number;
  predictionScore: number;
  shields: number;
  canClaimFree: boolean;
  totalChallenges: number;
  loading: boolean;
  error: string | null;
}

// Singleton public client — avoid creating a new one per render
const publicClient = createPublicClient({
  chain: somniaShannon,
  transport: http("https://api.infra.testnet.somnia.network"),
});

export function useOnChain(walletClient: WalletClient | null, address: Address | null) {
  const [state, setState] = useState<OnChainState>({
    streak: 0,
    bestStreak: 0,
    totalTrades: 0,
    wins: 0,
    winRate: 0,
    predictionScore: 0,
    shields: 0,
    canClaimFree: false,
    totalChallenges: 0,
    loading: false,
    error: null,
  });

  // Read on-chain data
  const refreshOnChainData = useCallback(async () => {
    if (!address) return;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      // Read streak
      const streakResult = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.StreakRegistry as Address,
        abi: ABIS.StreakRegistry,
        functionName: "getRecord",
        args: [address],
      });

      const [streak, bestStreak, totalTrades, wins, winRate, lastTradeAt] = streakResult as [bigint, bigint, bigint, bigint, bigint, bigint];

      // Read shields
      const shieldResult = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.ShieldManager as Address,
        abi: ABIS.ShieldManager,
        functionName: "getShieldState",
        args: [address],
      });

      const [shieldCount, canClaimFree] = shieldResult as [bigint, boolean, bigint, bigint];

      // Read score
      const scoreResult = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.ScoreOracle as Address,
        abi: ABIS.ScoreOracle,
        functionName: "getScore",
        args: [address],
      });

      const score = scoreResult as bigint;

      // Read total challenges
      const totalChallenges = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.ChallengeArena as Address,
        abi: ABIS.ChallengeArena,
        functionName: "totalChallenges",
      });

      setState({
        streak: Number(streak),
        bestStreak: Number(bestStreak),
        totalTrades: Number(totalTrades),
        wins: Number(wins),
        winRate: Number(winRate),
        predictionScore: Number(score),
        shields: Number(shieldCount),
        canClaimFree,
        totalChallenges: Number(totalChallenges),
        loading: false,
        error: null,
      });
    } catch (e: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e.message || "Failed to read on-chain data",
      }));
    }
  }, [address, publicClient]);

  // Write to StreakRegistry
  const recordTrade = useCallback(async (won: boolean) => {
    if (!walletClient || !address) throw new Error("Wallet not connected");

    const walletClient2 = createWalletClient({
      account: address,
      chain: somniaShannon,
      transport: custom((window as any).ethereum),
    });

    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESSES.StreakRegistry as Address,
      abi: ABIS.StreakRegistry,
      functionName: "recordTrade",
      args: [address, won],
      account: address,
    });

    const hash = await walletClient2.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });
    await refreshOnChainData();
    return hash;
  }, [walletClient, address, publicClient, refreshOnChainData]);

  // Write to ShieldManager
  const activateShield = useCallback(async () => {
    if (!walletClient || !address) throw new Error("Wallet not connected");

    const walletClient2 = createWalletClient({
      account: address,
      chain: somniaShannon,
      transport: custom((window as any).ethereum),
    });

    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESSES.ShieldManager as Address,
      abi: ABIS.ShieldManager,
      functionName: "activateShield",
      args: [address],
      account: address,
    });

    const hash = await walletClient2.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });
    await refreshOnChainData();
    return hash;
  }, [walletClient, address, publicClient, refreshOnChainData]);

  // Write to ScoreOracle
  const updateScore = useCallback(async (streak: number, bestStreak: number, totalTrades: number, wins: number) => {
    if (!walletClient || !address) throw new Error("Wallet not connected");

    const walletClient2 = createWalletClient({
      account: address,
      chain: somniaShannon,
      transport: custom((window as any).ethereum),
    });

    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESSES.ScoreOracle as Address,
      abi: ABIS.ScoreOracle,
      functionName: "updateScore",
      args: [address, BigInt(streak), BigInt(bestStreak), BigInt(totalTrades), BigInt(wins)],
      account: address,
    });

    const hash = await walletClient2.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });
    await refreshOnChainData();
    return hash;
  }, [walletClient, address, publicClient, refreshOnChainData]);

  // Write to ChallengeArena
  const createChallenge = useCallback(async (marketSymbol: string, side: number, stake: number) => {
    if (!walletClient || !address) throw new Error("Wallet not connected");

    const walletClient2 = createWalletClient({
      account: address,
      chain: somniaShannon,
      transport: custom((window as any).ethereum),
    });

    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESSES.ChallengeArena as Address,
      abi: ABIS.ChallengeArena,
      functionName: "createChallenge",
      args: [address, marketSymbol, side, BigInt(stake)],
      account: address,
    });

    const hash = await walletClient2.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });
    await refreshOnChainData();
    return hash;
  }, [walletClient, address, publicClient, refreshOnChainData]);

  // Auto-refresh on mount and address change
  useEffect(() => {
    if (address) {
      refreshOnChainData();
    }
  }, [address, refreshOnChainData]);

  return {
    ...state,
    refreshOnChainData,
    recordTrade,
    activateShield,
    updateScore,
    createChallenge,
  };
}
