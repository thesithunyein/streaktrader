"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStreakStore } from "@/lib/store";
import { useTrade } from "@/components/TradeProvider";
import { ArrowUp, ArrowDown, X, Zap, AlertTriangle, Loader2 } from "lucide-react";

interface TradePanelProps {
  market: { symbol: string; underlying: string; window: string; upProbability: number; poolAddress?: string };
  onClose: () => void;
}

export default function TradePanel({ market, onClose }: TradePanelProps) {
  const [side, setSide] = useState<"UP" | "DOWN">("UP");
  const [stake, setStake] = useState(10);
  const [placing, setPlacing] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const { placeTrade, streak, getMultiplier } = useStreakStore();
  const { address, placeOrder } = useTrade();
  const multiplier = getMultiplier();
  const potentialPayout = stake * multiplier;
  const presets = [1, 5, 10, 25, 50];

  const handlePlaceTrade = async () => {
    if (!address) {
      setTradeError("Connect your wallet first");
      return;
    }

    setPlacing(true);
    setTradeError(null);

    try {
      // Place a real IOC market order via SDK
      // Side: BUY YES for UP, BUY NO for DOWN
      const orderSide = side === "UP" ? "buy" : "buy";

      await placeOrder(
        market.symbol,
        orderSide,
        stake,
        undefined, // market order, no limit price
        "IOC" // immediate or cancel
      );

      // If order succeeds, create the local streak trade
      placeTrade({
        marketId: market.symbol,
        symbol: market.symbol,
        side,
        stake,
      });

      onClose();
    } catch (e: any) {
      setTradeError(e.message || "Trade failed. Check your balance and try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full sm:w-[420px] max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl p-6 border border-border shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <X className="w-4 h-4 text-text-dim" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-text-dim">{market.underlying}</span>
            <span className="text-xs text-text-muted">·</span>
            <span className="text-sm text-text-dim">{market.window}</span>
          </div>
          <div className="text-lg font-bold text-text">{market.symbol}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSide("UP")}
            className={`py-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-2 transition-all ${side === "UP" ? "bg-up/10 border-2 border-up/30 text-up glow-up" : "bg-slate-50 border border-border text-text-dim hover:border-up/20"}`}>
            <ArrowUp className="w-6 h-6" /><span>UP</span>
            <span className="text-xs opacity-70">{market.upProbability.toFixed(0)}%</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSide("DOWN")}
            className={`py-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-2 transition-all ${side === "DOWN" ? "bg-down/10 border-2 border-down/30 text-down glow-down" : "bg-slate-50 border border-border text-text-dim hover:border-down/20"}`}>
            <ArrowDown className="w-6 h-6" /><span>DOWN</span>
            <span className="text-xs opacity-70">{(100 - market.upProbability).toFixed(0)}%</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {streak > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-3 rounded-xl bg-accent/5 border border-accent/15 flex items-center gap-3 overflow-hidden">
              <Zap className="w-5 h-5 text-accent" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-accent">{streak}x streak active</div>
                <div className="text-xs text-text-dim">Multiplier applied to payout</div>
              </div>
              <div className="text-lg font-bold font-mono text-accent">{multiplier}x</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-5">
          <label className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-2 block">Stake (tUSDC)</label>
          <div className="relative">
            <input type="number" value={stake} onChange={(e) => setStake(Math.max(0.1, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-xl font-mono font-bold text-text focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all" min="0.1" step="0.1" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-dim">tUSDC</span>
          </div>
          <div className="flex gap-2 mt-2">
            {presets.map((p) => (
              <motion.button key={p} whileTap={{ scale: 0.95 }} onClick={() => setStake(p)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stake === p ? "bg-accent/10 text-accent border border-accent/20" : "bg-slate-50 text-text-dim border border-border hover:border-accent/20"}`}>
                {p}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-dim">If you WIN</span>
            <span className="text-sm font-bold text-up">+{potentialPayout.toFixed(1)} tUSDC</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-dim">If you LOSE</span>
            <span className="text-sm font-bold text-down">-{stake.toFixed(1)} tUSDC</span>
          </div>
          {streak > 0 && (
            <div className="mt-2 pt-2 border-t border-border flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-down" />
              <span className="text-xs text-down">Losing resets your {streak}x streak</span>
            </div>
          )}
        </div>

        {tradeError && (
          <div className="mb-4 p-3 rounded-xl bg-down/10 border border-down/20 text-sm text-down">
            {tradeError}
          </div>
        )}

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handlePlaceTrade}
          disabled={placing || !address}
          className={`w-full py-4 rounded-2xl text-base font-bold text-white transition-all flex items-center justify-center gap-2 ${!address ? "opacity-50 cursor-not-allowed bg-slate-300" : side === "UP" ? "btn-up" : "btn-down"}`}>
          {placing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Placing order...
            </>
          ) : !address ? (
            "Connect Wallet to Trade"
          ) : (
            `Place Trade — ${stake} tUSDC ${side}`
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
