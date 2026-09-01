"use client";

import { useState, useEffect, useCallback } from "react";
import { SomniaMarkets } from "@somnia-chain/markets-sdk";
import { somniaShannon } from "@somnia-chain/markets-sdk/chains";
import { SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";

export interface LiveMarket {
  symbol: string;       // YES/UP token symbol (e.g. "BTC-118500-31DEC26/USDC#YES")
  downSymbol: string;   // NO/DOWN token symbol (e.g. "BTC-118500-31DEC26/USDC#NO")
  marketSymbol: string; // Market symbol without outcome (e.g. "BTC-118500-31DEC26/USDC")
  underlying: string;
  window: string;
  expiry: number;
  upProbability: number;
  marketId: string;
  poolAddress: string;
  status: number;
}

// Read-only exchange for market discovery (no wallet needed)
let readExchange: SomniaMarkets | null = null;

function getReadExchange(): SomniaMarkets {
  if (readExchange) return readExchange;
  readExchange = new SomniaMarkets({
    indexerUrl: "https://dev.smk.somnia.host/v1/graphql",
    chain: somniaShannon,
    wsRpcUrl: "wss://api.infra.testnet.somnia.network/ws",
    addresses: SOMNIA_TESTNET_ADDRESSES,
  });
  return readExchange;
}

export function useMarkets() {
  const [markets, setMarkets] = useState<LiveMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = useCallback(async () => {
    try {
      const exchange = getReadExchange();

      // Load markets first — populates exchange.markets with UnifiedMarket objects
      await exchange.loadMarkets();

      // Get live binary markets from the indexer
      const binaryMarkets = await exchange.client.listLiveBinaryMarkets({
        limit: 20,
      });

      const liveMarkets: LiveMarket[] = [];

      for (const m of binaryMarkets as any[]) {
        try {
          // Check on-chain status
          const onchain = await exchange.client.getMarketOnchain(
            m.marketId as `0x${string}`
          );
          if (onchain.status !== 1) continue;

          // Get the UnifiedMarket from exchange.markets to find outcome symbols
          // The market symbol format is: {asset}-{strike}-{expiryDate}/USDC
          // We need to find it in exchange.markets
          let upSymbol = "";
          let downSymbol = "";
          let marketSymbol = "";

          // Try to find the market in exchange.markets by marketId
          for (const [sym, unifiedMarket] of Object.entries(exchange.markets)) {
            if (unifiedMarket.id === m.marketId || unifiedMarket.id === m.poolAddress) {
              marketSymbol = sym;
              // Get outcome symbols from the UnifiedMarket
              if (unifiedMarket.outcomes && unifiedMarket.outcomes.length >= 2) {
                upSymbol = unifiedMarket.outcomes[0].symbol; // YES
                downSymbol = unifiedMarket.outcomes[1].symbol; // NO
              }
              break;
            }
          }

          // Fallback: construct symbol from binary market data
          if (!upSymbol) {
            // Try to find any market with matching asset
            for (const [sym, unifiedMarket] of Object.entries(exchange.markets)) {
              if (unifiedMarket.base && unifiedMarket.base.includes(m.asset)) {
                marketSymbol = sym;
                if (unifiedMarket.outcomes && unifiedMarket.outcomes.length >= 2) {
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

          // Determine window from intervalSec
          const intervalSec = m.intervalSec || 900;
          const window = intervalSec === 900 ? "15 min" : intervalSec === 3600 ? "1 hour" : `${Math.round(intervalSec / 60)} min`;

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
