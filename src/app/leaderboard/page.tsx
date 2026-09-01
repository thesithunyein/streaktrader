"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStreakStore } from "@/lib/store";
import { Trophy, Flame, TrendingUp, Medal, Crown, Target } from "lucide-react";
import Image from "next/image";

// Mock leaderboard data (in production, this comes from a backend)
const MOCK_LEADERBOARD = [
  { name: "crypto_whale", streak: 12, bestStreak: 18, pnl: 342.5, winRate: 78, avatar: "🐋" },
  { name: "btc_trader_99", streak: 8, bestStreak: 14, pnl: 198.2, winRate: 72, avatar: "₿" },
  { name: "prediction_king", streak: 6, bestStreak: 11, pnl: 156.8, winRate: 65, avatar: "👑" },
  { name: "wave_rider", streak: 5, bestStreak: 9, pnl: 124.3, winRate: 68, avatar: "🌊" },
  { name: "diamond_hands", streak: 4, bestStreak: 8, pnl: 98.7, winRate: 62, avatar: "💎" },
  { name: "streak_master", streak: 3, bestStreak: 7, pnl: 87.4, winRate: 60, avatar: "🔥" },
  { name: "up_only", streak: 2, bestStreak: 6, pnl: 54.2, winRate: 58, avatar: "📈" },
  { name: "moon_chaser", streak: 1, bestStreak: 5, pnl: 32.1, winRate: 55, avatar: "🌙" },
  { name: "new_trader", streak: 0, bestStreak: 3, pnl: 12.5, winRate: 50, avatar: "🎯" },
  { name: "just_started", streak: 0, bestStreak: 1, pnl: -5.3, winRate: 45, avatar: "🚀" },
];

export default function LeaderboardPage() {
  const { streak, bestStreak, totalPnL, getWinRate, totalTrades } =
    useStreakStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const winRate = getWinRate();

  // Insert user into leaderboard
  const userEntry = {
    name: "You",
    streak,
    bestStreak,
    pnl: totalPnL,
    winRate,
    avatar: "⚡",
    isUser: true,
  };

  const combined = [...MOCK_LEADERBOARD, userEntry]
    .sort((a, b) => b.pnl - a.pnl)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  const userRank = combined.find((e) => (e as any).isUser)?.rank || 0;

  const podium = combined.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Trophy className="w-10 h-10 text-accent mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-text mb-2">Leaderboard</h1>
          <p className="text-text-dim">
            Top streak traders on StreakTrader
          </p>
        </motion.div>

        {/* Your Rank */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 mb-8 border border-accent/20 glow-accent"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center text-xl">
              ⚡
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-text">Your Rank</span>
                <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-bold">
                  #{userRank}
                </span>
              </div>
              <div className="text-sm text-text-dim">
                {streak}x streak · {totalTrades} trades · {winRate}% win rate
              </div>
            </div>
            <div
              className={`text-xl font-bold font-mono ${
                totalPnL >= 0 ? "text-up" : "text-down"
              }`}
            >
              {totalPnL >= 0 ? "+" : ""}
              {totalPnL.toFixed(1)}
            </div>
          </div>
        </motion.div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-4 mb-8">
          {podium.map((entry, i) => {
            const heights = ["h-32", "h-40", "h-28"];
            const colors = ["text-gray-400", "text-accent", "text-amber-500"];
            const icons = [Medal, Crown, Medal];
            const Icon = icons[i];
            return (
              <motion.div
                key={entry.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="text-2xl mb-2">{entry.avatar}</div>
                <div className={`text-sm font-bold ${colors[i]} mb-1`}>
                  {entry.name}
                </div>
                <div className="text-xs text-text-dim mb-2">
                  {entry.streak}x streak
                </div>
                <div
                  className={`glass rounded-t-xl w-24 ${heights[i]} flex flex-col items-center justify-center border-t border-x border-border`}
                >
                  <Icon className={`w-5 h-5 ${colors[i]} mb-1`} />
                  <span className="text-lg font-bold font-mono text-up">
                    +{entry.pnl.toFixed(0)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full Rankings */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-text-dim uppercase tracking-wider">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Trader</div>
              <div className="col-span-2 text-center">Streak</div>
              <div className="col-span-2 text-center">Best</div>
              <div className="col-span-1 text-center">Win%</div>
              <div className="col-span-2 text-right">P&L</div>
            </div>
          </div>

          {combined.map((entry, i) => {
            const isUser = (entry as any).isUser;
            return (
              <motion.div
                key={entry.name + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className={`px-5 py-3 border-b border-border last:border-0 flex items-center ${
                  isUser ? "bg-accent/5" : "hover:bg-white/[0.02]"
                } transition-colors`}
              >
                <div className="col-span-1 w-8">
                  <span
                    className={`text-sm font-bold ${
                      entry.rank === 1
                        ? "text-accent"
                        : entry.rank === 2
                        ? "text-gray-400"
                        : entry.rank === 3
                        ? "text-amber-500"
                        : "text-text-dim"
                    }`}
                  >
                    {entry.rank}
                  </span>
                </div>
                <div className="col-span-4 flex items-center gap-2">
                  <span className="text-lg">{entry.avatar}</span>
                  <span
                    className={`text-sm font-semibold ${
                      isUser ? "text-accent" : "text-text"
                    }`}
                  >
                    {entry.name}
                  </span>
                  {isUser && (
                    <span className="px-1.5 py-0.5 rounded bg-accent/15 text-accent text-[10px] font-bold">
                      YOU
                    </span>
                  )}
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-mono font-semibold text-text">
                    {entry.streak}x
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-mono text-accent">
                    {entry.bestStreak}x
                  </span>
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-sm font-mono text-text-dim">
                    {entry.winRate}%
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span
                    className={`text-sm font-mono font-semibold ${
                      entry.pnl >= 0 ? "text-up" : "text-down"
                    }`}
                  >
                    {entry.pnl >= 0 ? "+" : ""}
                    {entry.pnl.toFixed(1)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
