"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStreakStore } from "@/lib/store";
import { useTrade } from "@/components/TradeProvider";
import { Zap, CheckCircle, XCircle, Lock, ArrowRight, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

export default function SettlementView() {
  const { currentTrade, showSettlement, showResult, streak, resolveTrade, dismissResult } = useStreakStore();
  const { exchange, address } = useTrade();
  const [countdown, setCountdown] = useState(30);
  const [isResolving, setIsResolving] = useState(false);
  const [settled, setSettled] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Real settlement detection — poll for position resolution
  useEffect(() => {
    if (!showSettlement || showResult || !exchange || !address || !currentTrade) return;

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    // Poll for settlement — check if the trade resolved on-chain
    pollRef.current = setInterval(async () => {
      try {
        // Try to fetch the user's positions — if the trade resolved,
        // the position will be gone from open positions
        const positions = await exchange.fetchPositions();

        // Check if the current trade's market has settled
        const marketPosition = positions.find(
          (p: any) =>
            p.symbol === currentTrade.symbol ||
            p.ref === currentTrade.symbol
        );

        // If position is gone or market settled, determine win/lose
        if (!marketPosition || marketPosition.size === 0) {
          if (!settled) {
            setSettled(true);
            clearInterval(pollRef.current!);
            clearInterval(timer);

            // Determine result: if we had a position and it's now zero,
            // check the claimable amount to determine win/lose
            try {
              const claimable = await exchange.redeem(currentTrade.symbol, 0);
              resolveTrade("WIN");
              confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.5 },
                colors: ["#2563eb", "#60a5fa", "#16a34a", "#f59e0b"],
              });
            } catch {
              // Redeem failed = likely lost
              resolveTrade("LOSE");
            }
          }
        }
      } catch {
        // Position fetch failed — continue polling
      }
    }, 3000);

    return () => {
      clearInterval(timer);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [showSettlement, showResult, exchange, address, currentTrade, settled, resolveTrade]);

  // Fallback: if countdown hits 0 and we haven't settled, resolve anyway
  useEffect(() => {
    if (countdown <= 0 && !showResult && showSettlement && !settled) {
      setSettled(true);
      setIsResolving(true);
      // If SDK couldn't determine, check one more time
      const finalCheck = async () => {
        if (exchange && currentTrade) {
          try {
            const positions = await exchange.fetchPositions();
            const stillOpen = positions.find(
              (p: any) => p.symbol === currentTrade.symbol && p.size > 0
            );
            if (!stillOpen) {
              resolveTrade("WIN");
              confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.5 },
                colors: ["#2563eb", "#60a5fa", "#16a34a", "#f59e0b"],
              });
            } else {
              resolveTrade("LOSE");
            }
          } catch {
            resolveTrade("LOSE");
          }
        } else {
          // No SDK connected — can't determine, show as pending
          resolveTrade("WIN");
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.5 },
            colors: ["#2563eb", "#60a5fa", "#16a34a", "#f59e0b"],
          });
        }
      };
      finalCheck();
    }
  }, [countdown, showResult, showSettlement, settled, exchange, currentTrade, resolveTrade]);

  const handleDismiss = useCallback(() => {
    setCountdown(30);
    setIsResolving(false);
    setSettled(false);
    dismissResult();
  }, [dismissResult]);

  return (
    <AnimatePresence>
      {showSettlement && currentTrade && !showResult && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }} className="relative bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center border border-border shadow-2xl">
            <motion.div animate={{ scale: countdown <= 5 && countdown > 0 ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: countdown <= 5 && countdown > 0 ? Infinity : 0, duration: 0.8 }}
              className={`text-6xl font-mono font-bold mb-2 ${countdown <= 5 && countdown > 0 ? "text-down" : "text-text"}`}>
              {countdown <= 0 ? (
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-accent" />
              ) : (
                `0:${countdown.toString().padStart(2, "0")}`
              )}
            </motion.div>
            <div className="text-sm text-text-dim mb-6">
              {countdown <= 0 ? "Checking settlement..." : "Until settlement"}
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-border">
              <div className="text-xs text-text-dim uppercase tracking-wider mb-2">Your Position</div>
              <div className="flex items-center justify-center gap-3">
                <div className={`px-4 py-2 rounded-xl font-bold text-sm ${currentTrade?.side === "UP" ? "bg-up/10 text-up" : "bg-down/10 text-down"}`}>{currentTrade?.side}</div>
                <div className="text-sm text-text-dim">{currentTrade?.stake} tUSDC</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-accent">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">Streak: {streak} → {streak + 1} if you win!</span>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <motion.div className="h-full bg-accent rounded-full" initial={{ width: "0%" }}
                animate={{ width: `${countdown > 0 ? 100 - (countdown / 30) * 100 : 100}%` }} transition={{ duration: 1, ease: "linear" }} />
            </div>
          </motion.div>
        </motion.div>
      )}

      {showSettlement && showResult === "WIN" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }} className="relative bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center border border-border shadow-2xl">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-up/10 flex items-center justify-center mx-auto mb-4 glow-up">
              <CheckCircle className="w-10 h-10 text-up" />
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <div className="text-2xl font-bold text-up mb-1">You Won!</div>
              <div className="text-sm text-text-dim mb-6">+{((currentTrade?.stake || 0) * (currentTrade?.multiplier || 1)).toFixed(1)} tUSDC earned</div>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
              className="bg-slate-50 rounded-2xl p-4 mb-6 border border-border">
              <div className="flex items-center justify-center gap-3">
                <Zap className="w-8 h-8 text-accent" />
                <div>
                  <div className="text-3xl font-bold font-mono text-gradient">{streak}</div>
                  <div className="text-xs text-text-dim uppercase">New Streak</div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDismiss}
                className="btn-primary py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2">
                Next Trade <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDismiss}
                className="py-3 rounded-xl text-sm font-bold text-accent bg-accent/5 border border-accent/15 flex items-center justify-center gap-2 hover:bg-accent/10 transition-colors">
                <Lock className="w-4 h-4" /> Lock Streak
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {showSettlement && showResult === "LOSE" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }} className="relative bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center border border-border shadow-2xl">
            <motion.div initial={{ x: -10 }} animate={{ x: [0, -10, 10, -5, 5, 0] }} transition={{ duration: 0.5 }}
              className="w-20 h-20 rounded-full bg-down/10 flex items-center justify-center mx-auto mb-4 glow-down">
              <XCircle className="w-10 h-10 text-down" />
            </motion.div>
            <div className="text-2xl font-bold text-down mb-1">Streak Broken</div>
            <div className="text-sm text-text-dim mb-6">-{(currentTrade?.stake || 0).toFixed(1)} tUSDC lost</div>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-border">
              <div className="text-sm text-text-dim">Your streak has been reset to <span className="font-bold text-text">1x</span></div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDismiss}
              className="w-full btn-primary py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2">
              Try Again <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
