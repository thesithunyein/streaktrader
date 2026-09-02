"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Trophy, BarChart3, Wallet, LogOut, Loader2, History, AlertTriangle } from "lucide-react";

const SHANNON_CHAIN_ID = 50312;
const SHANNON_CHAIN_HEX = `0x${SHANNON_CHAIN_ID.toString(16)}`;

function NavLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(window.location.pathname === href);
  }, [href]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = href;
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? "text-accent bg-accent/10"
          : "text-text-dim hover:text-accent hover:bg-accent/5"
      }`}
      style={{ textDecoration: "none", cursor: "pointer" }}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </a>
  );
}

export default function Navbar() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [streak, setStreak] = useState(0);
  const [wrongNetwork, setWrongNetwork] = useState(false);

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
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          // Check chain
          const chainId = await window.ethereum.request({ method: "eth_chainId" });
          if (parseInt(chainId, 16) !== SHANNON_CHAIN_ID) {
            setWrongNetwork(true);
          } else {
            setWrongNetwork(false);
          }
        }
      } catch {}
    };
    checkWallet();

    // Listen for chain changes
    if (window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        if (parseInt(chainId, 16) !== SHANNON_CHAIN_ID) {
          setWrongNetwork(true);
        } else {
          setWrongNetwork(false);
        }
      };
      window.ethereum.on("chainChanged", handleChainChanged);
      return () => window.ethereum?.removeListener("chainChanged", handleChainChanged);
    }
  }, []);

  const connect = async () => {
    if (typeof window === "undefined" || !window.ethereum) return;
    setConnecting(true);
    setWrongNetwork(false);
    try {
      // Request accounts (shows MetaMask popup)
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      // Check chain and switch if needed
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (parseInt(chainId, 16) !== SHANNON_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SHANNON_CHAIN_HEX }],
          });
        } catch {
          // Chain not in MetaMask, add it
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SHANNON_CHAIN_HEX,
                chainName: "Somnia Shannon Testnet",
                nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
                rpcUrls: ["https://api.infra.testnet.somnia.network"],
                blockExplorerUrls: ["https://shannon-explorer.somnia.network"],
              },
            ],
          });
        }
      }

      setAddress(accounts[0]);
      setWrongNetwork(false);
    } catch (e: any) {
      console.error("Connect failed:", e);
    }
    setConnecting(false);
  };

  const disconnect = async () => {
    // Revoke permissions so MetaMask shows popup next time
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] });
      } catch {}
    }
    setAddress(null);
    setWrongNetwork(false);
  };

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;

  return (
    <nav className="sticky top-0 z-50 border-b border-border" style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = "/"; }} style={{ textDecoration: "none", cursor: "pointer" }} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden relative shadow-md">
            <Image src="/logo.png" alt="StreakTrader" fill className="object-cover" />
          </div>
          <span className="text-lg font-bold text-text hidden sm:block">
            Streak<span style={{ color: "#2563eb" }}>Trader</span>
          </span>
        </a>

        {/* Navigation Links */}
        <div className="flex items-center gap-1 sm:gap-6">
          <NavLink href="/app" icon={BarChart3} label="Trade" />
          <NavLink href="/leaderboard" icon={Trophy} label="Leaderboard" />
          <NavLink href="/history" icon={History} label="History" />
        </div>

        {/* Wallet */}
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#2563eb" }} />
              <span className="text-sm font-bold font-mono" style={{ color: "#2563eb" }}>{streak}x</span>
            </div>
          )}

          {address ? (
            <div className="flex items-center gap-2">
              {wrongNetwork ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                  <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#dc2626" }} />
                  <span className="text-xs font-semibold hidden sm:inline" style={{ color: "#dc2626" }}>Wrong Network</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: "#16a34a" }} />
                  <span className="text-xs font-mono hidden sm:inline" style={{ color: "#64748b" }}>{shortAddress}</span>
                </div>
              )}
              <button onClick={disconnect} className="p-2 rounded-xl transition-colors" style={{ color: "#64748b" }} title="Disconnect">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", opacity: connecting ? 0.5 : 1 }}
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
