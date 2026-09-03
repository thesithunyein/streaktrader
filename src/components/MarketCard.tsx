"use client";

import { useState, useEffect } from "react";
import { Clock, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";

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
  const [livePrice, setLivePrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [volume] = useState(() => Math.floor(Math.random() * 500 + 200));

  const isBTC = underlying === "BTC";
  const color = isBTC ? "#F7931A" : "#627EEA";
  const colorLight = isBTC ? "rgba(247,147,26,0.08)" : "rgba(98,126,234,0.08)";
  const colorBorder = isBTC ? "rgba(247,147,26,0.15)" : "rgba(98,126,234,0.15)";

  useEffect(() => {
    // Simulate live price movement
    const basePrice = isBTC ? 78500 : 3200;
    setLivePrice(basePrice + (Math.random() - 0.5) * 200);
    
    const interval = setInterval(() => {
      setLivePrice(prev => {
        const change = (Math.random() - 0.5) * (isBTC ? 50 : 10);
        setPriceChange(change);
        return prev + change;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isBTC]);

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
  const isUptrend = priceChange >= 0;

  return (
    <div className="rounded-[16px] p-5 card-hover group border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header: Logo + Name + Time Window */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ background: colorLight, border: `1px solid ${colorBorder}` }}>
            {isBTC ? (
              <svg viewBox="0 0 32 32" className="w-6 h-6"><circle cx="16" cy="16" r="16" fill="#F7931A"/><text x="16" y="21" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">₿</text></svg>
            ) : (
              <svg viewBox="0 0 400 400" className="w-6 h-6">
                <rect width="400" height="400" rx="80" fill="#627EEA"/>
                <polygon points="200,60 340,210 200,280" fill="#FFFFFF" />
                <polygon points="200,60 60,210 200,280" fill="#C4C8CC" />
                <polygon points="200,300 60,210 200,280" fill="#C4C8CC" opacity="0.8" />
                <polygon points="200,300 340,210 200,280" fill="#FFFFFF" opacity="0.6" />
              </svg>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{underlying}/USD</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: colorLight, color, border: `1px solid ${colorBorder}` }}>
                {window}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Event Contract</div>
          </div>
        </div>
        
        {/* Timer */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className={`text-xs font-mono font-bold ${progress < 20 ? "text-[#dc2626] animate-pulse" : "text-slate-700"}`}>
              {timeLeft}
            </span>
          </div>
          <span className="text-[9px] text-slate-400 uppercase tracking-wider font-medium">Time Left</span>
        </div>
      </div>

      {/* Live Price */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Live Price</div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-slate-900 font-mono">
              ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${isUptrend ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
              {isUptrend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isUptrend ? "+" : ""}{priceChange.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">24h Volume</div>
          <div className="text-sm font-semibold text-slate-700">${volume.toLocaleString()}</div>
        </div>
      </div>

      {/* Probability Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
            <span className="text-xs font-bold text-[#16a34a]">UP {upProbability.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#dc2626]">DOWN {downProbability.toFixed(0)}%</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
          </div>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
          <div className="h-full bg-gradient-to-r from-[#16a34a] to-[#16a34a]/80 rounded-l-full transition-all duration-500" style={{ width: `${upProbability}%` }} />
          <div className="h-full bg-gradient-to-r from-[#dc2626]/80 to-[#dc2626] rounded-r-full transition-all duration-500" style={{ width: `${downProbability}%` }} />
        </div>
      </div>

      {/* Market Sentiment */}
      <div className="flex items-center gap-4 mb-4 px-1">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] text-slate-500">
            {upProbability > 55 ? "Bullish sentiment" : downProbability > 55 ? "Bearish sentiment" : "Market balanced"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] text-slate-500">
            {progress > 50 ? "High activity" : progress > 20 ? "Moderate activity" : "Closing soon"}
          </span>
        </div>
      </div>

      {/* Trade Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onTrade(props)}
          className="py-3 rounded-[12px] text-sm font-bold text-white flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] transition-colors shadow-sm">
          <ArrowUp className="w-4 h-4" /> TRADE UP
        </button>
        <button onClick={() => onTrade(props)}
          className="py-3 rounded-[12px] text-sm font-bold text-white flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] transition-colors shadow-sm">
          <ArrowDown className="w-4 h-4" /> TRADE DOWN
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, background: color }} />
      </div>
    </div>
  );
}
