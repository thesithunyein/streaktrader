"use client";

import { useState, useEffect } from "react";
import { useStreakStore } from "@/lib/store";
import { useTrade } from "@/components/TradeProvider";
import { Zap, Flame, TrendingUp, Share2, Shield, Award, Activity } from "lucide-react";

interface StatsBarProps {
  onShare: () => void;
}

export default function StatsBar({ onShare }: StatsBarProps) {
  const {
    streak, bestStreak, totalPnL, totalTrades, wins, predictionScore,
    shields, activeShield, activateShield, deactivateShield,
  } = useStreakStore();
  const { address } = useTrade();
  const getWinRate = useStreakStore((s) => s.getWinRate);

  const winRate = getWinRate();
  const score = predictionScore;

  const scoreLabel =
    score >= 80 ? "Elite" : score >= 60 ? "Strong" : score >= 40 ? "Average" : score > 0 ? "Beginner" : "No trades";

  return (
    <div className="opacity-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
      <div className="glass rounded-[20px] p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Streak */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Flame className={`w-4 h-4 ${streak > 0 ? "text-[#f59e0b]" : "text-white/30"}`} />
              <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Streak</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {streak}<span className="text-sm text-white/40">x</span>
            </div>
          </div>

          {/* Win Rate */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4 text-white/30" />
              <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Win Rate</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {winRate}<span className="text-sm text-white/40">%</span>
            </div>
          </div>

          {/* PnL */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Zap className="w-4 h-4 text-white/30" />
              <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">PnL</span>
            </div>
            <div className={`text-2xl font-bold font-mono ${totalPnL >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
              {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(1)}
            </div>
          </div>

          {/* Score */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Award className="w-4 h-4 text-white/30" />
              <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Score</span>
            </div>
            <div className="text-2xl font-bold font-mono text-gradient">
              {score}
            </div>
            <div className="text-[9px] text-white/30">{scoreLabel}</div>
          </div>
        </div>

        {/* Shield + Share row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => activeShield ? deactivateShield() : activateShield()}
              disabled={shields <= 0 && !activeShield}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all ${
                activeShield
                  ? "bg-[#2563eb]/15 text-[#60a5fa] border border-[#2563eb]/20"
                  : shields > 0
                    ? "bg-white/5 text-white/60 hover:bg-white/10 border border-white/[0.06]"
                    : "bg-white/5 text-white/20 border border-white/[0.04] cursor-not-allowed"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              {activeShield ? "Shield Active" : `${shields} Shield${shields !== 1 ? "s" : ""}`}
            </button>
          </div>

          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-white/5 text-white/60 hover:bg-white/10 text-xs font-medium transition-all border border-white/[0.06]"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Streak
          </button>
        </div>
      </div>
    </div>
  );
}
