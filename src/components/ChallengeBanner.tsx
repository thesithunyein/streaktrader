"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useStreakStore } from "@/lib/store";
import { Swords, Clock, CheckCircle, XCircle, Trophy, ArrowRight } from "lucide-react";

interface ChallengeBannerProps {
  onAcceptChallenge?: (challengeId: string) => void;
}

export default function ChallengeBanner({ onAcceptChallenge }: ChallengeBannerProps) {
  const { challenges } = useStreakStore();

  const pendingChallenges = challenges.filter((c) => c.status === "pending");
  const recentSettled = challenges.filter((c) => c.status === "settled").slice(0, 3);

  if (pendingChallenges.length === 0 && recentSettled.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {/* Pending challenges */}
      <AnimatePresence>
        {pendingChallenges.map((challenge) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-accent/5 border border-accent/15 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Swords className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-text">Active Challenge</span>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-accent/10">
                    <Clock className="w-3 h-3 text-accent" />
                    <span className="text-[9px] font-bold text-accent">PENDING</span>
                  </div>
                </div>
                <div className="text-xs text-text-dim truncate">
                  {challenge.marketSymbol} · You picked {challenge.creatorSide} · {challenge.creatorStake} tUSDC
                </div>
              </div>
              <div className="text-xs font-bold text-accent">
                ⚔️
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Recent settled challenges */}
      {recentSettled.length > 0 && (
        <div className="space-y-2">
          {recentSettled.map((challenge) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-50 border border-border rounded-xl p-3"
            >
              <div className="flex items-center gap-2">
                {challenge.result === "CREATOR_WON" ? (
                  <CheckCircle className="w-4 h-4 text-up shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-down shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-text-dim truncate">
                    {challenge.marketSymbol} · {challenge.creatorSide}
                  </div>
                </div>
                <div className={`text-xs font-bold ${challenge.result === "CREATOR_WON" ? "text-up" : "text-down"}`}>
                  {challenge.result === "CREATOR_WON" ? "WON" : "LOST"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
