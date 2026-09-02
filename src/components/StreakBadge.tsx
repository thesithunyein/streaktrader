"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useStreakStore } from "@/lib/store";
import { useTrade } from "@/components/TradeProvider";
import { Zap, Flame, TrendingUp, Share2, Shield, Award, Activity, Link2, Database } from "lucide-react";

interface StatsBarProps {
  onShare: () => void;
}

export default function StatsBar({ onShare }: StatsBarProps) {
  const {
    streak, bestStreak, totalPnL, totalTrades, wins, predictionScore,
    shields, activeShield, activateShield, deactivateShield,
  } = useStreakStore();
  const {
    address, onChainStreak, onChainBestStreak, onChainTotalTrades,
    onChainWins, onChainPredictionScore, onChainShields, onChainLoading,
    refreshOnChain,
  } = useTrade();
  const getWinRate = useStreakStore((s) => s.getWinRate);

  const [showOnChain, setShowOnChain] = useState(false);

  const winRate = getWinRate();
  const score = predictionScore;

  const scoreLabel =
    score >= 80 ? "Elite" : score >= 60 ? "Strong" : score >= 40 ? "Rising" : score >= 20 ? "Beginner" : "New";
  const scoreColor =
    score >= 80 ? "text-accent" : score >= 60 ? "text-up" : score >= 40 ? "text-yellow-500" : "text-text-dim";

  return (
    <div className="space-y-3">
      {/* Main stats row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {/* Streak */}
        <motion.div whileHover={{ scale: 1.02 }} className="glass rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Flame className="w-4 h-4 text-accent" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-gradient">{streak}x</div>
            <div className="text-[10px] text-text-dim uppercase tracking-wider">Streak</div>
          </div>
        </motion.div>

        {/* Win Rate */}
        <motion.div whileHover={{ scale: 1.02 }} className="glass rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-up/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-up" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-up">{winRate}%</div>
            <div className="text-[10px] text-text-dim uppercase tracking-wider">Win Rate</div>
          </div>
        </motion.div>

        {/* Prediction Score */}
        <motion.div whileHover={{ scale: 1.02 }} className="glass rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Award className="w-4 h-4 text-accent" />
          </div>
          <div>
            <div className={`text-lg font-bold font-mono ${scoreColor}`}>{score}</div>
            <div className="text-[10px] text-text-dim uppercase tracking-wider">{scoreLabel}</div>
          </div>
        </motion.div>

        {/* PnL */}
        <motion.div whileHover={{ scale: 1.02 }} className="glass rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shrink-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${totalPnL >= 0 ? "bg-up/10" : "bg-down/10"}`}>
            <Zap className={`w-4 h-4 ${totalPnL >= 0 ? "text-up" : "text-down"}`} />
          </div>
          <div>
            <div className={`text-lg font-bold font-mono ${totalPnL >= 0 ? "text-up" : "text-down"}`}>
              {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(1)}
            </div>
            <div className="text-[10px] text-text-dim uppercase tracking-wider">P&L</div>
          </div>
        </motion.div>

        {/* Shield */}
        {shields > 0 && (
          <motion.div whileHover={{ scale: 1.02 }}
            onClick={() => streak > 0 && (activeShield ? deactivateShield() : activateShield())}
            className={`glass rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shrink-0 cursor-pointer transition-all ${
              activeShield ? "ring-2 ring-accent/30 bg-accent/5" : ""
            }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeShield ? "bg-accent/20" : "bg-accent/10"}`}>
              <Shield className={`w-4 h-4 ${activeShield ? "text-accent" : "text-accent/60"}`} />
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-accent">{shields}</div>
              <div className="text-[10px] text-text-dim uppercase tracking-wider">
                {activeShield ? "Active" : "Shield"}
              </div>
            </div>
          </motion.div>
        )}

        {/* Share */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={onShare}
          className="glass rounded-xl px-3.5 py-2.5 flex items-center gap-2 shrink-0 hover:bg-accent/5 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Share2 className="w-4 h-4 text-accent" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-accent">Share</div>
            <div className="text-[10px] text-text-dim">Streak Card</div>
          </div>
        </motion.button>
      </div>

      {/* On-chain indicator */}
      {address && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/5 border border-accent/10">
          <div className="flex items-center gap-1.5">
            <Database className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-medium text-accent">On-chain</span>
          </div>
          {onChainLoading ? (
            <div className="w-3 h-3 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
          ) : onChainStreak > 0 ? (
            <div className="flex items-center gap-3 text-[10px] text-text-dim">
              <span>Streak: <span className="font-bold text-accent">{onChainStreak}</span></span>
              <span>Best: <span className="font-bold text-accent">{onChainBestStreak}</span></span>
              <span>Score: <span className="font-bold text-accent">{onChainPredictionScore}</span></span>
            </div>
          ) : (
            <span className="text-[10px] text-text-dim">Your streak is recorded on-chain when you trade</span>
          )}
          <button onClick={refreshOnChain} className="ml-auto text-[10px] text-accent/60 hover:text-accent">
            Refresh
          </button>
        </motion.div>
      )}
    </div>
  );
}
