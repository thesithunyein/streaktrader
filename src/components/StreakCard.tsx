"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useStreakStore } from "@/lib/store";
import { X, Download, Copy, Flame, Target, TrendingUp, Award } from "lucide-react";
import { toPng } from "html-to-image";

interface StreakCardProps {
  onClose: () => void;
}

export default function StreakCard({ onClose }: StreakCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { streak, bestStreak, totalPnL, wins, totalTrades, predictionScore, getWinRate } = useStreakStore();
  const winRate = getWinRate();

  const getStreakTitle = (s: number) => {
    if (s >= 10) return "🏆 LEGENDARY";
    if (s >= 7) return "⚡ UNSTOPPABLE";
    if (s >= 5) return "🔥 ON FIRE";
    if (s >= 3) return "✨ RISING";
    return "📈 TRADING";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "ELITE";
    if (score >= 60) return "STRONG";
    if (score >= 40) return "RISING";
    return "BEGINNER";
  };

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        width: 1200,
        height: 675,
      });
      const link = document.createElement("a");
      link.download = `streaktrader-${streak}x-streak.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    }
  }, [streak]);

  const handleShareTwitter = useCallback(() => {
    const text = encodeURIComponent(
      `🔥 I just hit a ${streak}x streak on StreakTrader!\n\n` +
      `📊 Win Rate: ${winRate}%\n` +
      `💰 Earned: ${totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(1)} tUSDC\n` +
      `⭐ Prediction Score: ${predictionScore}/100\n\n` +
      `Can you beat my streak? 👇\n` +
      `https://streaktrader.sithunyein.com`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  }, [streak, winRate, totalPnL, predictionScore]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText("https://streaktrader.sithunyein.com");
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 w-full" style={{ maxWidth: "540px" }}>

        {/* Close button */}
        <button onClick={onClose}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors z-30 shadow-md">
          <X className="w-4 h-4 text-slate-600" />
        </button>

        {/* Scaled card wrapper */}
        <div className="w-full rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10 border border-slate-200"
          style={{ paddingBottom: "56.25%", position: "relative" }}>
          <div ref={cardRef}
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{
              width: "1200px",
              height: "675px",
              transform: "scale(0.44)",
              transformOrigin: "top left",
              background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 30%, #2563eb 70%, #1e40af 100%)",
            }}>

            {/* Background pattern */}
            <div className="absolute inset-0">
              <div className="absolute top-[-100px] right-[-50px] w-[400px] h-[400px] rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)" }} />
              <div className="absolute bottom-[-80px] left-[-30px] w-[300px] h-[300px] rounded-full opacity-15"
                style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }} />
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
              <div className="absolute top-16 left-16 w-20 h-20 border border-white/10 rounded-full" />
              <div className="absolute bottom-24 right-20 w-32 h-32 border border-white/8 rounded-full" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-between p-12">

              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-black/20 border border-white/20">
                    <img src="/logo.png" alt="StreakTrader" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-white/90 text-xl font-bold tracking-tight">StreakTrader</div>
                    <div className="text-white/40 text-sm">streaktrader.sithunyein.com</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/30 text-xs uppercase tracking-widest">Built on Somnia</div>
                  <div className="text-white/50 text-xs">Powered by DreamDEX</div>
                </div>
              </div>

              {/* Center */}
              <div className="flex items-center justify-center gap-12">
                <div className="text-center">
                  <div className="text-[120px] font-black text-white leading-none"
                    style={{ textShadow: "0 0 80px rgba(96, 165, 250, 0.4), 0 0 120px rgba(96, 165, 250, 0.2)" }}>
                    {streak}x
                  </div>
                  <div className="text-white/70 text-2xl font-bold tracking-wider mt-2">STREAK</div>
                  <div className="text-white/40 text-lg mt-1">{getStreakTitle(streak)}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-[140px] border border-white/10">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Target className="w-3.5 h-3.5 text-white/50" />
                      <span className="text-white/50 text-[10px] uppercase tracking-wider">Win Rate</span>
                    </div>
                    <div className="text-2xl font-black text-white">{winRate}%</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-[140px] border border-white/10">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-white/50" />
                      <span className="text-white/50 text-[10px] uppercase tracking-wider">Earned</span>
                    </div>
                    <div className="text-2xl font-black text-white">
                      {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(1)}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-[140px] border border-white/10">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Award className="w-3.5 h-3.5 text-white/50" />
                      <span className="text-white/50 text-[10px] uppercase tracking-wider">Score</span>
                    </div>
                    <div className="text-2xl font-black text-white">{predictionScore}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-[140px] border border-white/10">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Flame className="w-3.5 h-3.5 text-white/50" />
                      <span className="text-white/50 text-[10px] uppercase tracking-wider">Best</span>
                    </div>
                    <div className="text-2xl font-black text-white">{bestStreak}x</div>
                  </div>
                </div>
              </div>

              {/* Bottom */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-white/90 text-2xl font-bold">Can you beat my streak?</div>
                  <div className="text-white/40 text-sm mt-1">Predict BTC & ETH on-chain · Zero fees</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                  <div className="text-white/50 text-[10px] uppercase tracking-wider">Prediction Score</div>
                  <div className="text-white font-bold text-lg">{predictionScore}/100 · {getScoreLabel(predictionScore)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="flex-1 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-sm flex items-center justify-center gap-2 shadow-md border border-slate-200">
            <Download className="w-4 h-4" /> Download PNG
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleShareTwitter}
            className="flex-1 py-2.5 rounded-xl bg-[#1da1f2] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> Share to X
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleCopyLink}
            className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm flex items-center justify-center hover:bg-slate-200 transition-colors border border-slate-200">
            <Copy className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
