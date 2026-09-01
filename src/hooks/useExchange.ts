"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SomniaMarkets, type UnifiedBalance } from "@somnia-chain/markets-sdk";
import { somniaShannon } from "@somnia-chain/markets-sdk/chains";
import { SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";
import type { WalletClient, Address } from "viem";

interface ExchangeState {
  exchange: SomniaMarkets | null;
  balance: number;
  positions: any[];
  loading: boolean;
  error: string | null;
}

export function useExchange(
  walletClient: WalletClient | null,
  _publicClient: any | null,
  address: Address | null
) {
  const [state, setState] = useState<ExchangeState>({
    exchange: null,
    balance: 0,
    positions: [],
    loading: false,
    error: null,
  });
  const exchangeRef = useRef<SomniaMarkets | null>(null);

  // Initialize exchange when wallet connects
  useEffect(() => {
    if (!walletClient || !address) {
      setState((s) => ({ ...s, exchange: null, balance: 0, positions: [] }));
      return;
    }

    const initExchange = async () => {
      try {
        const exchange = new SomniaMarkets({
          indexerUrl: "https://dev.smk.somnia.host/v1/graphql",
          chain: somniaShannon,
          wsRpcUrl: "wss://api.infra.testnet.somnia.network/ws",
          addresses: SOMNIA_TESTNET_ADDRESSES,
          walletClient,
        } as any);

        exchangeRef.current = exchange;
        setState((s) => ({ ...s, exchange, loading: true }));

        // Fetch balance
        try {
          const bal = await exchange.fetchBalance();
          // Find USDC balance
          let usdcBalance = 0;
          for (const [token, info] of Object.entries(bal)) {
            if (info && typeof info === "object" && "free" in (info as any)) {
              usdcBalance = Number((info as any).free);
              break;
            }
          }
          setState((s) => ({
            ...s,
            exchange,
            balance: usdcBalance,
            loading: false,
          }));
        } catch {
          setState((s) => ({ ...s, exchange, loading: false }));
        }
      } catch (e: any) {
        setState((s) => ({
          ...s,
          error: e.message || "Failed to init exchange",
          loading: false,
        }));
      }
    };

    initExchange();

    return () => {
      if (exchangeRef.current) {
        exchangeRef.current.close();
        exchangeRef.current = null;
      }
    };
  }, [walletClient, address]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!exchangeRef.current) return;
    try {
      const bal = await exchangeRef.current.fetchBalance();
      let usdcBalance = 0;
      for (const [token, info] of Object.entries(bal)) {
        if (info && typeof info === "object" && "free" in (info as any)) {
          usdcBalance = Number((info as any).free);
          break;
        }
      }
      setState((s) => ({ ...s, balance: usdcBalance }));
    } catch {}
  }, []);

  // Place a real order
  const placeOrder = useCallback(
    async (
      symbol: string,
      side: "buy" | "sell",
      amount: number,
      price?: number,
      timeInForce?: "IOC" | "GTC" | "FOK"
    ) => {
      if (!exchangeRef.current) throw new Error("Exchange not connected");
      const order = await exchangeRef.current.createOrder(
        symbol,
        price ? "limit" : "market",
        side,
        amount,
        price,
        { timeInForce: timeInForce || "IOC" }
      );
      await refreshBalance();
      return order;
    },
    [refreshBalance]
  );

  // Redeem winnings
  const redeem = useCallback(
    async (symbol: string, amount: number) => {
      if (!exchangeRef.current) throw new Error("Exchange not connected");
      const result = await exchangeRef.current.redeem(symbol, amount);
      await refreshBalance();
      return result;
    },
    [refreshBalance]
  );

  return { ...state, refreshBalance, placeOrder, redeem };
}
