"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown, Flame, Shield, Trophy, Users, Zap, TrendingUp, TrendingDown, Clock } from "lucide-react";

interface FeedEvent {
  id: string;
  type: "win" | "loss" | "streak" | "shield" | "challenge" | "tournament";
  trader: string;
  amount?: number;
  streak?: number;
  market?: string;
  timestamp: number;
  detail?: string;
}

// Simulated live feed — in production, this would be a WebSocket
const TRADER_NAMES = [
  "0x7a35...9Da2", "0xd48c...4403", "0x1234...abcd", "0x5678...ef01",
  "0x9abc...2345", "0xdef0...6789", "0x1111...2222", "0x3333...4444",
];

const MARKETS = ["BTC/USD 15m", "ETH/USD 15m", "BTC/USD 5m", "ETH/USD 5m"];

function generateEvent(): FeedEvent {
  const types: FeedEvent["type"][] = ["win", "loss", "streak", "shield", "challenge", "tournament"];
  const type = types[Math.floor(Math.random() * types.length)];
  const trader = TRADER_NAMES[Math.floor(Math.random() * TRADER_NAMES.length)];
  const market = MARKETS[Math.floor(Math.random() * MARKETS.length)];
  const amount = [1, 5, 10, 25][Math.floor(Math.random() * 4)];
  const streak = Math.floor(Math.random() * 10) + 1;

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    trader,
    amount,
    streak,
    market,
    timestamp: Date.now(),
    detail: type === "streak" ? `${streak}x streak reached!` :
            type === "shield" ? "Shield activated" :
            type === "challenge" ? "Challenge accepted" :
            type === "tournament" ? "Joined weekly tournament" :
            undefined,
  };
}

export default function SocialFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Generate initial events
    const initial = Array.from({ length: 8 }, generateEvent).reverse();
    setEvents(initial);

    // Add new events every 3-8 seconds
    const interval = setInterval(() => {
      const newEvent = generateEvent();
      setEvents(prev => [newEvent, ...prev].slice(0, 20));
    }, 3000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, []);

  const eventIcon = (type: FeedEvent["type"]) => {
    switch (type) {
      case "win": return <TrendingUp className="w-3.5 h-3.5 text-[#16a34a]" />;
      case "loss": return <TrendingDown className="w-3.5 h-3.5 text-[#dc2626]" />;
      case "streak": return <Flame className="w-3.5 h-3.5 text-amber-500" />;
      case "shield": return <Shield className="w-3.5 h-3.5 text-[#2563eb]" />;
      case "challenge": return <Users className="w-3.5 h-3.5 text-purple-500" />;
      case "tournament": return <Trophy className="w-3.5 h-3.5 text-yellow-500" />;
    }
  };

  const eventText = (event: FeedEvent) => {
    switch (event.type) {
      case "win": return <><span className="font-bold text-[#16a34a]">Won</span> {event.amount} tUSDC on {event.market}</>;
      case "loss": return <><span className="font-bold text-[#dc2626]">Lost</span> {event.amount} tUSDC on {event.market}</>;
      case "streak": return <><span className="font-bold text-amber-500">Hit {event.streak}x streak!</span></>;
      case "shield": return <><span className="font-bold text-[#2563eb]">Activated shield</span></>;
      case "challenge": return <><span className="font-bold text-purple-500">Won challenge</span> on {event.market}</>;
      case "tournament": return <><span className="font-bold text-yellow-500">Joined tournament</span></>;
    }
  };

  const timeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
          <span className="text-sm font-bold text-slate-900">Live Activity</span>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)}
          className="text-[10px] text-slate-400 hover:text-slate-600 font-medium">
          {isExpanded ? "Show less" : "Show all"}
        </button>
      </div>

      {/* Feed */}
      <div className={`${isExpanded ? "max-h-[400px]" : "max-h-[200px]"} overflow-y-auto`}>
        <AnimatePresence initial={false}>
          {events.slice(0, isExpanded ? 20 : 5).map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4 py-2.5 border-b border-slate-50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  {eventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-900 truncate">
                    <span className="font-mono text-slate-500">{event.trader}</span>
                    {" "}
                    {eventText(event)}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {timeAgo(event.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Stats bar */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <span>{events.filter(e => e.type === "win").length} wins today</span>
        <span>{events.length} events</span>
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
          Live
        </span>
      </div>
    </div>
  );
}
