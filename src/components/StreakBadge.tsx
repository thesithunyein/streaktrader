"use client";

import { useStreakStore } from "@/lib/store";
import { Zap, Target, TrendingUp, Activity, Share2 } from "lucide-react";

interface StatsBarProps {
  onShare?: () => void;
}

export default function StatsBar({ onShare }: StatsBarProps) {
  const { streak, getMultiplier, getWinRate, totalPnL } = useStreakStore();

  const multiplier = getMultiplier();
  const winRate = getWinRate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 card-hover">
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center transition-all duration-500 ${
            streak >= 5
              ? "from-accent to-accent-light w-16 h-16 glow-streak"
              : streak >= 3
              ? "from-accent to-accent-light w-14 h-14"
              : streak >= 1
              ? "from-accent to-accent-light"
              : "from-slate-100 to-slate-200"
          }`}
        >
          <Activity
            className={`text-white ${streak >= 5 ? "w-8 h-8" : streak >= 3 ? "w-7 h-7" : "w-6 h-6"} ${streak > 0 ? "animate-fire" : ""}`}
          />
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold font-mono text-text">{streak}</div>
          <div className="text-xs text-text-dim uppercase tracking-wider">Streak</div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 card-hover">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-accent" />
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold font-mono text-gradient">{multiplier}x</div>
          <div className="text-xs text-text-dim uppercase tracking-wider">Multiplier</div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 card-hover">
        <div className="w-10 h-10 rounded-full bg-up/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-up" />
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold font-mono text-up">{winRate}%</div>
          <div className="text-xs text-text-dim uppercase tracking-wider">Win Rate</div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 card-hover relative">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${totalPnL >= 0 ? "bg-up/10" : "bg-down/10"}`}>
          <TrendingUp className={`w-5 h-5 ${totalPnL >= 0 ? "text-up" : "text-down"}`} />
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold font-mono ${totalPnL >= 0 ? "text-up" : "text-down"}`}>
            {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(1)}
          </div>
          <div className="text-xs text-text-dim uppercase tracking-wider">P&L</div>
        </div>
        {streak > 0 && onShare && (
          <button onClick={onShare} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors" title="Share streak">
            <Share2 className="w-3.5 h-3.5 text-accent" />
          </button>
        )}
      </div>
    </div>
  );
}
