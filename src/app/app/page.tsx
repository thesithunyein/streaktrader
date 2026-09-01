"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StreakBadge";
import MarketCard from "@/components/MarketCard";
import TradePanel from "@/components/TradePanel";
import SettlementView from "@/components/SettlementView";
import Footer from "@/components/Footer";
import { useMarkets } from "@/hooks/useMarkets";
import { Activity, Loader2, ArrowLeft } from "lucide-react";



// Loading skeleton
function MarketSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/5" />
          <div>
            <div className="h-4 w-20 bg-white/5 rounded mb-1" />
            <div className="h-3 w-16 bg-white/5 rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-white/5 rounded-full" />
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 w-12 bg-white/5 rounded" />
          <div className="h-3 w-14 bg-white/5 rounded" />
        </div>
        <div className="h-2.5 rounded-full bg-white/5" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-12 rounded-xl bg-white/5" />
        <div className="h-12 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

export default function TradingApp() {
  const { markets: liveMarkets, loading, error } = useMarkets();
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check first visit
    const visited = localStorage.getItem("streaktrader-visited");
    if (!visited) {
      setShowOnboarding(true);
      localStorage.setItem("streaktrader-visited", "true");
    }
  }, []);

  if (!mounted) return null;

  const markets = liveMarkets;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">


        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <StatsBar />
        </motion.div>

        {/* Live Markets */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <h2 className="text-lg font-bold text-text">Live Markets</h2>
            {loading && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
          </div>

          {loading && markets.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <MarketSkeleton />
              <MarketSkeleton />
              <MarketSkeleton />
              <MarketSkeleton />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence>
                {markets.map((market, i) => (
                  <motion.div
                    key={market.symbol}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
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

          {/* Empty state */}
          {!loading && markets.length === 0 && !error && (
            <div className="glass rounded-2xl p-8 sm:p-12 text-center">
              <Activity className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-sm font-semibold text-text mb-1">No markets open right now</p>
              <p className="text-xs text-text-muted max-w-xs mx-auto">
                BTC and ETH event contracts open on a rolling schedule.
                New trading windows launch every 15 minutes — check back shortly.
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="mt-3 p-3 rounded-xl bg-down/10 border border-down/20 text-sm text-down">
              {error}
            </div>
          )}
        </div>

        {/* How It Works */}


      </main>

      <Footer />

      {/* Trade Panel */}
      <AnimatePresence>
        {selectedMarket && (
          <TradePanel
            market={selectedMarket}
            onClose={() => setSelectedMarket(null)}
          />
        )}
      </AnimatePresence>

      {/* Settlement */}
      <SettlementView />

      {/* First-visit onboarding */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass-strong rounded-3xl p-8 max-w-sm w-full mx-4 text-center"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden relative mx-auto mb-5 shadow-lg shadow-accent/20">
                <Image
                  src="/logo.png"
                  alt="StreakTrader"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-text mb-2">
                Welcome to StreakTrader
              </h3>
              <p className="text-sm text-text-dim mb-6 leading-relaxed">
                Predict whether BTC or ETH goes up or down. Win consecutive
                trades to build your streak multiplier and maximize earnings.
              </p>
              <div className="space-y-3 text-left mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-accent text-sm">1</span>
                  </div>
                  <span className="text-sm text-text">Pick a live market and choose UP or DOWN</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-accent text-sm">2</span>
                  </div>
                  <span className="text-sm text-text">Win trades to grow your streak multiplier</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-accent text-sm">3</span>
                  </div>
                  <span className="text-sm text-text">Higher streaks = higher payouts on every trade</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowOnboarding(false)}
                className="w-full btn-primary py-3 rounded-xl text-sm font-bold text-white"
              >
                Get Started
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
