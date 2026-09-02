"use client";

import Link from "next/link";
import Image from "next/image";
import { useStreakStore } from "@/lib/store";
import { useTrade } from "@/components/TradeProvider";
import { Trophy, BarChart3, Wallet, LogOut, Loader2 } from "lucide-react";

export default function Navbar() {
  const { streak, totalPnL } = useStreakStore();
  const { address, connecting, connect, disconnect, balance } = useTrade();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden relative shadow-md group-hover:shadow-lg transition-shadow">
            <Image src="/logo.png" alt="StreakTrader" fill className="object-cover" />
          </div>
          <span className="text-lg font-bold text-text hidden sm:block">
            Streak<span className="text-gradient">Trader</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-6">
          <Link
            href="/app"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-text-dim hover:text-accent hover:bg-accent/5 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Trade</span>
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-text-dim hover:text-accent hover:bg-accent/5 transition-all"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </Link>
          <Link
            href="/history"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-text-dim hover:text-accent hover:bg-accent/5 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 animate-streak-glow">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-bold font-mono text-accent">
                {streak}x
              </span>
            </div>
          )}

          {address && (
            <div className="text-sm font-mono font-semibold text-up hidden sm:block">
              {balance > 0 ? `${balance.toFixed(2)} tUSDC` : "0.00 tUSDC"}
            </div>
          )}

          {address ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-border">
                <div className="w-2 h-2 rounded-full bg-up" />
                <span className="text-xs font-mono text-text-dim hidden sm:inline">
                  {shortAddress}
                </span>
              </div>
              <button
                onClick={disconnect}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-text-dim hover:text-down"
                title="Disconnect"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-50"
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {connecting ? "Connecting..." : "Connect Wallet"}
              </span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
