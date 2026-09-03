"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStreakStore } from "@/lib/store";
import { useTrade } from "@/components/TradeProvider";
import { ArrowUp, ArrowDown, X, Zap, AlertTriangle, Loader2, Shield, ShieldCheck, Swords, RefreshCw } from "lucide-react";

interface TradePanelProps {
  market: { symbol: string; downSymbol: string; underlying: string; window: string; upProbability: number; poolAddress?: string };
  onClose: () => void;
  onChallenge?: () => void;
}

export default function TradePanel({ market, onClose, onChallenge }: TradePanelProps) {
  const [side, setSide] = useState<"UP" | "DOWN">("UP");
  const [stake, setStake] = useState(10);
  const [placing, setPlacing] = useState(false);
  const [placingStep, setPlacingStep] = useState("");
  const [tradeError, setTradeError] = useState<string | null>(null);
  const { placeTrade, streak, getMultiplier, shields, activeShield, activateShield, deactivateShield } = useStreakStore();
  const { address, placeOrder } = useTrade();
  const multiplier = getMultiplier();
  const potentialPayout = stake * multiplier;
  const presets = [1, 5, 10, 25, 50];

  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // Check network on mount, when address changes, and on chain change
  useEffect(() => {
    const checkNetwork = async () => {
      if (typeof window === "undefined" || !window.ethereum) return;
      try {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        const wrong = parseInt(chainId, 16) !== 50312;
        setIsWrongNetwork(wrong);
        if (!wrong) setTradeError(null);
      } catch {}
    };
    checkNetwork();
    // Also check every 2 seconds to catch any changes
    const interval = setInterval(checkNetwork, 2000);
    if (window.ethereum) {
      window.ethereum.on("chainChanged", checkNetwork);
      return () => {
        window.ethereum?.removeListener("chainChanged", checkNetwork);
        clearInterval(interval);
      };
    }
    return () => clearInterval(interval);
  }, [address]);

  const handlePlaceTrade = async () => {
    if (!address) {
      setTradeError("Connect your wallet first");
      return;
    }

    // Check network first
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        if (parseInt(chainId, 16) !== 50312) {
          setIsWrongNetwork(true);
          setTradeError("Wrong network. Click Switch to change.");
          return;
        }
      } catch {}
    }

    setPlacing(true);
    setTradeError(null);
    setIsWrongNetwork(false);
    setPlacingStep("Fetching order book...");

    try {
      // UP = buy YES token, DOWN = buy NO token
      // Strip #YES/#NO suffix — SDK expects base market symbol
      const baseSymbol = market.symbol.replace(/#(YES|NO)$/i, "");
      const orderSymbol = side === "UP" ? baseSymbol : baseSymbol;

      // Small delay so user sees the step message
      await new Promise(r => setTimeout(r, 500));
      setPlacingStep("Confirm in MetaMask...");

      // placeOrder now handles order book fetching + crossing the touch automatically
      await placeOrder(
        orderSymbol,
        "buy",
        stake,
        undefined, // let useExchange fetch book and set price
        "IOC" // immediate or cancel — SDK recommended
      );

      // If order succeeds, create the local streak trade
      placeTrade({
        marketId: market.symbol,
        symbol: market.symbol,
        side,
        stake,
      });

      onClose();
    } catch (e: any) {
      const msg = e?.message || "Trade failed";
      if (msg.includes("0xd48c4403") || msg.includes("Custom error")) {
        setTradeError("Market not accepting trades right now. Try another market or wait for the next window.");
      } else if (msg.includes("empty") || msg.includes("no liquidity")) {
        setTradeError("Order book empty. Try a different market or wait for liquidity.");
      } else if (msg.includes("balance") || msg.includes("insufficient")) {
        setTradeError("Insufficient balance. Get STT from the faucet.");
      } else if (msg.includes("chain") || msg.includes("network")) {
        setTradeError("Wrong network. Switch MetaMask to Shannon Testnet.");
      } else if (msg.includes("user rejected")) {
        setTradeError("Transaction cancelled.");
      } else {
        setTradeError(msg.slice(0, 120));
      }
    } finally {
      setPlacing(false);
      setPlacingStep("");
    }
  };

  const switchNetwork = async () => {
    if (typeof window === "undefined" || !window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xc488" }], // 50312 in hex
      });
    } catch {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xc488",
              chainName: "Somnia Shannon Testnet",
              nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
              rpcUrls: [
                "https://dream-rpc.somnia.network",
                "https://api.infra.testnet.somnia.network",
              ],
              blockExplorerUrls: ["https://shannon-explorer.somnia.network"],
            },
          ],
        });
      } catch {}
    }
    // Re-check network after switch attempt
    setTimeout(async () => {
      try {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        const wrong = parseInt(chainId, 16) !== 50312;
        setIsWrongNetwork(wrong);
        if (!wrong) setTradeError(null);
      } catch {}
    }, 1500);
  };

  const toggleShield = () => {
    if (activeShield) {
      deactivateShield();
    } else if (shields > 0) {
      activateShield();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full sm:w-[420px] max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl p-6 border border-slate-200 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <X className="w-4 h-4 text-slate-500" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-slate-500">{market.underlying}</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-sm text-slate-500">{market.window}</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{market.symbol}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSide("UP")}
            className={`py-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-2 transition-all ${side === "UP" ? "bg-up/10 border-2 border-up/30 text-up glow-up" : "bg-slate-50 border border-slate-200 text-slate-500 hover:border-up/20"}`}>
            <ArrowUp className="w-6 h-6" /><span>UP</span>
            <span className="text-xs opacity-70">{market.upProbability.toFixed(0)}%</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSide("DOWN")}
            className={`py-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-2 transition-all ${side === "DOWN" ? "bg-down/10 border-2 border-down/30 text-down glow-down" : "bg-slate-50 border border-slate-200 text-slate-500 hover:border-down/20"}`}>
            <ArrowDown className="w-6 h-6" /><span>DOWN</span>
            <span className="text-xs opacity-70">{(100 - market.upProbability).toFixed(0)}%</span>
          </motion.button>
        </div>

        {/* Streak + Shield */}
        <AnimatePresence>
          {streak > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-3 rounded-xl bg-accent/5 border border-accent/15 flex items-center gap-3 overflow-hidden">
              <Zap className="w-5 h-5 text-accent" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-accent">{streak}x streak active</div>
                <div className="text-xs text-slate-500">Multiplier applied to payout</div>
              </div>
              <div className="text-lg font-bold font-mono text-accent">{multiplier}x</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shield Toggle */}
        {shields > 0 && streak > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
            <button
              onClick={toggleShield}
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                activeShield
                  ? "bg-accent/10 border-2 border-accent/30"
                  : "bg-slate-50 border border-slate-200 hover:border-accent/20"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeShield ? "bg-accent/20" : "bg-slate-100"}`}>
                {activeShield ? (
                  <ShieldCheck className="w-5 h-5 text-accent" />
                ) : (
                  <Shield className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className={`text-sm font-semibold ${activeShield ? "text-accent" : "text-slate-900"}`}>
                  {activeShield ? "Shield Active" : "Activate Shield"}
                </div>
                <div className="text-xs text-slate-500">
                  {activeShield
                    ? "This trade is protected from streak loss"
                    : `${shields} shield${shields > 1 ? "s" : ""} remaining — protects your streak`}
                </div>
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-lg ${activeShield ? "bg-accent/20 text-accent" : "bg-slate-100 text-slate-500"}`}>
                {shields}x
              </div>
            </button>
          </motion.div>
        )}

        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Stake (tUSDC)</label>
          <div className="relative">
            <input type="number" value={stake} onChange={(e) => setStake(Math.max(0.1, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all" min="0.1" step="0.1" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">tUSDC</span>
          </div>
          <div className="flex gap-2 mt-2">
            {presets.map((p) => (
              <motion.button key={p} whileTap={{ scale: 0.95 }} onClick={() => setStake(p)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stake === p ? "bg-accent/10 text-accent border border-accent/20" : "bg-slate-50 text-slate-500 border border-slate-200 hover:border-accent/20"}`}>
                {p}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">If you WIN</span>
            <span className="text-sm font-bold text-up">+{potentialPayout.toFixed(1)} tUSDC</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">If you LOSE</span>
            <span className={`text-sm font-bold ${activeShield ? "text-accent line-through" : "text-down"}`}>
              {activeShield ? "Protected by Shield" : `-${stake.toFixed(1)} tUSDC`}
            </span>
          </div>
          {streak > 0 && !activeShield && (
            <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-down" />
              <span className="text-xs text-down">Losing resets your {streak}x streak</span>
            </div>
          )}
          {activeShield && (
            <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-accent" />
              <span className="text-xs text-accent">Shield will protect your streak if you lose</span>
            </div>
          )}
        </div>

        {(tradeError || isWrongNetwork) && (
          <div className="mb-4 p-3 rounded-xl bg-down/10 border border-down/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-down">{tradeError || "Wrong network"}</span>
              <button onClick={switchNetwork} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-down/20 hover:bg-down/30 text-down text-xs font-semibold">
                <RefreshCw className="w-3 h-3" /> Switch
              </button>
            </div>
          </div>
        )}

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handlePlaceTrade}
          disabled={placing || !address}
          className={`w-full py-4 rounded-2xl text-base font-bold text-white transition-all flex items-center justify-center gap-2 ${!address ? "opacity-50 cursor-not-allowed bg-slate-300" : side === "UP" ? "btn-up" : "btn-down"}`}>
          {placing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {placingStep || "Confirm in MetaMask..."}
            </>
          ) : !address ? (
            "Connect Wallet to Trade"
          ) : (
            `Place Trade — ${stake} tUSDC ${side}`
          )}
        </motion.button>

        {/* Challenge Friend button */}
        {onChallenge && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onChallenge}
            className="w-full mt-3 py-3 rounded-xl text-sm font-bold text-accent bg-accent/5 border border-accent/15 flex items-center justify-center gap-2 hover:bg-accent/10 transition-colors">
            <Swords className="w-4 h-4" /> Challenge a Friend
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
