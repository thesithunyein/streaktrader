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
import StreakCard from "@/components/StreakCard";
import ChallengeModal from "@/components/ChallengeModal";
import ChallengeBanner from "@/components/ChallengeBanner";
import CopilotSidebar from "@/components/CopilotSidebar";
import Footer from "@/components/Footer";
import { useMarkets } from "@/hooks/useMarkets";
import { Activity, Loader2 } from "lucide-react";

// Professional loading skeleton with shimmer
function MarketSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-2xl p-5 overflow-hidden relative"
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse" />
          <div>
            <div className="h-3.5 w-16 bg-slate-100 rounded-md mb-1.5 animate-pulse" />
            <div className="h-2.5 w-12 bg-slate-100 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="h-2.5 w-10 bg-slate-100 rounded-md animate-pulse" />
          <div className="h-2.5 w-12 bg-slate-100 rounded-md animate-pulse" />
        </div>
        <div className="h-2.5 rounded-full bg-slate-100 animate-pulse" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    </motion.div>
  );
}

export default function TradingApp() {
  const { markets: liveMarkets, loading, error, refetch } = useMarkets();
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showStreakCard, setShowStreakCard] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);

  useEffect(() => {
    setMounted(true);
    const visited = localStorage.getItem("streaktrader-visited");
    if (!visited) {
      setShowOnboarding(true);
      localStorage.setItem("streaktrader-visited", "true");
    }

    // Listen for share-streak events from SettlementView
    const handleShareStreak = () => setShowStreakCard(true);
    window.addEventListener("share-streak", handleShareStreak);
    return () => window.removeEventListener("share-streak", handleShareStreak);
  }, []);

  if (!mounted) return null;

  const markets = liveMarkets;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pt-4 pb-8">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <StatsBar onShare={() => setShowStreakCard(true)} />
        </motion.div>

        {/* Challenge Banner */}
        <ChallengeBanner />

        {/* Live Markets */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className={`w-2 h-2 rounded-full ${loading ? "bg-accent/40 animate-pulse" : "bg-accent"}`} />
            <h2 className="text-lg font-bold text-text">Live Markets</h2>
            {loading && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/5 border border-accent/10">
                <Loader2 className="w-3 h-3 text-accent animate-spin" />
                <span className="text-[10px] font-medium text-accent">Syncing</span>
              </div>
            )}
          </div>

          {loading && markets.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <MarketSkeleton delay={0} />
              <MarketSkeleton delay={0.08} />
              <MarketSkeleton delay={0.16} />
              <MarketSkeleton delay={0.24} />
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
                    <MarketCard {...market} onTrade={() => setSelectedMarket(market)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Empty state */}
          {!loading && markets.length === 0 && !error && (
            <div className="glass rounded-2xl p-8 sm:p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent/5 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-7 h-7 text-accent/40" />
              </div>
              <p className="text-sm font-semibold text-text mb-1.5">No markets open right now</p>
              <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
                BTC and ETH event contracts open on a rolling schedule.
                New trading windows launch every 15 minutes — check back shortly.
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="mt-3 p-4 rounded-xl bg-down/10 border border-down/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-down animate-pulse" />
                  <span className="text-sm text-down font-medium">{error}</span>
                </div>
                <button
                  onClick={() => refetch?.()}
                  className="px-3 py-1.5 rounded-lg bg-down/20 hover:bg-down/30 text-down text-xs font-semibold transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {selectedMarket && (
          <TradePanel market={selectedMarket} onClose={() => setSelectedMarket(null)} onChallenge={() => setShowChallenge(true)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChallenge && selectedMarket && (
          <ChallengeModal market={selectedMarket} onClose={() => setShowChallenge(false)} />
        )}
      </AnimatePresence>

      <SettlementView />

      <AnimatePresence>
        {showStreakCard && <StreakCard onClose={() => setShowStreakCard(false)} />}
      </AnimatePresence>

      {/* Onboarding */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass-strong rounded-3xl p-8 max-w-sm w-full mx-4 text-center">
              <div className="w-16 h-16 rounded-2xl overflow-hidden relative mx-auto mb-5 shadow-lg shadow-accent/20">
                <Image src="/logo.png" alt="StreakTrader" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-bold text-text mb-2">Welcome to StreakTrader</h3>
              <p className="text-sm text-text-dim mb-6 leading-relaxed">
                Predict whether BTC or ETH goes up or down. Win consecutive
                trades to build your streak multiplier and maximize earnings.
              </p>
              <div className="space-y-3 text-left mb-6">
                {[
                  { num: "1", text: "Pick a live market and choose UP or DOWN" },
                  { num: "2", text: "Win trades to grow your streak multiplier" },
                  { num: "3", text: "Higher streaks = higher payouts on every trade" },
                ].map((item) => (
                  <div key={item.num} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <span className="text-accent text-sm font-bold">{item.num}</span>
                    </div>
                    <span className="text-sm text-text">{item.text}</span>
                  </div>
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowOnboarding(false)}
                className="w-full btn-primary py-3 rounded-xl text-sm font-bold text-white">
                Get Started
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Copilot */}
      {selectedMarket && (
        <CopilotSidebar
          market={selectedMarket}
          onSuggestion={(s) => {
            // Auto-select the suggested side in trade panel
            setSelectedMarket({ ...selectedMarket, _suggestedSide: s });
          }}
        />
      )}

      {/* Floating copilot button when no market selected */}
      {!selectedMarket && (
        <CopilotSidebar
          market={{
            symbol: "Select a market",
            underlying: "BTC",
            window: "15m",
            upProbability: 50,
          }}
        />
      )}
    </div>
  );
}
