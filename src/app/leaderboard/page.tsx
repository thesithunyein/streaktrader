"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Trophy,
  Flame,
  ArrowLeft,
  Crown,
  Medal,
  Award,
  RefreshCw,
  ExternalLink,
  Users,
  TrendingUp,
} from "lucide-react";

interface LeaderboardEntry {
  address: string;
  streak: number;
  bestStreak: number;
  totalTrades: number;
  wins: number;
  winRate: number;
  score: number;
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-accent"
      : score >= 60
        ? "bg-up"
        : score >= 40
          ? "bg-yellow-500"
          : "bg-slate-300";
  return (
    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, delay: 0.3 }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return (
    <span className="text-sm font-bold text-text-dim w-5 text-center">
      {rank}
    </span>
  );
}

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [storage, setStorage] = useState<string>("");

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const apiRes = await fetch("/api/leaderboard");
      const apiData = await apiRes.json();

      if (apiData.leaderboard && apiData.leaderboard.length > 0) {
        const apiEntries = apiData.leaderboard.map((e: any) => ({
          address: e.address,
          streak: e.streak,
          bestStreak: e.bestStreak,
          totalTrades: e.totalTrades,
          wins: e.wins,
          winRate: e.winRate,
          score: e.predictionScore,
        }));
        setEntries(apiEntries);
        setStorage(apiData.storage || "server");
      } else {
        setEntries([]);
        setStorage("empty");
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Failed to fetch leaderboard:", e);
      setEntries([]);
      setStorage("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/app"
              className="flex items-center gap-1.5 text-sm text-text-dim hover:text-accent transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Trading
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-text flex items-center gap-3">
              <Trophy className="w-7 h-7 text-yellow-500" />
              Leaderboard
            </h1>
            <p className="text-sm text-text-dim mt-1">
              Top traders ranked by Prediction Score
            </p>
          </div>
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-border hover:border-accent/30 transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 text-text-dim ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {loading && entries.length === 0 ? (
          /* Loading state */
          <div className="glass rounded-2xl p-12 text-center">
            <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
            <p className="text-sm text-text-dim">
              Loading leaderboard data...
            </p>
          </div>
        ) : entries.length === 0 ? (
          /* Empty state — no trades yet */
          <div className="glass rounded-2xl p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-text mb-2">
              No traders yet
            </h2>
            <p className="text-sm text-text-dim mb-6 max-w-md mx-auto">
              Be the first to trade on StreakTrader. Place a prediction,
              build a streak, and claim the top spot.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm font-bold text-white"
            >
              Start Trading <TrendingUp className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
                {[1, 0, 2].map((idx) => {
                  const entry = topThree[idx];
                  if (!entry) return <div key={idx} />;
                  const isFirst = idx === 0;
                  const isSecond = idx === 1;
                  const rank = isSecond ? 1 : isFirst ? 2 : 3;

                  return (
                    <motion.div
                      key={entry.address}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: rank * 0.1 }}
                      className={`glass rounded-2xl p-4 sm:p-5 text-center ${
                        isFirst ? "ring-2 ring-yellow-400/40 -mt-4" : ""
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                          isFirst
                            ? "bg-yellow-50"
                            : isSecond
                              ? "bg-slate-100"
                              : "bg-amber-50"
                        }`}
                      >
                        <RankBadge rank={rank} />
                      </div>
                      <div className="text-sm font-bold text-text mb-0.5 font-mono">
                        {truncateAddress(entry.address)}
                      </div>
                      <div className="text-2xl font-black font-mono text-gradient mb-1">
                        {entry.score}
                      </div>
                      <div className="text-[10px] text-text-dim uppercase tracking-wider mb-3">
                        Score
                      </div>
                      <ScoreBar score={entry.score} />
                      <div className="flex justify-between mt-3 text-[10px] text-text-dim">
                        <span>
                          <Flame className="w-3 h-3 inline text-accent" />{" "}
                          {entry.bestStreak}x best
                        </span>
                        <span>{entry.winRate}% win</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Full Rankings Table */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-slate-50/50">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold text-text-dim uppercase tracking-wider">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Trader</div>
                  <div className="col-span-2 text-center">
                    Best Streak
                  </div>
                  <div className="col-span-2 text-center">Win Rate</div>
                  <div className="col-span-3 text-center">Score</div>
                </div>
              </div>

              {entries.map((entry, i) => (
                <motion.div
                  key={entry.address}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-5 py-3 border-b border-border/50 last:border-0 hover:bg-accent/[0.02] transition-colors"
                >
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 flex justify-center">
                      <RankBadge rank={i + 1} />
                    </div>
                    <div className="col-span-4">
                      <div className="text-sm font-bold text-text font-mono">
                        {truncateAddress(entry.address)}
                      </div>
                      <div className="text-[10px] text-text-dim">
                        {entry.totalTrades} trades
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3 text-accent" />
                        <span className="text-sm font-bold font-mono text-text">
                          {entry.bestStreak}x
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <span
                        className={`text-sm font-bold font-mono ${
                          entry.winRate >= 70
                            ? "text-up"
                            : entry.winRate >= 50
                              ? "text-text"
                              : "text-down"
                        }`}
                      >
                        {entry.winRate}%
                      </span>
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <ScoreBar score={entry.score} />
                        </div>
                        <span className="text-sm font-bold font-mono text-gradient w-8 text-right">
                          {entry.score}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-dim">
            Scores computed by{" "}
            <span className="font-semibold text-accent">
              ScoreOracle
            </span>{" "}
            contract &bull; Data synced across devices
          </p>
          {lastUpdated && (
            <p className="text-[10px] text-text-muted mt-1">
              Last updated: {lastUpdated} &bull; Storage: {storage}
            </p>
          )}
          <a
            href="https://shannon-explorer.somnia.network"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-[10px] text-accent/60 hover:text-accent"
          >
            <ExternalLink className="w-3 h-3" /> Verify on Explorer
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
