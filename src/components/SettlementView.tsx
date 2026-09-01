"use client";

import { useState, useEffect, useCallback } from "react";
import { useStreakStore } from "@/lib/store";
import { Zap, CheckCircle, XCircle, Lock, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

export default function SettlementView() {
  const {
    currentTrade,
    showSettlement,
    showResult,
    streak,
    resolveTrade,
    dismissResult,
  } = useStreakStore();

  const [countdown, setCountdown] = useState(10);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (!showSettlement || showResult) return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          setIsResolving(true);
          const result = Math.random() < 0.7 ? "WIN" : "LOSE";
          setTimeout(() => {
            resolveTrade(result);
            if (result === "WIN") {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#2563eb", "#3b82f6", "#60a5fa", "#22c55e"],
              });
            }
          }, 500);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showSettlement, showResult, resolveTrade]);

  const handleDismiss = useCallback(() => {
    setCountdown(10);
    setIsResolving(false);
    dismissResult();
  }, [dismissResult]);

  if (!showSettlement || !currentTrade) return null;

  // Settlement Countdown
  if (!showResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
        <div className="relative glass-strong rounded-3xl p-8 max-w-sm w-full mx-4 text-center animate-slide-up">
          <div
            className={`text-6xl font-mono font-bold mb-2 ${
              countdown <= 3 ? "text-down animate-settle-pulse" : "text-text"
            }`}
          >
            {isResolving ? "..." : `0:${countdown.toString().padStart(2, "0")}`}
          </div>

          <div className="text-sm text-text-dim mb-6">
            {isResolving ? "Settling..." : "Until settlement"}
          </div>

          <div className="glass rounded-2xl p-4 mb-6">
            <div className="text-xs text-text-dim uppercase tracking-wider mb-2">
              Your Position
            </div>
            <div className="flex items-center justify-center gap-3">
              <div
                className={`px-4 py-2 rounded-xl font-bold text-sm ${
                  currentTrade.side === "UP"
                    ? "bg-up/15 text-up"
                    : "bg-down/15 text-down"
                }`}
              >
                {currentTrade.side}
              </div>
              <div className="text-sm text-text-dim">
                {currentTrade.stake} tUSDC
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-accent">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold">
              Streak: {streak} → {streak + 1} if you win!
            </span>
          </div>

          <div className="mt-4 h-1.5 rounded-full bg-bg overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-1000"
              style={{ width: `${100 - (countdown / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // WIN Result
  if (showResult === "WIN") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
        <div className="relative glass-strong rounded-3xl p-8 max-w-sm w-full mx-4 text-center animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-up/15 flex items-center justify-center mx-auto mb-4 glow-up">
            <CheckCircle className="w-10 h-10 text-up" />
          </div>

          <div className="text-2xl font-bold text-up mb-1">You Won!</div>
          <div className="text-sm text-text-dim mb-6">
            +{(currentTrade.stake * currentTrade.multiplier).toFixed(1)} tUSDC
            earned
          </div>

          <div className="glass rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-accent" />
              <div>
                <div className="text-3xl font-bold font-mono text-gradient">
                  {streak}
                </div>
                <div className="text-xs text-text-dim uppercase">
                  New Streak
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDismiss}
              className="btn-primary py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
            >
              Next Trade
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleDismiss}
              className="py-3 rounded-xl text-sm font-bold text-accent bg-accent/10 border border-accent/20 flex items-center justify-center gap-2 hover:bg-accent/20 transition-colors"
            >
              <Lock className="w-4 h-4" />
              Lock Streak
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOSE Result
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className="relative glass-strong rounded-3xl p-8 max-w-sm w-full mx-4 text-center animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-down/15 flex items-center justify-center mx-auto mb-4 glow-down">
          <XCircle className="w-10 h-10 text-down" />
        </div>

        <div className="text-2xl font-bold text-down mb-1">Streak Broken</div>
        <div className="text-sm text-text-dim mb-6">
          -{currentTrade.stake.toFixed(1)} tUSDC lost
        </div>

        <div className="glass rounded-2xl p-4 mb-6">
          <div className="text-sm text-text-dim">
            Your streak has been reset to{" "}
            <span className="font-bold text-text">1x</span>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="w-full btn-primary py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
        >
          Try Again
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
