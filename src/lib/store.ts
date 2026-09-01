import { create } from "zustand";

export interface Trade {
  id: string;
  marketId: string;
  symbol: string;
  side: "UP" | "DOWN";
  stake: number;
  multiplier: number;
  result: "WIN" | "LOSE" | "PENDING";
  payout: number;
  timestamp: number;
}

export interface StreakState {
  streak: number;
  bestStreak: number;
  totalPnL: number;
  totalTrades: number;
  wins: number;
  trades: Trade[];
  currentTrade: Trade | null;
  showSettlement: boolean;
  showResult: "WIN" | "LOSE" | null;

  // Actions
  placeTrade: (trade: Omit<Trade, "id" | "multiplier" | "result" | "payout" | "timestamp">) => void;
  resolveTrade: (result: "WIN" | "LOSE") => void;
  dismissResult: () => void;
  getMultiplier: () => number;
  getWinRate: () => number;
  reset: () => void;
}

export const useStreakStore = create<StreakState>((set, get) => ({
  streak: 0,
  bestStreak: 0,
  totalPnL: 0,
  totalTrades: 0,
  wins: 0,
  trades: [],
  currentTrade: null,
  showSettlement: false,
  showResult: null,

  placeTrade: (trade) => {
    const multiplier = get().getMultiplier();
    const newTrade: Trade = {
      ...trade,
      id: `trade-${Date.now()}`,
      multiplier,
      result: "PENDING",
      payout: 0,
      timestamp: Date.now(),
    };
    set((s) => ({
      currentTrade: newTrade,
      showSettlement: true,
      showResult: null,
      trades: [newTrade, ...s.trades],
      totalTrades: s.totalTrades + 1,
    }));
  },

  resolveTrade: (result) => {
    const { currentTrade, streak, bestStreak, totalPnL, wins, trades } = get();
    if (!currentTrade) return;

    const newStreak = result === "WIN" ? streak + 1 : 0;
    const payout = result === "WIN" ? currentTrade.stake * currentTrade.multiplier : 0;
    const pnl = result === "WIN" ? payout - currentTrade.stake : -currentTrade.stake;

    const updatedTrades = trades.map((t) =>
      t.id === currentTrade.id ? { ...t, result, payout } : t
    );

    set({
      streak: newStreak,
      bestStreak: Math.max(bestStreak, newStreak),
      totalPnL: totalPnL + pnl,
      wins: result === "WIN" ? wins + 1 : wins,
      trades: updatedTrades,
      showResult: result,
    });

    // Save to localStorage
    const state = {
      streak: newStreak,
      bestStreak: Math.max(bestStreak, newStreak),
      totalPnL: totalPnL + pnl,
      totalTrades: get().totalTrades,
      wins: result === "WIN" ? wins + 1 : wins,
      trades: updatedTrades,
    };
    try {
      localStorage.setItem("streaktrader", JSON.stringify(state));
    } catch {}
  },

  dismissResult: () => {
    set({ showSettlement: false, showResult: null, currentTrade: null });
  },

  getMultiplier: () => {
    return Math.max(1, get().streak);
  },

  getWinRate: () => {
    const { wins, totalTrades } = get();
    if (totalTrades === 0) return 0;
    return Math.round((wins / totalTrades) * 100);
  },

  reset: () => {
    set({
      streak: 0,
      bestStreak: 0,
      totalPnL: 0,
      totalTrades: 0,
      wins: 0,
      trades: [],
      currentTrade: null,
      showSettlement: false,
      showResult: null,
    });
    try {
      localStorage.removeItem("streaktrader");
    } catch {}
  },
}));

// Load from localStorage on client
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("streaktrader");
    if (saved) {
      const data = JSON.parse(saved);
      useStreakStore.setState({
        streak: data.streak || 0,
        bestStreak: data.bestStreak || 0,
        totalPnL: data.totalPnL || 0,
        totalTrades: data.totalTrades || 0,
        wins: data.wins || 0,
        trades: data.trades || [],
      });
    }
  } catch {}
}
