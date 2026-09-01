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
  shieldUsed: boolean;
}

export interface Challenge {
  id: string;
  marketSymbol: string;
  creatorSide: "UP" | "DOWN";
  creatorStake: number;
  opponentSide: "UP" | "DOWN" | null;
  status: "pending" | "accepted" | "settled";
  result: "CREATOR_WON" | "OPPONENT_WON" | null;
  createdAt: number;
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

  // Streak Shield
  shields: number;
  maxShields: number;
  shieldCooldown: number; // timestamp when next free shield is available
  activeShield: boolean;

  // Prediction Score
  predictionScore: number;
  daysActive: number;
  firstTradeDate: number | null;

  // Head-to-Head Challenges
  challenges: Challenge[];
  activeChallenge: Challenge | null;

  // Actions
  placeTrade: (trade: Omit<Trade, "id" | "multiplier" | "result" | "payout" | "timestamp" | "shieldUsed">) => void;
  resolveTrade: (result: "WIN" | "LOSE") => void;
  dismissResult: () => void;
  getMultiplier: () => number;
  getWinRate: () => number;
  reset: () => void;

  // Shield actions
  activateShield: () => void;
  deactivateShield: () => void;
  addShield: () => void;
  canGetFreeShield: () => boolean;

  // Challenge actions
  createChallenge: (marketSymbol: string, side: "UP" | "DOWN", stake: number) => string;
  acceptChallenge: (challengeId: string, side: "UP" | "DOWN") => void;
  resolveChallenge: (challengeId: string, winner: "CREATOR_WON" | "OPPONENT_WON") => void;
}

