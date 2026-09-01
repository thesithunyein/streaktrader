"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StreakBadge";
import MarketCard from "@/components/MarketCard";
import TradePanel from "@/components/TradePanel";
import SettlementView from "@/components/SettlementView";
import Footer from "@/components/Footer";
import { useMarkets } from "@/hooks/useMarkets";
import { Zap, Shield, TrendingUp, Activity, Loader2 } from "lucide-react";

// Fallback mock data if SDK is unavailable
const MOCK_MARKETS = [
  {
    symbol: "BTC-0-01SEP26-15M#YES",
    underlying: "Bitcoin",
    window: "15 min",
    expiry: Date.now() + 15 * 60 * 1000,
    upProbability: 67,
    marketId: "mock-1",
    poolAddress: "0x0",
    status: 1,
  },
  {
    symbol: "BTC-0-01SEP26-1H#YES",
    underlying: "Bitcoin",
    window: "1 hour",
    expiry: Date.now() + 45 * 60 * 1000,
    upProbability: 54,
    marketId: "mock-2",
    poolAddress: "0x0",
    status: 1,
  },
  {
    symbol: "ETH-0-01SEP26-15M#YES",
    underlying: "Ethereum",
    window: "15 min",
    expiry: Date.now() + 8 * 60 * 1000,
    upProbability: 72,
    marketId: "mock-3",
    poolAddress: "0x0",
    status: 1,
  },
  {
    symbol: "ETH-0-01SEP26-1H#YES",
    underlying: "Ethereum",
    window: "1 hour",
    expiry: Date.now() + 52 * 60 * 1000,
    upProbability: 48,
    marketId: "mock-4",
    poolAddress: "0x0",
    status: 1,
  },
];

export default function Home() {
  const { markets: liveMarkets, loading, error } = useMarkets();
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Use live data if available, fallback to mock
  const markets = liveMarkets.length > 0 ? liveMarkets : MOCK_MARKETS;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-2xl overflow-hidden relative mx-auto mb-5 shadow-lg shadow-accent/20"
          >
            <Image
              src="/logo.png"
              alt="StreakTrader"
              fill
              className="object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4"
          >
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              {loading ? "Connecting..." : error ? "Demo Mode" : "Live on Shannon Testnet"}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text mb-3"
          >
            Build your streak.{" "}
            <span className="text-gradient">Ride the wave.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-base sm:text-lg text-text-dim max-w-xl mx-auto"
          >
            Trade Bitcoin and Ethereum event contracts. Every win builds your
            streak. Every streak multiplies your earnings.
          </motion.p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <StatsBar />
        </motion.div>

        {/* Live Markets */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <h2 className="text-lg font-bold text-text">Live Markets</h2>
            {loading && (
              <Loader2 className="w-4 h-4 text-accent animate-spin" />
            )}
          </div>

          {loading && markets.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
              <p className="text-sm text-text-dim">
                Connecting to DreamDEX...
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence>
                {markets.map((market, i) => (
                  <motion.div
                    key={market.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <MarketCard
                      {...market}
                      onTrade={() => setSelectedMarket(market)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-6 sm:p-8 mb-8"
        >
          <h2 className="text-lg font-bold text-text mb-6 text-center">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Pick Your Side",
                desc: "Choose UP or DOWN for any live BTC or ETH event contract",
              },
              {
                icon: Activity,
                title: "Build Your Streak",
                desc: "Win consecutive trades to grow your multiplier",
              },
              {
                icon: TrendingUp,
                title: "Multiply Earnings",
                desc: "Higher streaks = higher payouts on every trade",
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-bold text-text mb-1">
                    {step.title}
                  </div>
                  <div className="text-xs text-text-dim">{step.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {[
            {
              icon: Shield,
              title: "Zero Fees",
              desc: "No entry, settlement, or winnings fees on DreamDEX. Your stake is your maximum risk.",
            },
            {
              icon: Zap,
              title: "Lock Your Streak",
              desc: "On a hot streak? Lock it in to cash out your multiplier earnings without risking the next trade.",
            },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="glass rounded-2xl p-5 card-hover"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <feat.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-bold text-text mb-1">
                    {feat.title}
                  </div>
                  <div className="text-xs text-text-dim">{feat.desc}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {selectedMarket && (
          <TradePanel
            market={selectedMarket}
            onClose={() => setSelectedMarket(null)}
          />
        )}
      </AnimatePresence>

      <SettlementView />
    </div>
  );
}
