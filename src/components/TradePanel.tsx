"use client";

import { useState } from "react";
import { useStreakStore } from "@/lib/store";
import {
  ArrowUp,
  ArrowDown,
  X,
  Flame,
  AlertTriangle,
} from "lucide-react";

interface TradePanelProps {
  market: {
    symbol: string;
    underlying: string;
    window: string;
    upProbability: number;
  };
  onClose: () => void;
}

export default function TradePanel({ market, onClose }: TradePanelProps) {
  const [side, setSide] = useState<"UP" | "DOWN">("UP");
  const [stake, setStake] = useState(10);
  const { placeTrade, streak, getMultiplier } = useStreakStore();
  const multiplier = getMultiplier();
  const potentialPayout = stake * multiplier;

  const presets = [1, 5, 10, 25, 50];

  const handleTrade = () => {
    placeTrade({
      marketId: market.symbol,
      symbol: market.symbol,
      side,
      stake,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:w-[420px] max-h-[90vh] overflow-y-auto glass-strong rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-text-dim" />
        </button>

        {/* Market Info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-text-dim">{market.underlying}</span>
            <span className="text-xs text-text-muted">·</span>
            <span className="text-sm text-text-dim">{market.window}</span>
          </div>
          <div className="text-lg font-bold text-text">{market.symbol}</div>
        </div>

        {/* Side Selection */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => setSide("UP")}
            className={`py-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-2 transition-all duration-200 ${
              side === "UP"
                ? "bg-up/15 border-2 border-up/40 text-up glow-up"
                : "bg-bg border border-border text-text-dim hover:border-up/20"
            }`}
          >
            <ArrowUp className="w-6 h-6" />
            <span>UP</span>
            <span className="text-xs opacity-70">
              {market.upProbability.toFixed(0)}%
            </span>
          </button>
          <button
            onClick={() => setSide("DOWN")}
            className={`py-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-2 transition-all duration-200 ${
              side === "DOWN"
                ? "bg-down/15 border-2 border-down/40 text-down glow-down"
                : "bg-bg border border-border text-text-dim hover:border-down/20"
            }`}
          >
            <ArrowDown className="w-6 h-6" />
            <span>DOWN</span>
            <span className="text-xs opacity-70">
              {(100 - market.upProbability).toFixed(0)}%
            </span>
          </button>
        </div>

        {/* Streak Multiplier */}
        {streak > 0 && (
          <div className="mb-5 p-3 rounded-xl bg-fire-1/10 border border-fire-1/20 flex items-center gap-3">
            <Flame className="w-5 h-5 text-fire-1 animate-fire" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-fire-1">
                {streak}x streak active
              </div>
              <div className="text-xs text-text-dim">
                Multiplier applied to payout
              </div>
            </div>
            <div className="text-lg font-bold font-mono text-fire-1">
              {multiplier}x
            </div>
          </div>
        )}

        {/* Stake Input */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-2 block">
            Stake (tUSDC)
          </label>
          <div className="relative">
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(Math.max(0.1, Number(e.target.value)))}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-xl font-mono font-bold text-text focus:outline-none focus:border-accent/50 transition-colors"
              min="0.1"
              step="0.1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-dim">
              tUSDC
            </span>
          </div>
          {/* Presets */}
          <div className="flex gap-2 mt-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setStake(p)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  stake === p
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "bg-bg text-text-dim border border-border hover:border-accent/20"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Payout Preview */}
        <div className="mb-5 p-4 rounded-xl bg-bg border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-dim">If you WIN</span>
            <span className="text-sm font-bold text-up">
              +{potentialPayout.toFixed(1)} tUSDC
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-dim">If you LOSE</span>
            <span className="text-sm font-bold text-down">
              -{stake.toFixed(1)} tUSDC
            </span>
          </div>
          {streak > 0 && (
            <div className="mt-2 pt-2 border-t border-border flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-fire-1" />
              <span className="text-xs text-fire-1">
                Losing resets your {streak}x streak
              </span>
            </div>
          )}
        </div>

        {/* Place Trade Button */}
        <button
          onClick={handleTrade}
          className={`w-full py-4 rounded-2xl text-base font-bold text-white transition-all duration-200 ${
            side === "UP"
              ? "btn-up"
              : "btn-down"
          }`}
        >
          Place Trade — {stake} tUSDC {side}
        </button>
      </div>
    </div>
  );
}
