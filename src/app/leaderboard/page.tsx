"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Trophy, Flame, ArrowLeft, Crown, Medal, Award,
  RefreshCw, Users, TrendingUp,
} from "lucide-react";

function Animate({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "scale";
}) {
  return (
    <div
      className={`opacity-0 ${direction === "scale" ? "animate-fade-scale" : "animate-fade-up"} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

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
    score >= 80 ? "bg-[#2563eb]" : score >= 60 ? "bg-[#16a34a]" : score >= 40 ? "bg-[#f59e0b]" : "bg-slate-200";
  return (
    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full rounded-full ${color} animate-bar-grow origin-left`}
        style={{ width: `${score}%`, animationDelay: "300ms" }}
      />
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-[#f59e0b]" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-[#f59e0b]/60" />;
  return <span className="text-sm font-bold text-slate-300 w-5 text-center">{rank}</span>;
}

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const apiRes = await fetch("/api/leaderboard");
      const apiData = await apiRes.json();
      if (apiData.leaderboard && apiData.leaderboard.length > 0) {
        setEntries(apiData.leaderboard.map((e: any) => ({
          address: e.address,
          streak: e.streak,
          bestStreak: e.bestStreak,
          totalTrades: e.totalTrades,
          wins: e.wins,
          winRate: e.winRate,
          score: e.predictionScore,
        })));
      } else {
        setEntries([]);
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const topThree = entries.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 sm:px-8 pt-6 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/app" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-accent transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Trading
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Trophy className="w-7 h-7 text-[#f59e0b]" />
              Leaderboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">Top traders ranked by Prediction Score</p>
          </div>
          <button onClick={fetchLeaderboard} disabled={loading}
            className="p-2.5 rounded-[12px] border border-slate-200 hover:bg-slate-50 transition-colors">
            <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading && entries.length === 0 ? (
          <div className="glass rounded-[20px] p-12 text-center">
            <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-400">Loading leaderboard...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="glass rounded-[20px] p-12 text-center">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-900 mb-2">No traders yet</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Be the first to trade on StreakTrader. Place a prediction and claim the top spot.
            </p>
            <Link href="/app" className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-[12px] text-sm font-bold text-white">
              Start Trading <TrendingUp className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {topThree.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
                {[1, 0, 2].map((idx) => {
                  const entry = topThree[idx];
                  if (!entry) return <div key={idx} />;
                  const isFirst = idx === 0;
                  const rank = idx === 1 ? 1 : isFirst ? 2 : 3;
                  return (
                    <Animate key={entry.address} delay={rank * 100} direction="scale">
                      <div className={`glass rounded-[20px] p-4 sm:p-5 text-center ${isFirst ? "ring-2 ring-[#f59e0b]/30 -mt-4" : ""}`}>
                        <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${isFirst ? "bg-[#f59e0b]/10" : "bg-slate-50"}`}>
                          <RankBadge rank={rank} />
                        </div>
                        <div className="text-sm font-bold text-slate-900 mb-0.5 font-mono">{truncateAddress(entry.address)}</div>
                        <div className="text-2xl font-black font-mono text-gradient mb-1">{entry.score}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-3">Score</div>
                        <ScoreBar score={entry.score} />
                        <div className="flex justify-between mt-3 text-[10px] text-slate-400">
                          <span><Flame className="w-3 h-3 inline text-[#f59e0b]" /> {entry.bestStreak}x</span>
                          <span>{entry.winRate}% win</span>
                        </div>
                      </div>
                    </Animate>
                  );
                })}
              </div>
            )}

            <div className="glass rounded-[20px] overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Trader</div>
                  <div className="col-span-2 text-center">Best Streak</div>
                  <div className="col-span-2 text-center">Win Rate</div>
                  <div className="col-span-3 text-center">Score</div>
                </div>
              </div>
              {entries.map((entry, i) => (
                <div key={entry.address} className="px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 flex justify-center"><RankBadge rank={i + 1} /></div>
                    <div className="col-span-4">
                      <div className="text-sm font-bold text-slate-900 font-mono">{truncateAddress(entry.address)}</div>
                      <div className="text-[10px] text-slate-400">{entry.totalTrades} trades</div>
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3 text-[#f59e0b]" />
                        <span className="text-sm font-bold font-mono text-slate-900">{entry.bestStreak}x</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className={`text-sm font-bold font-mono ${entry.winRate >= 70 ? "text-[#16a34a]" : entry.winRate >= 50 ? "text-slate-900" : "text-[#dc2626]"}`}>
                        {entry.winRate}%
                      </span>
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1"><ScoreBar score={entry.score} /></div>
                        <span className="text-sm font-bold font-mono text-gradient w-8 text-right">{entry.score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">Scores computed by <span className="font-semibold text-accent">ScoreOracle</span> contract</p>
          {lastUpdated && <p className="text-[10px] text-slate-300 mt-1">Last updated: {lastUpdated}</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
