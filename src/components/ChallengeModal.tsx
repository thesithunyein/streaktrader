"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStreakStore } from "@/lib/store";
import { X, Swords, ArrowUp, ArrowDown, Copy, Check, Share2, Link } from "lucide-react";

interface ChallengeModalProps {
  market: { symbol: string; downSymbol: string; underlying: string; window: string; upProbability: number };
  onClose: () => void;
}

export default function ChallengeModal({ market, onClose }: ChallengeModalProps) {
  const [side, setSide] = useState<"UP" | "DOWN">("UP");
  const [stake, setStake] = useState(10);
  const [copied, setCopied] = useState(false);
  const [challengeCreated, setChallengeCreated] = useState(false);
  const [challengeId, setChallengeId] = useState<string>("");
  const { createChallenge } = useStreakStore();
  const presets = [5, 10, 25, 50];

  const handleCreateChallenge = useCallback(() => {
    const id = createChallenge(market.symbol, side, stake);
    setChallengeId(id);
    setChallengeCreated(true);
  }, [market.symbol, side, stake, createChallenge]);

  const getChallengeLink = useCallback(() => {
    return `https://streaktrader.sithunyein.com/challenge/${challengeId}`;
  }, [challengeId]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(getChallengeLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [getChallengeLink]);

  const handleShareTwitter = useCallback(() => {
    const text = encodeURIComponent(
      `⚔️ I challenge you to a prediction battle!\n\n` +
      `📊 Market: ${market.underlying} ${market.window}\n` +
      `🎯 I picked: ${side}\n` +
      `💰 Stake: ${stake} tUSDC\n\n` +
      `Can you beat me? 👇\n` +
      getChallengeLink()
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  }, [market, side, stake, getChallengeLink]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 bg-white rounded-3xl p-6 max-w-md w-full mx-4 border border-border shadow-2xl">

        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <X className="w-4 h-4 text-text-dim" />
        </button>

        {!challengeCreated ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Swords className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text">Create Challenge</h3>
                <p className="text-sm text-text-dim">Challenge a friend to predict the same market</p>
              </div>
            </div>

            {/* Market info */}
            <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-text">{market.underlying}</span>
                <span className="text-xs text-text-muted">·</span>
                <span className="text-sm text-text-dim">{market.window}</span>
              </div>
              <div className="text-xs text-text-muted">{market.symbol}</div>
            </div>

            {/* Side selection */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSide("UP")}
                className={`py-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-2 transition-all ${side === "UP" ? "bg-up/10 border-2 border-up/30 text-up glow-up" : "bg-slate-50 border border-border text-text-dim hover:border-up/20"}`}>
                <ArrowUp className="w-6 h-6" /><span>UP</span>
                <span className="text-xs opacity-70">{market.upProbability.toFixed(0)}%</span>
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSide("DOWN")}
                className={`py-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-2 transition-all ${side === "DOWN" ? "bg-down/10 border-2 border-down/30 text-down glow-down" : "bg-slate-50 border border-border text-text-dim hover:border-down/20"}`}>
                <ArrowDown className="w-6 h-6" /><span>DOWN</span>
                <span className="text-xs opacity-70">{(100 - market.upProbability).toFixed(0)}%</span>
              </motion.button>
            </div>

            {/* Stake */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-2 block">Stake (tUSDC)</label>
              <div className="flex gap-2">
                {presets.map((p) => (
                  <motion.button key={p} whileTap={{ scale: 0.95 }} onClick={() => setStake(p)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${stake === p ? "bg-accent/10 text-accent border border-accent/20" : "bg-slate-50 text-text-dim border border-border hover:border-accent/20"}`}>
                    {p}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Challenge preview */}
            <div className="bg-accent/5 rounded-xl p-4 mb-5 border border-accent/15">
              <div className="flex items-center gap-2 mb-2">
                <Swords className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-accent">Challenge Summary</span>
              </div>
              <div className="text-sm text-text-dim">
                You pick <span className={`font-bold ${side === "UP" ? "text-up" : "text-down"}`}>{side}</span> on {market.underlying} {market.window}
              </div>
              <div className="text-sm text-text-dim">
                Opposite side picks <span className={`font-bold ${side === "UP" ? "text-down" : "text-up"}`}>{side === "UP" ? "DOWN" : "UP"}</span>
              </div>
              <div className="text-sm text-text-dim mt-1">
                Winner takes bragging rights + streak points
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleCreateChallenge}
              className="w-full btn-primary py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2">
              <Swords className="w-4 h-4" /> Create Challenge
            </motion.button>
          </>
        ) : (
          <>
            {/* Challenge Created */}
            <div className="text-center mb-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }}
                className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Swords className="w-8 h-8 text-accent" />
              </motion.div>
              <h3 className="text-lg font-bold text-text mb-1">Challenge Created!</h3>
              <p className="text-sm text-text-dim">Share this link with your opponent</p>
            </div>

            {/* Challenge link */}
            <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-border">
              <div className="text-xs text-text-dim mb-2">Challenge Link</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 text-sm font-mono text-text truncate bg-white rounded-lg px-3 py-2 border border-border">
                  {getChallengeLink()}
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleCopyLink}
                  className={`p-2 rounded-lg transition-colors ${copied ? "bg-up/10 text-up" : "bg-slate-100 text-text-dim hover:bg-slate-200"}`}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </motion.button>
              </div>
            </div>

            {/* Challenge details */}
            <div className="bg-accent/5 rounded-xl p-4 mb-5 border border-accent/15">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-dim">Your pick</span>
                <span className={`text-sm font-bold ${side === "UP" ? "text-up" : "text-down"}`}>{side}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-dim">Opponent picks</span>
                <span className={`text-sm font-bold ${side === "UP" ? "text-down" : "text-up"}`}>{side === "UP" ? "DOWN" : "UP"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-dim">Stake</span>
                <span className="text-sm font-bold text-text">{stake} tUSDC each</span>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleShareTwitter}
                className="flex-1 py-3 rounded-xl bg-[#1da1f2] text-white font-bold text-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Share
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleCopyLink}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-text font-bold text-sm flex items-center justify-center gap-2">
                <Link className="w-4 h-4" /> Copy Link
              </motion.button>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full mt-3 py-3 rounded-xl text-sm font-bold text-text-dim hover:text-text transition-colors">
              Done
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
