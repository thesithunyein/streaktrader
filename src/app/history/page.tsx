"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStreakStore } from "@/lib/store";
import { useTrade } from "@/components/TradeProvider";
import {
  TrendingUp, CheckCircle, XCircle, Clock, BarChart3,
  Flame, Zap, ArrowLeft,
} from "lucide-react";
import Link from "next/link";

function Animate({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return <div className={`opacity-0 animate-fade-up ${className}`} style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}

export default function HistoryPage() {
  const { trades, bestStreak, totalPnL, totalTrades, wins, predictionScore, getWinRate } = useStreakStore();
  const { address, onChainStreak, onChainBestStreak, onChainTotalTrades, onChainWins, onChainPredictionScore } = useTrade();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const winRate = getWinRate();

  return (
    <div className="min-h-screen flex flex-col bg-[#080A19]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-5 sm:px-8 pt-6 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/app" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-accent transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Trading
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Trade History</h1>
            <p className="text-sm text-white/40 mt-1">Your complete trading performance</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Flame, label: "Best Streak", value: `${bestStreak}x`, color: "text-[#f59e0b]" },
            { icon: BarChart3, label: "Total Trades", value: totalTrades.toString(), color: "text-white" },
            { icon: CheckCircle, label: "Win Rate", value: `${winRate}%`, color: "text-[#16a34a]" },
            { icon: TrendingUp, label: "Total P&L", value: `${totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(1)}`, color: totalPnL >= 0 ? "text-[#16a34a]" : "text-[#dc2626]" },
          ].map((stat, i) => (
            <Animate key={stat.label} delay={i * 50}>
              <div className="glass rounded-[16px] p-4 sm:p-5 text-center">
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                <div className={`text-xl sm:text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-white/30 uppercase tracking-wider">{stat.label}</div>
              </div>
            </Animate>
          ))}
        </div>

        {/* Streak Visualization */}
        <div className="glass rounded-[20px] p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-bold text-white mb-4">Streak Progress</h2>
          {trades.length > 0 ? (
            <div className="flex items-end gap-0.5 sm:gap-1 h-32 sm:h-40">
              {trades.slice(0, 30).reverse().map((trade, i) => {
                const height = trade.result === "WIN" ? Math.min(100, 20 + i * 8) : 10;
                return (
                  <div key={trade.id} className="flex-1 group relative">
                    <div
                      className={`w-full rounded-sm transition-all duration-500 ${trade.result === "WIN" ? "bg-gradient-to-t from-[#2563eb] to-[#60a5fa]" : "bg-[#dc2626]/30"}`}
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                      <div className="bg-white/10 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap border border-white/[0.06]">
                        {trade.side} · {trade.result} · {trade.stake} tUSDC
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-white/30 text-sm">
              Place your first trade to start tracking.
            </div>
          )}
        </div>

        {/* Trade List */}
        <div className="glass rounded-[20px] p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-white mb-4">Recent Trades</h2>
          {trades.length > 0 ? (
            <div className="space-y-2">
              {trades.slice(0, 20).map((trade, i) => (
                <div
                  key={trade.id}
                  className="opacity-0 animate-fade-left flex items-center gap-3 sm:gap-4 p-3 rounded-[12px] bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] transition-colors"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center ${
                    trade.result === "WIN" ? "bg-[#16a34a]/10" : trade.result === "LOSE" ? "bg-[#dc2626]/10" : "bg-white/5"
                  }`}>
                    {trade.result === "WIN" ? <CheckCircle className="w-4 h-4 text-[#16a34a]" /> :
                     trade.result === "LOSE" ? <XCircle className="w-4 h-4 text-[#dc2626]" /> :
                     <Clock className="w-4 h-4 text-white/30" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded ${
                        trade.side === "UP" ? "bg-[#16a34a]/10 text-[#16a34a]" : "bg-[#dc2626]/10 text-[#dc2626]"
                      }`}>{trade.side}</span>
                      <span className="text-xs sm:text-sm text-white/40 truncate">
                        {trade.symbol.split("#")[0].split("-").slice(0, 2).join("-")}
                      </span>
                    </div>
                    <div className="text-[10px] text-white/20 mt-0.5">
                      {new Date(trade.timestamp).toLocaleString()}
                      {trade.shieldUsed && <span className="ml-2 text-accent">· Shield</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-accent shrink-0">
                    <Zap className="w-3 h-3" />
                    <span className="text-xs font-bold font-mono">{trade.multiplier}x</span>
                  </div>
                  <div className={`text-sm font-mono font-bold shrink-0 ${
                    trade.result === "WIN" ? "text-[#16a34a]" : trade.result === "LOSE" ? "text-[#dc2626]" : "text-white/30"
                  }`}>
                    {trade.result === "WIN" ? `+${trade.payout.toFixed(1)}` :
                     trade.result === "LOSE" ? `-${trade.stake.toFixed(1)}` : "..."}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/30">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No trades yet</p>
              <p className="text-xs text-white/15 mt-1">Your trade history will appear here</p>
              <Link href="/app" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-[12px] btn-primary text-white text-sm font-bold">
                Start Trading
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
