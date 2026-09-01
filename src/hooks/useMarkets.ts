"use client";

import { useState, useEffect, useCallback } from "react";
import { getReadExchange } from "@/lib/sdkRead";

export interface LiveMarket {
  symbol: string;
  underlying: string;
  window: string;
  expiry: number;
  upProbability: number;
  marketId: string;
  poolAddress: string;
  status: number;
}

export function useMarkets() {
  const [markets, setMarkets] = useState<LiveMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = useCallback(async () => {
    try {
      const exchange = getReadExchange();
      const binaryMarkets = await exchange.client.listLiveBinaryMarkets({
        limit: 20,
      });

      const liveMarkets: LiveMarket[] = [];

      for (const m of binaryMarkets as any[]) {
        try {
          const onchain = await exchange.client.getMarketOnchain(
            m.marketId as `0x${string}`
          );
          if (onchain.status !== 1) continue;

          const upSymbol =
            m.outcomes?.[0]?.symbol || m.symbol || `${m.underlying}-UP`;
          if (!upSymbol) continue;

          const book = await exchange.fetchOrderBook(upSymbol, 5);
          const bestBid = book.bids[0]?.[0];
          const bestAsk = book.asks[0]?.[0];

          let upProb = 50;
          if (bestBid && bestAsk) {
            upProb = Math.round(((bestBid + bestAsk) / 2) * 100);
          } else if (bestAsk) {
            upProb = Math.round(bestAsk * 100);
          } else if (bestBid) {
            upProb = Math.round(bestBid * 100);
          }

          const parts = upSymbol.split("-");
          const underlying = parts[0] === "BTC" ? "Bitcoin" : "Ethereum";
          const windowMatch = upSymbol.includes("15M")
            ? "15 min"
            : upSymbol.includes("1H")
            ? "1 hour"
            : "15 min";

          liveMarkets.push({
            symbol: upSymbol,
            underlying,
            window: windowMatch,
            expiry: Number(m.expiry) * 1000,
            upProbability: Math.max(5, Math.min(95, upProb)),
            marketId: m.marketId,
            poolAddress: m.poolAddress || "",
            status: onchain.status,
          });
        } catch {
          continue;
        }
      }

      setMarkets(liveMarkets);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to fetch markets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 10000);
    return () => clearInterval(interval);
  }, [fetchMarkets]);

  return { markets, loading, error, refetch: fetchMarkets };
}
