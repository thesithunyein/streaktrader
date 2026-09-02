"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStreakStore } from "@/lib/store";
import { useTrade } from "@/components/TradeProvider";
import {
  Trophy, TrendingUp, CheckCircle, XCircle, Clock, BarChart3,
  Flame, Award, Shield, ExternalLink, Zap, Link2, ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const { trades, bestStreak, totalPnL, totalTrades, wins, predictionScore, shields, getWinRate } = useStreakStore();
  const { address, onChainStreak, onChainBestStreak, onChainTotalTrades, onChainWins, onChainPredictionScore } = useTrade();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const winRate = getWinRate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pt-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/app" className="flex items-center gap-1.5 text-sm text-text-dim hover:text-accent transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Trading
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-text">Trade History</h1>
            <p className="text-sm text-text-dim mt-1">Your complete trading performance</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Flame, label: "Best Streak", value: `${bestStreak}x`, color: "text-accent" },
            { icon: BarChart3, label: "Total Trades", value: totalTrades.toString(), color: "text-text" },
            { icon: CheckCircle, label: "Win Rate", value: `${winRate}%`, color: "text-up" },
            { icon: TrendingUp, label: "Total P&L", value: `${totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(1)}`, color: totalPnL >= 0 ? "text-up" : "text-down" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 sm:p-5 text-center border border-border shadow-sm"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
              <div className={`text-xl sm:text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-text-dim uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* On-chain data indicator */}
        {address && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-2xl bg-accent/5 border border-accent/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Link2 className="w-4 h-4 text-accent" />
              </div>
              <div>
                <div className="text-sm font-bold text-text">On-Chain Records</div>
                <div className="text-xs text-text-dim">Verified on Shannon Testnet</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Streak", value: onChainStreak },
                { label: "Best", value: onChainBestStreak },
                { label: "Trades", value: onChainTotalTrades },
                { label: "Wins", value: onChainWins },
                { label: "Score", value: onChainPredictionScore },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-2.5 text-center border border-border/50">
                  <div className="text-lg font-bold font-mono text-accent">{item.value}</div>
                  <div className="text-[10px] text-text-dim">{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Streak Visualization */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 border border-border shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-text mb-4">Streak Progress</h2>
          {trades.length > 0 ? (
            <div className="flex items-end gap-0.5 sm:gap-1 h-32 sm:h-40">
              {trades.slice(0, 30).reverse().map((trade, i) => {
                const height = trade.result === "WIN" ? Math.min(100, 20 + i * 8) : 10;
                return (
                  <div key={trade.id} className="flex-1 group relative">
                    <div
                      className={`w-full rounded-sm transition-all duration-500 ${trade.result === "WIN" ? "bg-gradient-to-t from-accent to-blue-400" : "bg-down/30"}`}
                      style={{ height: `${height}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                      <div className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap">
                        {trade.side} · {trade.result} · {trade.stake} tUSDC
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-text-dim text-sm">
              Place your first trade to start tracking your progress.
            </div>
          )}
        </div>

        {/* Trade List */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-text mb-4">Recent Trades</h2>
          {trades.length > 0 ? (
            <div className="space-y-2">
              {trades.slice(0, 20).map((trade, i) => (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl bg-slate-50 border border-border/50 hover:bg-accent/[0.02] transition-colors"
                >
                  {/* Result icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    trade.result === "WIN" ? "bg-up/10" : trade.result === "LOSE" ? "bg-down/10" : "bg-slate-100"
                  }`}>
                    {trade.result === "WIN" ? (
                      <CheckCircle className="w-4 h-4 text-up" />
                    ) : trade.result === "LOSE" ? (
                      <XCircle className="w-4 h-4 text-down" />
                    ) : (
                      <Clock className="w-4 h-4 text-text-dim" />
                    )}
                  </div>

                  {/* Trade details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded ${
                        trade.side === "UP" ? "bg-up/10 text-up" : "bg-down/10 text-down"
                      }`}>
                        {trade.side}
                      </span>
                      <span className="text-xs sm:text-sm text-text-dim truncate">
                        {trade.symbol.split("#")[0].split("-").slice(0, 2).join("-")}
                      </span>
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">
                      {new Date(trade.timestamp).toLocaleString()}
                      {trade.shieldUsed && (
                        <span className="ml-2 text-accent">· Shield used</span>
                      )}
                    </div>
                  </div>

                  {/* Multiplier */}
                  <div className="flex items-center gap-1 text-accent shrink-0">
                    <Zap className="w-3 h-3" />
                    <span className="text-xs font-bold font-mono">{trade.multiplier}x</span>
                  </div>

                  {/* P&L */}
                  <div className={`text-sm font-mono font-bold shrink-0 ${
                    trade.result === "WIN" ? "text-up" : trade.result === "LOSE" ? "text-down" : "text-text-dim"
                  }`}>
                    {trade.result === "WIN" ? `+${trade.payout.toFixed(1)}` :
                     trade.result === "LOSE" ? `-${trade.stake.toFixed(1)}` : "..."}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-dim">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No trades yet</p>
              <p className="text-xs text-text-muted mt-1">Your trade history will appear here</p>
              <Link href="/app" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-colors">
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