function calculatePredictionScore(state: {
  wins: number;
  totalTrades: number;
  streak: number;
  bestStreak: number;
  daysActive: number;
}): number {
  if (state.totalTrades === 0) return 0;

  // Win Rate component (40% weight)
  const winRate = state.wins / state.totalTrades;
  const winRateScore = winRate * 40;

  // Streak component (30% weight) - normalized to 0-30
  // 10x streak = max points
  const streakScore = Math.min(30, (state.streak / 10) * 30);

  // Volume component (20% weight) - logarithmic scale
  // 100 trades = max points
  const volumeScore = Math.min(20, (Math.log(state.totalTrades + 1) / Math.log(101)) * 20);

  // Consistency component (10% weight)
  // 30 days active = max points
  const consistencyScore = Math.min(10, (state.daysActive / 30) * 10);

  return Math.round(winRateScore + streakScore + volumeScore + consistencyScore);
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

  // Shield defaults
  shields: 1,
  maxShields: 3,
  shieldCooldown: 0,
  activeShield: false,

  // Prediction Score defaults
  predictionScore: 0,
  daysActive: 1,
  firstTradeDate: null,

  // Challenge defaults
  challenges: [],
  activeChallenge: null,

  placeTrade: (trade) => {
    const state = get();
    const multiplier = state.getMultiplier();
    const shieldUsed = state.activeShield;
    const newTrade: Trade = {
      ...trade,
      id: `trade-${Date.now()}`,
      multiplier,
      result: "PENDING",
      payout: 0,
      timestamp: Date.now(),
      shieldUsed,
    };

    // Deactivate shield after use
    const newShields = shieldUsed ? state.shields - 1 : state.shields;

    set((s) => ({
      currentTrade: newTrade,
      showSettlement: true,
      showResult: null,
      activeShield: false,
      shields: newShields,
      trades: [newTrade, ...s.trades],
      totalTrades: s.totalTrades + 1,
      firstTradeDate: s.firstTradeDate || Date.now(),
    }));

    // Update days active
    const firstDate = state.firstTradeDate || Date.now();
    const daysActive = Math.max(1, Math.ceil((Date.now() - firstDate) / (1000 * 60 * 60 * 24)));
    set({ daysActive });
  },

  resolveTrade: (result) => {
    const state = get();
    const { currentTrade, streak, bestStreak, totalPnL, wins, trades } = state;
    if (!currentTrade) return;

    // If shield was used and result is LOSE, shield absorbs the loss
    const shieldAbsorbed = currentTrade.shieldUsed && result === "LOSE";
    const effectiveResult = shieldAbsorbed ? "WIN" : result;

    const newStreak = effectiveResult === "WIN" ? streak + 1 : 0;
    const payout = effectiveResult === "WIN" ? currentTrade.stake * currentTrade.multiplier : 0;
    const pnl = effectiveResult === "WIN" ? payout - currentTrade.stake : -currentTrade.stake;

    const updatedTrades = trades.map((t) =>
      t.id === currentTrade.id ? { ...t, result: effectiveResult, payout } : t
    );

    const newWins = effectiveResult === "WIN" ? wins + 1 : wins;
    const newBestStreak = Math.max(bestStreak, newStreak);

    set({
      streak: newStreak,
      bestStreak: newBestStreak,
      totalPnL: totalPnL + pnl,
      wins: newWins,
      trades: updatedTrades,
      showResult: effectiveResult,
      predictionScore: calculatePredictionScore({
        wins: newWins,
        totalTrades: get().totalTrades,
        streak: newStreak,
        bestStreak: newBestStreak,
        daysActive: get().daysActive,
      }),
    });

    // Save to localStorage
    const newState = {
      streak: newStreak,
      bestStreak: newBestStreak,
      totalPnL: totalPnL + pnl,
      totalTrades: get().totalTrades,
      wins: newWins,
      trades: updatedTrades,
      shields: get().shields,
      daysActive: get().daysActive,
      firstTradeDate: get().firstTradeDate,
    };
    try {
      localStorage.setItem("streaktrader", JSON.stringify(newState));
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
      shields: 1,
      activeShield: false,
      predictionScore: 0,
      daysActive: 1,
      firstTradeDate: null,
      challenges: [],
      activeChallenge: null,
    });
    try {
      localStorage.removeItem("streaktrader");
    } catch {}
  },

  // Shield actions
  activateShield: () => {
    const { shields } = get();
    if (shields > 0) {
      set({ activeShield: true });
    }
  },

  deactivateShield: () => {
    set({ activeShield: false });
  },

  addShield: () => {
    const { shields, maxShields } = get();
    if (shields < maxShields) {
      set({ shields: shields + 1 });
    }
  },

  canGetFreeShield: () => {
    const { shieldCooldown } = get();
    return Date.now() >= shieldCooldown;
  },

  // Challenge actions
  createChallenge: (marketSymbol, side, stake) => {
    const id = `challenge-${Date.now()}`;
    const challenge: Challenge = {
      id,
      marketSymbol,
      creatorSide: side,
      creatorStake: stake,
      opponentSide: null,
      status: "pending",
      result: null,
      createdAt: Date.now(),
    };
    set((s) => ({
      challenges: [challenge, ...s.challenges],
      activeChallenge: challenge,
    }));
    return id;
  },

  acceptChallenge: (challengeId, side) => {
    set((s) => ({
      challenges: s.challenges.map((c) =>
        c.id === challengeId ? { ...c, opponentSide: side, status: "accepted" } : c
      ),
    }));
  },

  resolveChallenge: (challengeId, winner) => {
    set((s) => ({
      challenges: s.challenges.map((c) =>
        c.id === challengeId ? { ...c, status: "settled", result: winner } : c
      ),
    }));
  },
}));

// Load from localStorage on client
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("streaktrader");
    if (saved) {
      const data = JSON.parse(saved);
      const state = {
        streak: data.streak || 0,
        bestStreak: data.bestStreak || 0,
        totalPnL: data.totalPnL || 0,
        totalTrades: data.totalTrades || 0,
        wins: data.wins || 0,
        trades: data.trades || [],
        shields: data.shields || 1,
        daysActive: data.daysActive || 1,
        firstTradeDate: data.firstTradeDate || null,
      };
      useStreakStore.setState({
        ...state,
        predictionScore: calculatePredictionScore({
          wins: state.wins,
          totalTrades: state.totalTrades,
          streak: state.streak,
          bestStreak: state.bestStreak,
          daysActive: state.daysActive,
        }),
      });
    }
  } catch {}
}
