"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Trophy, BarChart3, Wallet, LogOut, Loader2, History } from "lucide-react";

export default function Navbar() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("streaktrader");
      if (saved) {
        const data = JSON.parse(saved);
        setStreak(data.streak || 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window === "undefined" || !window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts && accounts.length > 0) setAddress(accounts[0]);
      } catch {}
    };
    checkWallet();
  }, []);

  const connect = async () => {
    if (typeof window === "undefined" || !window.ethereum) return;
    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAddress(accounts[0]);
    } catch {}
    setConnecting(false);
  };

  const disconnect = () => { setAddress(null); };

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group" style={{ textDecoration: "none" }}>
          <div className="w-9 h-9 rounded-xl overflow-hidden relative shadow-md group-hover:shadow-lg transition-shadow">
            <Image src="/logo.png" alt="StreakTrader" fill className="object-cover" />
          </div>
          <span className="text-lg font-bold text-text hidden sm:block">
            Streak<span className="text-gradient">Trader</span>
          </span>
        </a>

        {/* Navigation Links — plain <a> tags, always work */}
        <div className="flex items-center gap-1 sm:gap-6">
          <a
            href="/app"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-text-dim hover:text-accent hover:bg-accent/5 transition-all"
            style={{ textDecoration: "none" }}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Trade</span>
          </a>
          <a
            href="/leaderboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-text-dim hover:text-accent hover:bg-accent/5 transition-all"
            style={{ textDecoration: "none" }}
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </a>
          <a
            href="/history"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-text-dim hover:text-accent hover:bg-accent/5 transition-all"
            style={{ textDecoration: "none" }}
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </a>
        </div>

        {/* Wallet */}
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-bold font-mono text-accent">{streak}x</span>
            </div>
          )}

          {address ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-border">
                <div className="w-2 h-2 rounded-full bg-up" />
                <span className="text-xs font-mono text-text-dim hidden sm:inline">{shortAddress}</span>
              </div>
              <button onClick={disconnect} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-text-dim hover:text-down" title="Disconnect">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-50"
            >
              {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
              <span className="hidden sm:inline">{connecting ? "Connecting..." : "Connect Wallet"}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
