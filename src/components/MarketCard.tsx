"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowUp, ArrowDown } from "lucide-react";

interface MarketCardProps {
  symbol: string;
  underlying: string;
  window: string;
  expiry: number;
  upProbability: number;
  onTrade: (side: "UP" | "DOWN") => void;
}

export default function MarketCard({
  symbol,
  underlying,
  window,
  expiry,
  upProbability,
  onTrade,
}: MarketCardProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const diff = expiry - now;
      if (diff <= 0) {
        setTimeLeft("Expired");
        setProgress(0);
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      const totalMs = 15 * 60 * 1000;
      setProgress(Math.min(100, (diff / totalMs) * 100));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiry]);

  const downProbability = 100 - upProbability;

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="glass rounded-2xl p-5 card-hover group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
            <span className="text-xs font-bold text-accent">
              {underlying.slice(0, 2)}
            </span>
          </div>
          <div>
            <div className="text-sm font-semibold text-text">{underlying}</div>
            <div className="text-xs text-text-dim">{window} window</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg border border-border">
          <Clock className="w-3 h-3 text-text-dim" />
          <span
            className={`text-xs font-mono font-semibold ${
              progress < 20 ? "text-down animate-settle-pulse" : "text-text"
            }`}
          >
            {timeLeft}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <ArrowUp className="w-3.5 h-3.5 text-up" />
            <span className="text-xs font-semibold text-up">
              UP {upProbability.toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-down">
              DOWN {downProbability.toFixed(0)}%
            </span>
            <ArrowDown className="w-3.5 h-3.5 text-down" />
          </div>
        </div>
        <div className="h-2.5 rounded-full bg-bg overflow-hidden flex">
          <motion.div
            className="h-full bg-gradient-to-r from-up to-up/70 rounded-l-full"
            animate={{ width: `${upProbability}%` }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="h-full bg-gradient-to-r from-down/70 to-down rounded-r-full"
            animate={{ width: `${downProbability}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTrade("UP")}
          className="btn-up py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
        >
          <ArrowUp className="w-4 h-4" />
          TRADE UP
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTrade("DOWN")}
          className="btn-down py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
        >
          <ArrowDown className="w-4 h-4" />
          TRADE DOWN
        </motion.button>
      </div>

      <div className="mt-3 h-1 rounded-full bg-bg overflow-hidden">
        <motion.div
          className="h-full bg-accent/30 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1 }}
        />
      </div>
    </motion.div>
  );
}
