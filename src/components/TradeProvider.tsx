"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useExchange } from "@/hooks/useExchange";
import { useOnChain } from "@/hooks/useOnChain";
import { useStreakSync } from "@/hooks/useStreakSync";

interface TradeContextType {
  // Wallet
  address: `0x${string}` | null;
  chainId: number | null;
  connecting: boolean;
  walletError: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;

  // Exchange
  exchange: any | null;
  balance: number;
  exchangeLoading: boolean;
  exchangeError: string | null;
  marketsLoaded: boolean;

  // On-chain gamification
  onChainStreak: number;
  onChainBestStreak: number;
  onChainTotalTrades: number;
  onChainWins: number;
  onChainWinRate: number;
  onChainPredictionScore: number;
  onChainShields: number;
  onChainCanClaimFree: boolean;
  onChainLoading: boolean;

  // Actions
  refreshBalance: () => Promise<void>;
  placeOrder: (
    symbol: string,
    side: "buy" | "sell",
    amount: number,
    price?: number,
    timeInForce?: "IOC" | "GTC" | "FOK"
  ) => Promise<any>;
  redeem: (symbol: string, amount: number) => Promise<any>;
  recordTradeOnChain: (won: boolean) => Promise<string>;
  updateScoreOnChain: (streak: number, bestStreak: number, totalTrades: number, wins: number) => Promise<string>;
  activateShieldOnChain: () => Promise<string>;
  refreshOnChain: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const TradeContext = createContext<TradeContextType | null>(null);

export function useTrade() {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error("useTrade must be used within TradeProvider");
  return ctx;
}

export default function TradeProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const exchange = useExchange(
    wallet.walletClient,
    wallet.publicClient,
    wallet.address
  );
  const onChain = useOnChain(wallet.walletClient, wallet.address);
  const { loadFromAPI, saveToAPI } = useStreakSync(wallet.address);

  return (
    <TradeContext.Provider
      value={{
        address: wallet.address,
        chainId: wallet.chainId,
        connecting: wallet.connecting,
        walletError: wallet.error,
        connect: wallet.connect,
        disconnect: wallet.disconnect,
        balance: exchange.balance,
        exchange: exchange.exchange,
        exchangeLoading: exchange.loading,
        exchangeError: exchange.error,
        marketsLoaded: exchange.marketsLoaded,
        refreshBalance: exchange.refreshBalance,
        placeOrder: exchange.placeOrder,
        redeem: exchange.redeem,

        // On-chain gamification
        onChainStreak: onChain.streak,
        onChainBestStreak: onChain.bestStreak,
        onChainTotalTrades: onChain.totalTrades,
        onChainWins: onChain.wins,
        onChainWinRate: onChain.winRate,
        onChainPredictionScore: onChain.predictionScore,
        onChainShields: onChain.shields,
        onChainCanClaimFree: onChain.canClaimFree,
        onChainLoading: onChain.loading,
        recordTradeOnChain: onChain.recordTrade,
        updateScoreOnChain: onChain.updateScore,
        activateShieldOnChain: onChain.activateShield,
        refreshOnChain: onChain.refreshOnChainData,
        syncNow: saveToAPI,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
}
