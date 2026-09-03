"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SomniaMarkets } from "@somnia-chain/markets-sdk";
import { somniaShannon } from "@somnia-chain/markets-sdk/chains";
import { SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";

export interface LiveMarket {
  symbol: string;
  downSymbol: string;
  marketSymbol: string;
  underlying: string;
  window: string;
  expiry: number;
  upProbability: number;
  marketId: string;
  poolAddress: string;
  status: number;
}

// Singleton read-only exchange — reuse the same connection
let readExchange: SomniaMarkets | null = null;
let exchangeRefCount = 0;

function getReadExchange(): SomniaMarkets {
  if (readExchange) return readExchange;
  readExchange = new SomniaMarkets({
    indexerUrl: "https://stg.api.dreamdex.io/v1/graphql",
    chain: somniaShannon,
    wsRpcUrl: "wss://stg.api.dreamdex.io/ws/public",
    addresses: SOMNIA_TESTNET_ADDRESSES,
  });
  return readExchange;
}

function releaseReadExchange() {
  if (readExchange && exchangeRefCount <= 0) {
    try {
      readExchange.close();
    } catch {}
    readExchange = null;
  }
}

// Retry wrapper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  baseDelay = 3000
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt < maxRetries) {
        await new Promise((r) =>
          setTimeout(r, baseDelay * Math.pow(2, attempt))
        );
      }
    }
  }
  throw lastError;
}

export function useMarkets() {
  const [markets, setMarkets] = useState<LiveMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);
  const abortRef = useRef(false);

  const fetchMarkets = useCallback(async () => {
    if (!mountedRef.current || abortRef.current) return;
    abortRef.current = true;

    try {
      const exchange = getReadExchange();
      exchangeRefCount++;

      // Load markets with retry
      await withRetry(() => exchange.loadMarkets(), 2, 3000);

      // Get live binary markets with retry
      const binaryMarkets = await withRetry(
        () => exchange.client.listLiveBinaryMarkets({ limit: 20 }),
        2,
        3000
      );

      const liveMarkets: LiveMarket[] = [];

      for (const m of binaryMarkets as any[]) {
        try {
          // Check on-chain status
          const onchain = await exchange.client.getMarketOnchain(
            m.marketId as `0x${string}`
          );
          if (onchain.status !== 1) continue;

          let upSymbol = "";
          let downSymbol = "";
          let marketSymbol = "";

          // Find the market in exchange.markets by marketId
          for (const [sym, unifiedMarket] of Object.entries(
            exchange.markets
          )) {
            if (
              unifiedMarket.id === m.marketId ||
              unifiedMarket.id === m.poolAddress
            ) {
              marketSymbol = sym;
              if (
                unifiedMarket.outcomes &&
                unifiedMarket.outcomes.length >= 2
              ) {
                upSymbol = unifiedMarket.outcomes[0].symbol;
                downSymbol = unifiedMarket.outcomes[1].symbol;
              }
              break;
            }
          }

          // Fallback: construct symbol from binary market data
          if (!upSymbol) {
            for (const [sym, unifiedMarket] of Object.entries(
              exchange.markets
            )) {
              if (
                unifiedMarket.base &&
                unifiedMarket.base.includes(m.asset)
              ) {
                marketSymbol = sym;
                if (
                  unifiedMarket.outcomes &&
                  unifiedMarket.outcomes.length >= 2
                ) {
                  upSymbol = unifiedMarket.outcomes[0].symbol;
                  downSymbol = unifiedMarket.outcomes[1].symbol;
                }
                break;
              }
            }
          }

          if (!upSymbol) continue;

          // Get order book for probability
          let upProb = 50;
          try {
            const book = await exchange.fetchOrderBook(upSymbol, 5);
            const bestBid = book.bids[0]?.[0];
            const bestAsk = book.asks[0]?.[0];

            if (bestBid && bestAsk) {
              upProb = Math.round(((bestBid + bestAsk) / 2) * 100);
            } else if (bestAsk) {
              upProb = Math.round(bestAsk * 100);
            } else if (bestBid) {
              upProb = Math.round(bestBid * 100);
            }
          } catch {
            // Use default probability
          }

          const intervalSec = m.intervalSec || 900;
          const window =
            intervalSec === 900
              ? "15 min"
              : intervalSec === 3600
                ? "1 hour"
                : `${Math.round(intervalSec / 60)} min`;

          liveMarkets.push({
            symbol: upSymbol,
            downSymbol,
            marketSymbol,
            underlying: m.asset || "BTC",
            window,
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

      if (mountedRef.current) {
        setMarkets(liveMarkets);
        setError(null);
        setRetryCount(0);
      }
    } catch (e: any) {
      if (mountedRef.current) {
        const msg = e?.message || "Failed to fetch markets";
        if (msg.includes("timed out") || msg.includes("timeout")) {
          setError(
            "Testnet indexer is responding slowly. Retrying automatically..."
          );
        } else {
          setError(msg);
        }
      }
    } finally {
      if (mountedRef.current) setLoading(false);
      abortRef.current = false;
      exchangeRefCount--;
    }
  }, []);

  // Manual retry
  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRetryCount((c) => c + 1);
    fetchMarkets();
  }, [fetchMarkets]);

  useEffect(() => {
    mountedRef.current = true;
    fetchMarkets();
    // Poll every 60s instead of 30s to prevent resource exhaustion
    const interval = setInterval(fetchMarkets, 60000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchMarkets, retryCount]);

  return { markets, loading, error, refetch: retry };
}
