"use client";

import { useStreakStore } from "@/lib/store";
import { Zap, Target, TrendingUp, Activity, Share2, Shield, Award } from "lucide-react";

interface StatsBarProps {
  onShare?: () => void;
}

export default function StatsBar({ onShare }: StatsBarProps) {
  const { streak, getMultiplier, getWinRate, totalPnL, predictionScore, shields, activeShield, bestStreak, totalTrades } = useStreakStore();

  const multiplier = getMultiplier();
  const winRate = getWinRate();

  // Score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-accent";
    if (score >= 60) return "text-up";
    if (score >= 40) return "text-yellow-500";
    return "text-text-dim";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Elite";
    if (score >= 60) return "Strong";
    if (score >= 40) return "Average";
    if (score > 0) return "Beginner";
    return "New";
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {/* Streak */}
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

      {/* Multiplier */}
      <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 card-hover">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-accent" />
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold font-mono text-gradient">{multiplier}x</div>
          <div className="text-xs text-text-dim uppercase tracking-wider">Multiplier</div>
        </div>
      </div>

      {/* Prediction Score */}
      <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 card-hover relative">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${predictionScore >= 60 ? "bg-accent/10" : "bg-slate-100"}`}>
          <Award className={`w-5 h-5 ${getScoreColor(predictionScore)}`} />
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold font-mono ${getScoreColor(predictionScore)}`}>{predictionScore}</div>
          <div className="text-xs text-text-dim uppercase tracking-wider">Score</div>
        </div>
        {predictionScore > 0 && (
          <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-accent/10 border border-accent/20">
            <span className="text-[8px] font-bold text-accent">{getScoreLabel(predictionScore)}</span>
          </div>
        )}
      </div>

      {/* Win Rate */}
      <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 card-hover">
        <div className="w-10 h-10 rounded-full bg-up/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-up" />
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold font-mono text-up">{winRate}%</div>
          <div className="text-xs text-text-dim uppercase tracking-wider">Win Rate</div>
        </div>
      </div>

      {/* P&L + Shield */}
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

        {/* Shield indicator */}
        {shields > 0 && (
          <div className={`absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full ${activeShield ? "bg-accent/20 border border-accent/30" : "bg-slate-100 border border-border"}`}>
            <Shield className={`w-3 h-3 ${activeShield ? "text-accent" : "text-text-dim"}`} />
            <span className={`text-[9px] font-bold ${activeShield ? "text-accent" : "text-text-dim"}`}>{shields}</span>
          </div>
        )}

        {/* Share button */}
        {streak > 0 && onShare && (
          <button onClick={onShare} className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors" title="Share streak">
            <Share2 className="w-3.5 h-3.5 text-accent" />
          </button>
        )}
      </div>
    </div>
  );
}
