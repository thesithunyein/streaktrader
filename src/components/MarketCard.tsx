"use client";

import { useState, useEffect } from "react";
import { Clock, ArrowUp, ArrowDown } from "lucide-react";

interface MarketCardProps {
  symbol: string;
  downSymbol: string;
  marketSymbol: string;
  underlying: string;
  window: string;
  expiry: number;
  upProbability: number;
  marketId: string;
  poolAddress: string;
  status: number;
  onTrade: (market: any) => void;
}

export default function MarketCard(props: MarketCardProps) {
  const { symbol, downSymbol, marketSymbol, underlying, window, expiry, upProbability, onTrade } = props;
  const [timeLeft, setTimeLeft] = useState("");
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const diff = expiry - now;
      if (diff <= 0) { setTimeLeft("Expired"); setProgress(0); return; }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      setProgress(Math.min(100, (diff / (15 * 60 * 1000)) * 100));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiry]);

  const downProbability = 100 - upProbability;

  return (
    <div className="glass rounded-[16px] p-5 card-hover group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center overflow-hidden">
            {underlying === "BTC" ? (
              <svg viewBox="0 0 32 32" className="w-8 h-8"><circle cx="16" cy="16" r="16" fill="#F7931A"/><text x="16" y="21" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">₿</text></svg>
            ) : (
              <svg viewBox="0 0 32 32" className="w-8 h-8"><circle cx="16" cy="16" r="16" fill="#627EEA"/><text x="16" y="21" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">Ξ</text></svg>
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{underlying}</div>
            <div className="text-xs text-slate-500">{window} window</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
          <Clock className="w-3 h-3 text-slate-400" />
          <span className={`text-xs font-mono font-semibold ${progress < 20 ? "text-[#dc2626] animate-settle-pulse" : "text-slate-700"}`}>{timeLeft}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <ArrowUp className="w-3.5 h-3.5 text-[#16a34a]" />
            <span className="text-xs font-semibold text-[#16a34a]">UP {upProbability.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#dc2626]">DOWN {downProbability.toFixed(0)}%</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#dc2626]" />
          </div>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
          <div className="h-full bg-gradient-to-r from-[#16a34a] to-[#16a34a]/70 rounded-l-full transition-all duration-500" style={{ width: `${upProbability}%` }} />
          <div className="h-full bg-gradient-to-r from-[#dc2626]/70 to-[#dc2626] rounded-r-full transition-all duration-500" style={{ width: `${downProbability}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onTrade(props)}
          className="btn-up py-3 rounded-[12px] text-sm font-bold text-white flex items-center justify-center gap-2">
          <ArrowUp className="w-4 h-4" /> TRADE UP
        </button>
        <button onClick={() => onTrade(props)}
          className="btn-down py-3 rounded-[12px] text-sm font-bold text-white flex items-center justify-center gap-2">
          <ArrowDown className="w-4 h-4" /> TRADE DOWN
        </button>
      </div>

      <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full bg-[#2563eb]/20 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
