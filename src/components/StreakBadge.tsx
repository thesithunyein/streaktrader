"use client";

import { useStreakStore } from "@/lib/store";
import { Flame, TrendingUp, Target, Zap } from "lucide-react";

export default function StatsBar() {
  const { streak, getMultiplier, getWinRate, totalPnL, totalTrades } =
    useStreakStore();

  const multiplier = getMultiplier();
  const winRate = getWinRate();

  const getFireSize = () => {
    if (streak >= 5) return "w-16 h-16";
    if (streak >= 3) return "w-14 h-14";
    if (streak >= 1) return "w-12 h-12";
    return "w-10 h-10";
  };

  const getFireColor = () => {
    if (streak >= 5) return "from-fire-3 to-fire-1";
    if (streak >= 3) return "from-fire-2 to-fire-1";
    if (streak >= 1) return "from-fire-1 to-fire-2";
    return "from-text-muted to-text-dim";
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Streak */}
      <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 card-hover">
        <div
          className={`${getFireSize()} rounded-full bg-gradient-to-br ${getFireColor()} flex items-center justify-center transition-all duration-500 ${
            streak > 0 ? "animate-fire-pulse" : ""
          }`}
        >
          <Flame
            className={`text-white ${
              streak >= 5 ? "w-8 h-8" : streak >= 3 ? "w-7 h-7" : "w-6 h-6"
            } ${streak > 0 ? "animate-fire" : ""}`}
          />
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold font-mono text-text">
            {streak}
          </div>
          <div className="text-xs text-text-dim uppercase tracking-wider">
            Streak
          </div>
        </div>
      </div>

      {/* Multiplier */}
      <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 card-hover">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-accent" />
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold font-mono text-gradient">
            {multiplier}x
          </div>
          <div className="text-xs text-text-dim uppercase tracking-wider">
            Multiplier
          </div>
        </div>
      </div>

      {/* Win Rate */}
      <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 card-hover">
        <div className="w-10 h-10 rounded-full bg-up/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-up" />
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold font-mono text-up">
            {winRate}%
          </div>
          <div className="text-xs text-text-dim uppercase tracking-wider">
            Win Rate
          </div>
        </div>
      </div>

      {/* P&L */}
      <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 card-hover">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            totalPnL >= 0 ? "bg-up/10" : "bg-down/10"
          }`}
        >
          <TrendingUp
            className={`w-5 h-5 ${totalPnL >= 0 ? "text-up" : "text-down"}`}
          />
        </div>
        <div className="text-center">
          <div
            className={`text-2xl font-bold font-mono ${
              totalPnL >= 0 ? "text-up" : "text-down"
            }`}
          >
            {totalPnL >= 0 ? "+" : ""}
            {totalPnL.toFixed(1)}
          </div>
          <div className="text-xs text-text-dim uppercase tracking-wider">
            P&L
          </div>
        </div>
      </div>
    </div>
  );
}
