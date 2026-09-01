"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStreakStore } from "@/lib/store";
import { useTrade } from "@/components/TradeProvider";
import { Zap, CheckCircle, XCircle, Lock, ArrowRight, Loader2, AlertCircle, Shield, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";

// Real BTC price from Binance public API
function useRealPrice() {
  const [price, setPrice] = useState<number>(0);
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    let alive = true;
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
        );
        const data = await res.json();
        const p = parseFloat(data.price);
        if (alive && p > 0) {
          setPrice(p);
          setHistory((h) => [...h.slice(-59), p]);
        }
      } catch {
        try {
          const res = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
          );
          const data = await res.json();
          const p = data.bitcoin?.usd;
          if (alive && p) {
            setPrice(p);
            setHistory((h) => [...h.slice(-59), p]);
          }
        } catch {}
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 2000);
    return () => { alive = false; clearInterval(interval); };
  }, []);

  return { price, history };
}

// Live price chart during settlement — THE tension moment
function PriceChart({ side, entryPrice }: { side: "UP" | "DOWN"; entryPrice: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { price, history } = useRealPrice();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = (canvas.width = canvas.offsetWidth * 2);
    const h = (canvas.height = canvas.offsetHeight * 2);
    ctx.scale(2, 2);
    const cw = w / 2;
    const ch = h / 2;

    ctx.clearRect(0, 0, cw, ch);

    const min = Math.min(...history) - 20;
    const max = Math.max(...history) + 20;
    const range = max - min || 1;

    // Entry price line
    const entryY = ch - ((entryPrice - min) / range) * ch;
    ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, entryY);
    ctx.lineTo(cw, entryY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(100, 116, 139, 0.6)";
    ctx.font = "9px sans-serif";
    ctx.fillText("Entry", 4, entryY - 4);

    const isWinning =
      (side === "UP" && price >= entryPrice) ||
      (side === "DOWN" && price <= entryPrice);
    const color = isWinning ? "#16a34a" : "#dc2626";

    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    history.forEach((p, i) => {
      const x = (i / (history.length - 1)) * cw;
      const y = ch - ((p - min) / range) * ch;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const lastX = cw;
    const lastY = ch - ((history[history.length - 1] - min) / range) * ch;
    ctx.lineTo(lastX, ch);
    ctx.lineTo(0, ch);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, isWinning ? "rgba(22, 163, 74, 0.2)" : "rgba(220, 38, 38, 0.2)");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lastX, lastY, 8, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, [history, price, entryPrice, side]);

  const isWinning =
    (side === "UP" && price >= entryPrice) ||
    (side === "DOWN" && price <= entryPrice);
  const change = price > 0 ? ((price - entryPrice) / entryPrice) * 100 : 0;

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="w-full h-36 sm:h-44" style={{ imageRendering: "auto" }} />
      <div className="flex justify-between items-center mt-2 px-1">
        <div className="text-[10px] text-text-muted">Entry: ${entryPrice.toLocaleString()}</div>
        <div className={`text-sm font-mono font-bold ${isWinning ? "text-up" : "text-down"}`}>
          ${price > 0 ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "..."}
        </div>
        <div className={`text-[10px] font-semibold ${isWinning ? "text-up" : "text-down"}`}>
          {price > 0 ? (
            <>
              {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}% · {isWinning ? "WINNING" : "LOSING"}
            </>
          ) : (
            "Loading price..."
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettlementView() {
  const { currentTrade, showSettlement, showResult, streak, bestStreak, resolveTrade, dismissResult, trades, activeShield, shields } = useStreakStore();
  const { exchange, address, redeem } = useTrade();
  const [countdown, setCountdown] = useState(30);
  const [isResolving, setIsResolving] = useState(false);
  const [settled, setSettled] = useState(false);
  const [entryPrice] = useState(() => 67000 + Math.random() * 2000);
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (!showSettlement || showResult || !currentTrade) return;
    resolvedRef.current = false;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);

    const pollSettlement = setInterval(async () => {
      if (!exchange || settled || resolvedRef.current) return;
      try {
        const positions = await exchange.fetchPositions();
        const marketPos = positions.find((p: any) => p.symbol === currentTrade.symbol && p.size > 0);
        if (!marketPos || marketPos.size === 0) {
          resolvedRef.current = true;
          setSettled(true);
          setIsResolving(true);
          clearInterval(pollSettlement);
          clearInterval(timer);

          try {
            await redeem(currentTrade.symbol, 0);
            resolveTrade("WIN");
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ["#2563eb", "#60a5fa", "#16a34a", "#f59e0b"] });
          } catch {
            resolveTrade("LOSE");
          }
        }
      } catch {}
    }, 3000);

    return () => { clearInterval(timer); clearInterval(pollSettlement); };
  }, [showSettlement, showResult, currentTrade, exchange, settled, resolveTrade, redeem]);

  useEffect(() => {
    if (countdown <= 0 && !showResult && showSettlement && !settled && !resolvedRef.current) {
      if (exchange) {
        setIsResolving(true);
        return;
      }
      setIsResolving(true);
    }
  }, [countdown, showResult, showSettlement, settled, exchange]);

  const handleDismiss = useCallback(() => {
    setCountdown(30);
    setIsResolving(false);
    setSettled(false);
    resolvedRef.current = false;
    dismissResult();
  }, [dismissResult]);

  const handleShare = useCallback(() => {
    // Trigger share modal in parent
    const event = new CustomEvent("share-streak");
    window.dispatchEvent(event);
    handleDismiss();
  }, [handleDismiss]);

  return (
    <AnimatePresence>
      {/* Settlement countdown with live price chart */}
      {showSettlement && currentTrade && !showResult && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full mx-4 text-center border border-border shadow-2xl">

            {/* Shield active indicator */}
            {currentTrade.shieldUsed && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 mb-4 p-2 rounded-xl bg-accent/5 border border-accent/15">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold text-accent">Shield Active — Streak Protected</span>
              </motion.div>
            )}

            {/* Timer */}
            <motion.div animate={{ scale: countdown <= 5 && countdown > 0 ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: countdown <= 5 && countdown > 0 ? Infinity : 0, duration: 0.8 }}
              className={`text-5xl sm:text-6xl font-mono font-bold mb-2 ${countdown <= 5 && countdown > 0 ? "text-down" : "text-text"}`}>
              {countdown <= 0 ? (
                <Loader2 className="w-10 h-10 mx-auto animate-spin text-accent" />
              ) : (
                `0:${countdown.toString().padStart(2, "0")}`
              )}
            </motion.div>
            <div className="text-sm text-text-dim mb-4">
              {countdown <= 0
                ? isResolving
                  ? "Settling on-chain..."
                  : "Waiting for settlement..."
                : "Until settlement"}
            </div>

            {/* Live price chart */}
            <div className="mb-4 rounded-xl bg-slate-50 border border-border p-3">
              <PriceChart side={currentTrade.side} entryPrice={entryPrice} />
            </div>

            {/* Position info */}
            <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${currentTrade.side === "UP" ? "bg-up/10 text-up" : "bg-down/10 text-down"}`}>
                  {currentTrade.side}
                </div>
                <div className="text-sm text-text-dim">{currentTrade.stake} tUSDC</div>
              </div>
              <div className="flex items-center gap-1.5 text-accent">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{streak}x → {streak + 1}x</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <motion.div className="h-full bg-accent rounded-full" initial={{ width: "0%" }}
                animate={{ width: `${countdown > 0 ? 100 - (countdown / 30) * 100 : 100}%` }} transition={{ duration: 1, ease: "linear" }} />
            </div>

            {!exchange && countdown <= 0 && (
              <div className="mt-4 p-3 rounded-xl bg-accent/5 border border-accent/15 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-accent shrink-0" />
                <span className="text-xs text-text-dim">Connect wallet for real on-chain settlement</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* WIN result */}
      {showSettlement && showResult === "WIN" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center border border-border shadow-2xl">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-up/10 flex items-center justify-center mx-auto mb-4 glow-up">
              <CheckCircle className="w-10 h-10 text-up" />
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <div className="text-2xl font-bold text-up mb-1">
                {currentTrade?.shieldUsed ? "Shield Protected!" : "You Won!"}
              </div>
              <div className="text-sm text-text-dim mb-6">
                {currentTrade?.shieldUsed
                  ? "Your streak is safe — Shield absorbed the loss"
                  : `+${((currentTrade?.stake || 0) * (currentTrade?.multiplier || 1)).toFixed(1)} tUSDC earned`}
              </div>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
              className="bg-slate-50 rounded-xl p-4 mb-5 border border-border">
              <div className="flex items-center justify-center gap-3">
                <Zap className="w-8 h-8 text-accent" />
                <div>
                  <div className="text-3xl font-bold font-mono text-gradient">{streak}</div>
                  <div className="text-xs text-text-dim uppercase">New Streak</div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDismiss}
                className="btn-primary py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2">
                Next Trade <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleShare}
                className="py-3 rounded-xl text-sm font-bold text-accent bg-accent/5 border border-accent/15 flex items-center justify-center gap-2 hover:bg-accent/10 transition-colors">
                <Lock className="w-4 h-4" /> Share Win
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* LOSE result */}
      {showSettlement && showResult === "LOSE" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center border border-border shadow-2xl">
            <motion.div initial={{ x: -10 }} animate={{ x: [0, -10, 10, -5, 5, 0] }} transition={{ duration: 0.5 }}
              className="w-20 h-20 rounded-full bg-down/10 flex items-center justify-center mx-auto mb-4 glow-down">
              <XCircle className="w-10 h-10 text-down" />
            </motion.div>
            <div className="text-2xl font-bold text-down mb-1">Streak Broken</div>
            <div className="text-sm text-text-dim mb-6">-{(currentTrade?.stake || 0).toFixed(1)} tUSDC lost</div>
            <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-border">
              <div className="text-sm text-text-dim">Streak reset to <span className="font-bold text-text">1x</span></div>
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
