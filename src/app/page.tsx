"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StreakBadge";
import MarketCard from "@/components/MarketCard";
import TradePanel from "@/components/TradePanel";
import SettlementView from "@/components/SettlementView";
import Footer from "@/components/Footer";
import { Zap, Shield, TrendingUp, Activity } from "lucide-react";

interface MarketData {
  symbol: string;
  underlying: string;
  window: string;
  expiry: number;
  upProbability: number;
}

const INITIAL_MARKETS: MarketData[] = [
  {
    symbol: "BTC-0-01SEP26-15M#YES",
    underlying: "Bitcoin",
    window: "15 min",
    expiry: Date.now() + 15 * 60 * 1000,
    upProbability: 67,
  },
  {
    symbol: "BTC-0-01SEP26-1H#YES",
    underlying: "Bitcoin",
    window: "1 hour",
    expiry: Date.now() + 45 * 60 * 1000,
    upProbability: 54,
  },
  {
    symbol: "ETH-0-01SEP26-15M#YES",
    underlying: "Ethereum",
    window: "15 min",
    expiry: Date.now() + 8 * 60 * 1000,
    upProbability: 72,
  },
  {
    symbol: "ETH-0-01SEP26-1H#YES",
    underlying: "Ethereum",
    window: "1 hour",
    expiry: Date.now() + 52 * 60 * 1000,
    upProbability: 48,
  },
];

export default function Home() {
  const [markets, setMarkets] = useState<MarketData[]>(INITIAL_MARKETS);
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setMarkets((prev) =>
        prev.map((m) => ({
          ...m,
          upProbability: Math.max(
            15,
            Math.min(85, m.upProbability + (Math.random() - 0.5) * 3)
          ),
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden relative mx-auto mb-5 shadow-lg shadow-accent/20">
            <Image
              src="/logo.png"
              alt="StreakTrader"
              fill
              className="object-cover"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Live on Shannon Testnet
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text mb-3">
            Build your streak.{" "}
            <span className="text-gradient">Ride the wave.</span>
          </h1>
          <p className="text-base sm:text-lg text-text-dim max-w-xl mx-auto">
            Trade Bitcoin and Ethereum event contracts. Every win builds your
            streak. Every streak multiplies your earnings.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <StatsBar />
        </div>

        {/* Live Markets */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <h2 className="text-lg font-bold text-text">Live Markets</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {markets.map((market) => (
              <MarketCard
                key={market.symbol}
                {...market}
                onTrade={() => setSelectedMarket(market)}
              />
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="glass rounded-3xl p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-bold text-text mb-6 text-center">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-sm font-bold text-text mb-1">
                  Pick Your Side
                </div>
                <div className="text-xs text-text-dim">
                  Choose UP or DOWN for any live BTC or ETH event contract
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-sm font-bold text-text mb-1">
                  Build Your Streak
                </div>
                <div className="text-xs text-text-dim">
                  Win consecutive trades to grow your multiplier
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-up/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-up" />
              </div>
              <div>
                <div className="text-sm font-bold text-text mb-1">
                  Multiply Earnings
                </div>
                <div className="text-xs text-text-dim">
                  Higher streaks = higher payouts on every trade
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="glass rounded-2xl p-5 card-hover">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-sm font-bold text-text mb-1">
                  Zero Fees
                </div>
                <div className="text-xs text-text-dim">
                  No entry, settlement, or winnings fees on DreamDEX. Your stake
                  is your maximum risk.
                </div>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-5 card-hover">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-sm font-bold text-text mb-1">
                  Lock Your Streak
                </div>
                <div className="text-xs text-text-dim">
                  On a hot streak? Lock it in to cash out your multiplier
                  earnings without risking the next trade.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {selectedMarket && (
        <TradePanel
          market={selectedMarket}
          onClose={() => setSelectedMarket(null)}
        />
      )}

      <SettlementView />
    </div>
  );
}
