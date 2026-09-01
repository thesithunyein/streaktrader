"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useExchange } from "@/hooks/useExchange";

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
        refreshBalance: exchange.refreshBalance,
        placeOrder: exchange.placeOrder,
        redeem: exchange.redeem,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
}
