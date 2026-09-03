"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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

function Animate({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "scale";
}) {
  const dirMap: Record<string, string> = {
    up: "animate-fade-up",
    down: "animate-fade-down",
    scale: "animate-fade-scale",
  };
  return (
    <div
      className={`opacity-0 ${dirMap[direction]} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function MarketSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="glass rounded-[20px] p-5 overflow-hidden relative opacity-0 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-slate-100/80 to-transparent z-[1]" />
      <div className="relative z-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-slate-100 animate-skeleton-pulse" />
            <div>
              <div className="h-3.5 w-16 bg-slate-100 rounded-md mb-1.5 animate-skeleton-pulse" />
              <div className="h-2.5 w-12 bg-slate-100 rounded-md animate-skeleton-pulse" />
            </div>
          </div>
          <div className="h-6 w-20 bg-slate-100 rounded-full animate-skeleton-pulse" />
        </div>
        <div className="mb-4">
          <div className="h-2.5 rounded-full bg-slate-100 animate-skeleton-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-11 rounded-[12px] bg-slate-100 animate-skeleton-pulse" />
          <div className="h-11 rounded-[12px] bg-slate-100 animate-skeleton-pulse" />
        </div>
        <div className="mt-3 h-1 rounded-full bg-slate-100 animate-skeleton-pulse" />
      </div>
    </div>
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
    const handleShareStreak = () => setShowStreakCard(true);
    window.addEventListener("share-streak", handleShareStreak);
    return () => window.removeEventListener("share-streak", handleShareStreak);
  }, []);

  if (!mounted) return null;

  const markets = liveMarkets;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-5 sm:px-8 pt-4 pb-8">
        {/* Stats */}
        <Animate delay={0} direction="up" className="mb-6">
          <StatsBar onShare={() => setShowStreakCard(true)} />
        </Animate>

        <ChallengeBanner />

        {/* Live Markets */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className={`w-2 h-2 rounded-full ${loading ? "bg-accent/40 animate-pulse" : "bg-accent"}`} />
            <h2 className="text-lg font-bold text-slate-900">Live Markets</h2>
            {loading && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/15">
                <Loader2 className="w-3 h-3 text-accent animate-spin" />
                <span className="text-[10px] font-medium text-accent">Syncing</span>
              </div>
            )}
          </div>

          {loading && markets.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <MarketSkeleton delay={0} />
              <MarketSkeleton delay={80} />
              <MarketSkeleton delay={160} />
              <MarketSkeleton delay={240} />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Group markets by underlying */}
              {["BTC", "ETH"].map((asset) => {
                const assetMarkets = markets.filter((m) => m.underlying === asset);
                if (assetMarkets.length === 0) return null;
                const isBTC = asset === "BTC";
                return (
                  <div key={asset}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden" style={{ background: isBTC ? "rgba(247,147,26,0.1)" : "rgba(98,126,234,0.1)" }}>
                        {isBTC ? (
                          <img src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png" alt="BTC" className="w-5 h-5" />
                        ) : (
                          <img src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" alt="ETH" className="w-5 h-5" />
                        )}
                      </div>
                      <h3 className="text-sm font-bold" style={{ color: isBTC ? "#F7931A" : "#627EEA" }}>
                        {asset} Markets
                      </h3>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {assetMarkets.length} contract{assetMarkets.length > 1 ? "s" : ""} open
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {assetMarkets.map((market, i) => (
                        <Animate key={market.symbol} delay={i * 80} direction="up">
                          <MarketCard {...market} onTrade={() => setSelectedMarket(market)} />
                        </Animate>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && markets.length === 0 && !error && (
            <div className="glass rounded-[20px] p-8 sm:p-12 text-center">
              <div className="w-14 h-14 rounded-[14px] bg-accent/5 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-7 h-7 text-accent/40" />
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-1.5">No markets open right now</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                BTC and ETH event contracts open on a rolling schedule.
                New trading windows launch every 15 minutes.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-3 p-4 rounded-[12px] bg-down/10 border border-down/20">
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

      {selectedMarket && (
        <TradePanel market={selectedMarket} onClose={() => setSelectedMarket(null)} onChallenge={() => setShowChallenge(true)} />
      )}

      {showChallenge && selectedMarket && (
        <ChallengeModal market={selectedMarket} onClose={() => setShowChallenge(false)} />
      )}

      <SettlementView />

      {showStreakCard && <StreakCard onClose={() => setShowStreakCard(false)} />}

      {/* Onboarding */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center animate-fade-scale">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowOnboarding(false)} />
          <div className="relative glass-strong rounded-[24px] p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 rounded-[16px] overflow-hidden relative mx-auto mb-5 shadow-lg shadow-accent/20">
              <Image src="/logo.png" alt="StreakTrader" fill className="object-cover" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{color: "#0f172a"}}>Welcome to StreakTrader</h3>
            <p className="text-sm mb-6 leading-relaxed" style={{color: "#64748b"}}>
              Predict whether BTC or ETH goes up or down. Win consecutive
              trades to build your streak multiplier.
            </p>
            <div className="space-y-3 text-left mb-6">
              {[
                { num: "1", text: "Pick a live market and choose UP or DOWN" },
                { num: "2", text: "Win trades to grow your streak multiplier" },
                { num: "3", text: "Higher streaks = higher payouts on every trade" },
              ].map((item) => (
                <div key={item.num} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[8px] bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-accent text-sm font-bold">{item.num}</span>
                  </div>
                  <span className="text-sm" style={{color: "#0f172a"}}>{item.text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowOnboarding(false)}
              className="w-full btn-primary py-3 rounded-[12px] text-sm font-bold text-white"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {selectedMarket && (
        <CopilotSidebar
          market={selectedMarket}
          onSuggestion={(s) => {
            setSelectedMarket({ ...selectedMarket, _suggestedSide: s });
          }}
        />
      )}

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
