"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Share2, Download, X } from "lucide-react";
import { useStreakStore } from "@/lib/store";

interface StreakCardProps {
  onClose: () => void;
}

export default function StreakCard({ onClose }: StreakCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { streak, bestStreak, totalPnL, wins, totalTrades } = useStreakStore();
  const [downloaded, setDownloaded] = useState(false);

  const generateCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 600;
    const h = 315;
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.scale(2, 2);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#0f172a");
    bg.addColorStop(0.5, "#1e293b");
    bg.addColorStop(1, "#0f172a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle grid pattern
    ctx.strokeStyle = "rgba(37, 99, 235, 0.05)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Glow orb
    const glow = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, 200);
    glow.addColorStop(0, "rgba(37, 99, 235, 0.15)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Streak number — big and bold
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 96px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${streak}x`, w / 2, 130);

    // Streak label
    ctx.fillStyle = "#2563eb";
    ctx.font = "bold 18px Inter, system-ui, sans-serif";
    ctx.fillText("STREAK", w / 2, 155);

    // Divider
    ctx.strokeStyle = "rgba(37, 99, 235, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.3, 175);
    ctx.lineTo(w * 0.7, 175);
    ctx.stroke();

    // Stats row
    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";

    ctx.fillText(`Win Rate: ${totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0}%`, w * 0.25, 205);
    ctx.fillText(`Best: ${bestStreak}x`, w * 0.5, 205);
    ctx.fillText(`P&L: ${totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(1)} tUSDC`, w * 0.75, 205);

    // Bottom text
    ctx.fillStyle = "#64748b";
    ctx.font = "11px Inter, system-ui, sans-serif";
    ctx.fillText("StreakTrader — streaktrader.sithunyein.com", w / 2, h - 20);

    // Fire emoji
    ctx.font = "32px serif";
    ctx.fillText("🔥", w / 2, 80);
  }, [streak, bestStreak, totalPnL, wins, totalTrades]);

  const handleDownload = () => {
    generateCard();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `streaktrader-${streak}x-streak.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setDownloaded(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl border border-border">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
          <X className="w-4 h-4 text-text-dim" />
        </button>

        <h3 className="text-lg font-bold text-text mb-4">Share Your Streak</h3>

        {/* Preview */}
        <div className="rounded-xl overflow-hidden border border-border mb-4">
          <canvas ref={canvasRef} className="w-full" style={{ aspectRatio: "600/315" }} />
        </div>

        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="flex-1 btn-primary py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            {downloaded ? "Downloaded!" : "Download Image"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => {
              generateCard();
              const canvas = canvasRef.current;
              if (canvas) {
                canvas.toBlob((blob) => {
                  if (blob && navigator.share) {
                    const file = new File([blob], `streak-${streak}x.png`, { type: "image/png" });
                    navigator.share({ title: `${streak}x Streak on StreakTrader!`, files: [file] });
                  }
                });
              }
            }}
            className="px-4 py-3 rounded-xl border border-border hover:border-accent/30 transition-colors">
            <Share2 className="w-4 h-4 text-text-dim" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
