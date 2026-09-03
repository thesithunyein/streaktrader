"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ArrowUp, ArrowDown, Clock, Users, Zap, Shield, TrendingUp, TrendingDown } from "lucide-react";

interface StreakBet {
  id: string;
  trader: string;
  currentStreak: number;
  multiplier: number;
  hasShield: boolean;
  market: string;
  odds: { keep: number; break: number };
  totalBets: number;
  endsAt: number;
  resolved?: boolean;
  keptStreak?: boolean;
}

const SAMPLE_BETS: StreakBet[] = [
  {
    id: "bet-1",
    trader: "0x7a35...9Da2",
    currentStreak: 8,
    multiplier: 8,
    hasShield: false,
    market: "BTC/USD 15m",
    odds: { keep: 42, break: 58 },
    totalBets: 23,
    endsAt: Date.now() + 12 * 60 * 1000,
  },
  {
    id: "bet-2",
    trader: "0x1234...abcd",
    currentStreak: 5,
    multiplier: 5,
    hasShield: true,
    market: "ETH/USD 5m",
    odds: { keep: 61, break: 39 },
    totalBets: 15,
    endsAt: Date.now() + 8 * 60 * 1000,
  },
  {
    id: "bet-3",
    trader: "0xdef0...6789",
    currentStreak: 12,
    multiplier: 12,
    hasShield: false,
    market: "BTC/USD 5m",
    odds: { keep: 35, break: 65 },
    totalBets: 31,
    endsAt: Date.now() + 3 * 60 * 1000,
  },
];

function CountdownSmall({ endsAt }: { endsAt: number }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, endsAt - Date.now());
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return <span className="font-mono text-xs">{timeLeft}</span>;
}

export default function StreakBetting() {
  const [bets, setBets] = useState(SAMPLE_BETS);
  const [selectedBet, setSelectedBet] = useState<StreakBet | null>(null);
  const [betSide, setBetSide] = useState<"keep" | "break">("keep");
  const [betAmount, setBetAmount] = useState(1);
  const [placedBets, setPlacedBets] = useState<Set<string>>(new Set());

  const handlePlaceBet = (bet: StreakBet) => {
    setPlacedBets(prev => new Set([...prev, bet.id]));
    setSelectedBet(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold text-slate-900">Streak Bets</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium border border-amber-100">
          NEW
        </span>
      </div>

      <div className="px-4 py-2 bg-amber-50/50 border-b border-amber-100">
        <p className="text-[10px] text-amber-700 leading-relaxed">
          Bet on whether another trader will keep their streak. Higher streaks = higher risk = better odds.
        </p>
      </div>

      {/* Bet list */}
      <div className="divide-y divide-slate-100">
        {bets.map((bet) => {
          const isPlaced = placedBets.has(bet.id);
          return (
            <div key={bet.id} className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    bet.currentStreak >= 10 ? "bg-amber-50 border border-amber-200" :
                    bet.currentStreak >= 5 ? "bg-orange-50 border border-orange-200" :
                    "bg-slate-50 border border-slate-200"
                  }`}>
                    <span className="text-xs font-bold text-amber-600">{bet.currentStreak}x</span>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-slate-600">{bet.trader}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <span>{bet.market}</span>
                      {bet.hasShield && (
                        <span className="flex items-center gap-0.5 text-[#2563eb]">
                          <Shield className="w-2.5 h-2.5" /> Shield
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <CountdownSmall endsAt={bet.endsAt} />
                </div>
              </div>

              {/* Odds bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-bold text-[#16a34a]">Keep {bet.odds.keep}%</span>
                  <span className="font-bold text-[#dc2626]">Break {bet.odds.break}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
                  <div className="h-full bg-[#16a34a] rounded-l-full transition-all" style={{ width: `${bet.odds.keep}%` }} />
                  <div className="h-full bg-[#dc2626] rounded-r-full transition-all" style={{ width: `${bet.odds.break}%` }} />
                </div>
              </div>

              {/* Bet buttons */}
              {isPlaced ? (
                <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-accent/5 border border-accent/15">
                  <Zap className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-bold text-accent">Bet placed!</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setSelectedBet(bet); setBetSide("keep"); }}
                    className="py-2 rounded-xl text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <TrendingUp className="w-3 h-3" /> Keep ({(betAmount / (bet.odds.keep / 100)).toFixed(1)}x)
                  </button>
                  <button
                    onClick={() => { setSelectedBet(bet); setBetSide("break"); }}
                    className="py-2 rounded-xl text-xs font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <TrendingDown className="w-3 h-3" /> Break ({(betAmount / (bet.odds.break / 100)).toFixed(1)}x)
                  </button>
                </div>
              )}

              <div className="mt-1.5 text-center text-[10px] text-slate-400">
                {bet.totalBets} bets placed
              </div>
            </div>
          );
        })}
      </div>

      {/* Bet confirmation modal */}
      <AnimatePresence>
        {selectedBet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedBet(null)} />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative z-10 bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl">
              <h3 className="text-base font-bold text-slate-900 mb-1">Place Streak Bet</h3>
              <p className="text-xs text-slate-500 mb-4">
                Bet on {selectedBet.trader}&apos;s {selectedBet.currentStreak}x streak
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500">Your bet</span>
                  <span className="text-xs font-bold text-slate-900">{betSide === "keep" ? "Streak continues" : "Streak breaks"}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500">Payout multiplier</span>
                  <span className="text-xs font-bold text-accent">
                    {(1 / (betSide === "keep" ? selectedBet.odds.keep : selectedBet.odds.break) * 100).toFixed(2)}x
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500">Shield status</span>
                  <span className={`text-xs font-bold ${selectedBet.hasShield ? "text-[#2563eb]" : "text-slate-400"}`}>
                    {selectedBet.hasShield ? "Has shield (harder to break)" : "No shield"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setSelectedBet(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button onClick={() => handlePlaceBet(selectedBet)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-colors ${
                    betSide === "keep" ? "bg-[#16a34a] hover:bg-[#15803d]" : "bg-[#dc2626] hover:bg-[#b91c1c]"
                  }`}>
                  Confirm Bet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
