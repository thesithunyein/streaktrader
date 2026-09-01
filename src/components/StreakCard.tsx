"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useStreakStore } from "@/lib/store";
import { X, Download, Share2, Copy, Flame, Zap, Target, TrendingUp, Award } from "lucide-react";
import { toPng } from "html-to-image";

interface StreakCardProps {
  onClose: () => void;
}

export default function StreakCard({ onClose }: StreakCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { streak, bestStreak, totalPnL, wins, totalTrades, predictionScore, getWinRate } = useStreakStore();
  const winRate = getWinRate();

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Elite";
    if (score >= 60) return "Strong";
    if (score >= 40) return "Rising";
    if (score > 0) return "Beginner";
    return "New";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#2563eb";
    if (score >= 60) return "#16a34a";
    if (score >= 40) return "#f59e0b";
    return "#64748b";
  };

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        width: 1080,
        height: 1080,
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
      className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 max-w-lg w-full mx-4">

        {/* The Shareable Card */}
        <div ref={cardRef} className="w-full aspect-square rounded-3xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1e40af 100%)",
          }}>

          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border border-white/30 rounded-full" />
            <div className="absolute bottom-20 right-10 w-48 h-48 border border-white/20 rounded-full" />
            <div className="absolute top-1/2 left-1/3 w-24 h-24 border border-white/20 rounded-full" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-10 h-full flex flex-col justify-between">
            {/* Top */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
                <div>
                  <div className="text-white/60 text-sm font-medium">STREAKTRADER</div>
                  <div className="text-white/40 text-xs">streaktrader.sithunyein.com</div>
                </div>
              </div>
            </div>

            {/* Center - Main stat */}
            <div className="text-center">
              <div className="text-8xl font-black text-white mb-2" style={{ textShadow: "0 0 60px rgba(255,255,255,0.3)" }}>
                {streak}x
              </div>
              <div className="text-2xl font-bold text-white/90 mb-1">STREAK</div>
              {streak >= 3 && (
                <div className="text-lg text-white/60">
                  {streak >= 10 ? "🏆 LEGENDARY" : streak >= 7 ? "⚡ UNSTOPPABLE" : streak >= 5 ? "🔥 ON FIRE" : "✨ RISING"}
                </div>
              )}
            </div>

            {/* Bottom stats */}
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-white/60" />
                    <span className="text-white/60 text-xs">WIN RATE</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{winRate}%</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-white/60" />
                    <span className="text-white/60 text-xs">EARNED</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(1)}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-white/60" />
                    <span className="text-white/60 text-xs">SCORE</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{predictionScore}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-white/60" />
                    <span className="text-white/60 text-xs">BEST</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{bestStreak}x</div>
                </div>
              </div>

              {/* Challenge text */}
              <div className="text-center">
                <div className="text-white/80 text-lg font-bold">Can you beat my streak?</div>
                <div className="text-white/40 text-sm mt-1">Trade BTC & ETH predictions on-chain</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="flex-1 py-3 rounded-xl bg-white text-text font-bold text-sm flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleShareTwitter}
            className="flex-1 py-3 rounded-xl bg-[#1da1f2] text-white font-bold text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> Share
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleCopyLink}
            className="py-3 px-4 rounded-xl bg-white/10 text-white font-bold text-sm flex items-center justify-center gap-2">
            <Copy className="w-4 h-4" />
          </motion.button>
        </div>

        <button onClick={onClose} className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
          <X className="w-4 h-4 text-white" />
        </button>
      </motion.div>
    </motion.div>
  );
}
