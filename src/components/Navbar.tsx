"use client";

import Link from "next/link";
import { useStreakStore } from "@/lib/store";
import { Flame, Trophy, BarChart3, Wallet } from "lucide-react";

export default function Navbar() {
  const { streak, totalPnL } = useStreakStore();

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fire-1 to-fire-3 flex items-center justify-center shadow-lg group-hover:shadow-fire-1/30 transition-shadow">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-text hidden sm:block">
            Streak<span className="text-gradient">Trader</span>
          </span>
        </Link>

        {/* Center: Streak */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-text-dim hover:text-text transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Trade</span>
          </Link>
          <Link
            href="/history"
            className="flex items-center gap-2 text-sm text-text-dim hover:text-text transition-colors"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </Link>
        </div>

        {/* Right: Stats + Wallet */}
        <div className="flex items-center gap-4">
          {/* Streak Badge */}
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-fire-1/10 border border-fire-1/20 animate-streak-glow">
              <Flame className="w-3.5 h-3.5 text-fire-1 animate-fire" />
              <span className="text-sm font-bold font-mono text-fire-1">
                {streak}x
              </span>
            </div>
          )}

          {/* P&L */}
          <div
            className={`text-sm font-mono font-semibold ${
              totalPnL >= 0 ? "text-up" : "text-down"
            }`}
          >
            {totalPnL >= 0 ? "+" : ""}
            {totalPnL.toFixed(1)}
          </div>

          {/* Wallet Button */}
          <button className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">Connect</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
