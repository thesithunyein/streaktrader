"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStreakStore } from "@/lib/store";
import {
  Trophy, TrendingUp, CheckCircle, XCircle, Clock, BarChart3,
} from "lucide-react";

export default function HistoryPage() {
  const { trades, bestStreak, totalPnL, totalTrades, getWinRate } = useStreakStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const winRate = getWinRate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Your Performance</h1>
          <p className="text-sm sm:text-base text-text-dim">Track your trading history and streak progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 sm:mb-8">
          <div className="glass rounded-2xl p-4 sm:p-5 text-center">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-fire-1 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold font-mono text-text">{bestStreak}</div>
            <div className="text-[10px] sm:text-xs text-text-dim uppercase tracking-wider">Best Streak</div>
          </div>
          <div className="glass rounded-2xl p-4 sm:p-5 text-center">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-accent mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold font-mono text-text">{totalTrades}</div>
            <div className="text-[10px] sm:text-xs text-text-dim uppercase tracking-wider">Total Trades</div>
          </div>
          <div className="glass rounded-2xl p-4 sm:p-5 text-center">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-up mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold font-mono text-up">{winRate}%</div>
            <div className="text-[10px] sm:text-xs text-text-dim uppercase tracking-wider">Win Rate</div>
          </div>
          <div className="glass rounded-2xl p-4 sm:p-5 text-center">
            <TrendingUp className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 ${totalPnL >= 0 ? "text-up" : "text-down"}`} />
            <div className={`text-xl sm:text-2xl font-bold font-mono ${totalPnL >= 0 ? "text-up" : "text-down"}`}>
              {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(1)}
            </div>
            <div className="text-[10px] sm:text-xs text-text-dim uppercase tracking-wider">Total P&L</div>
          </div>
        </div>

        {/* Streak Visualization */}
        <div className="glass rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-text mb-4">Streak Progress</h2>
          {trades.length > 0 ? (
            <div className="flex items-end gap-0.5 sm:gap-1 h-24 sm:h-32">
              {trades.slice(0, 30).reverse().map((trade, i) => {
                const height = trade.result === "WIN" ? Math.min(100, 20 + i * 8) : 10;
                return (
                  <div key={trade.id} className="flex-1">
                    <div
                      className={`w-full rounded-sm transition-all duration-500 ${trade.result === "WIN" ? "bg-gradient-to-t from-fire-1 to-fire-2" : "bg-down/30"}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-text-dim text-sm">
              Place your first trade to start tracking your progress.
            </div>
          )}
        </div>

        {/* Trade List */}
        <div className="glass rounded-2xl p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-text mb-4">Recent Trades</h2>
          {trades.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {trades.slice(0, 20).map((trade) => (
                <div key={trade.id} className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl bg-bg border border-border">
                  {trade.result === "WIN" ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-up shrink-0" />
                  ) : trade.result === "LOSE" ? (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-down shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-text-dim shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded ${trade.side === "UP" ? "bg-up/15 text-up" : "bg-down/15 text-down"}`}>
                        {trade.side}
                      </span>
                      <span className="text-xs sm:text-sm text-text-dim truncate">{trade.symbol.split("#")[0]}</span>
                    </div>
                  </div>
                  <div className="text-[10px] sm:text-xs font-mono text-fire-1 shrink-0">{trade.multiplier}x</div>
                  <div className={`text-xs sm:text-sm font-mono font-semibold shrink-0 ${trade.result === "WIN" ? "text-up" : "text-down"}`}>
                    {trade.result === "WIN" ? `+${trade.payout.toFixed(1)}` : trade.result === "LOSE" ? `-${trade.stake.toFixed(1)}` : "..."}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-12 text-text-dim">
              <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No trades yet</p>
              <p className="text-xs text-text-muted mt-1">Your trade history will appear here</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
