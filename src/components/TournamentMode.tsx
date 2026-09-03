"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Clock, Zap, Medal, Crown, Star, Users, TrendingUp } from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  prize: number;
  endsAt: number;
  participants: number;
  yourRank: number;
  totalPrize: number;
}

const TOURNAMENTS: Tournament[] = [
  {
    id: "weekly-1",
    name: "Weekly Streak Championship",
    prize: 500,
    endsAt: Date.now() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000, // 3 days, 5 hours
    participants: 47,
    yourRank: 12,
    totalPrize: 500,
  },
  {
    id: "daily-1",
    name: "Daily Sprint",
    prize: 50,
    endsAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    participants: 23,
    yourRank: 5,
    totalPrize: 50,
  },
  {
    id: "shield-challenge",
    name: "Shield Masters",
    prize: 100,
    endsAt: Date.now() + 1 * 24 * 60 * 60 * 1000, // 1 day
    participants: 15,
    yourRank: 8,
    totalPrize: 100,
  },
];

function Countdown({ endsAt }: { endsAt: number }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, endsAt - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs text-slate-600">
      <Clock className="w-3 h-3 text-slate-400" />
      {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
      <span>{timeLeft.hours}h</span>
      <span>{timeLeft.minutes}m</span>
      <span className="text-slate-400">{timeLeft.seconds}s</span>
    </div>
  );
}

export default function TournamentMode() {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-bold text-slate-900">Tournaments</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">{TOURNAMENTS.length} active</span>
      </div>

      {/* Tournament list */}
      <div className="divide-y divide-slate-100">
        {TOURNAMENTS.map((tournament) => (
          <motion.div
            key={tournament.id}
            whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
            onClick={() => setSelectedTournament(selectedTournament?.id === tournament.id ? null : tournament)}
            className="px-4 py-3 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  tournament.yourRank <= 3 ? "bg-yellow-50 border border-yellow-200" : "bg-slate-50 border border-slate-200"
                }`}>
                  {tournament.yourRank === 1 ? <Crown className="w-4 h-4 text-yellow-500" /> :
                   tournament.yourRank <= 3 ? <Medal className="w-4 h-4 text-yellow-500" /> :
                   <span className="text-xs font-bold text-slate-500">#{tournament.yourRank}</span>}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{tournament.name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2">
                    <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" />{tournament.participants}</span>
                    <span className="flex items-center gap-1"><Zap className="w-2.5 h-2.5" />{tournament.prize} USDso</span>
                  </div>
                </div>
              </div>
              <Countdown endsAt={tournament.endsAt} />
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                style={{ width: `${Math.max(5, 100 - (tournament.yourRank / tournament.participants) * 100)}%` }} />
            </div>

            {/* Expanded details */}
            {selectedTournament?.id === tournament.id && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="mt-3 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400 mb-0.5">Your Rank</div>
                    <div className="text-sm font-bold text-slate-900">#{tournament.yourRank}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400 mb-0.5">Prize</div>
                    <div className="text-sm font-bold text-yellow-500">{tournament.prize}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400 mb-0.5">Participants</div>
                    <div className="text-sm font-bold text-slate-900">{tournament.participants}</div>
                  </div>
                </div>

                {/* Mini leaderboard */}
                <div className="mt-3 space-y-1.5">
                  {[
                    { rank: 1, name: "0x7a35...9Da2", streak: 12, score: 94 },
                    { rank: 2, name: "0x1234...abcd", streak: 8, score: 87 },
                    { rank: 3, name: "0xdef0...6789", streak: 7, score: 82 },
                    { rank: tournament.yourRank, name: "You", streak: 3, score: 65, isYou: true },
                  ].map((p) => (
                    <div key={p.rank} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${
                      p.isYou ? "bg-accent/5 border border-accent/15" : ""
                    }`}>
                      <span className={`w-5 text-center font-bold ${p.rank <= 3 ? "text-yellow-500" : "text-slate-400"}`}>
                        {p.rank <= 3 ? ["🥇", "🥈", "🥉"][p.rank - 1] : `#${p.rank}`}
                      </span>
                      <span className={`flex-1 font-mono ${p.isYou ? "text-accent font-bold" : "text-slate-600"}`}>{p.name}</span>
                      <span className="text-slate-400">{p.streak}x</span>
                      <span className="font-bold text-slate-900">{p.score}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-3 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" /> Enter Tournament
                </button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
