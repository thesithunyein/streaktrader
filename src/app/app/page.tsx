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
import { Zap, Shield, TrendingUp, Activity, Loader2, ArrowLeft } from "lucide-react";



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
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-dim hover:text-text transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </Link>

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
          {!loading && markets.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center">
              <Activity className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-dim mb-1">No live markets</p>
              <p className="text-xs text-text-muted">
                Check back soon — new windows open every 15 minutes.
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
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
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
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
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
                Trade prediction markets on DreamDEX. Pick UP or DOWN, build your
                streak, and multiply your earnings.
              </p>
              <div className="space-y-3 text-left mb-6">
                {[
                  { icon: Zap, text: "One-click UP/DOWN trading" },
                  { icon: Activity, text: "Streak multiplier grows your payout" },
                  { icon: Shield, text: "Zero fees, capped risk" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-sm text-text">{item.text}</span>
                  </div>
                ))}
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
