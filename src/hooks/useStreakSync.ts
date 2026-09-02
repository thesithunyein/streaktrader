"use client";

import { useEffect, useRef, useCallback } from "react";
import { useStreakStore } from "@/lib/store";

const SYNC_INTERVAL = 30000; // Sync every 30 seconds
const API_BASE = "/api/streak";

export function useStreakSync(address: string | null) {
  const lastSyncRef = useRef<number>(0);
  const syncingRef = useRef(false);

  // Load data from API
  const loadFromAPI = useCallback(async () => {
    if (!address || syncingRef.current) return;

    try {
      syncingRef.current = true;
      const res = await fetch(`${API_BASE}?address=${address}`);
      const { exists, data } = await res.json();

      if (exists && data) {
        const local = useStreakStore.getState();

        // Merge: take the higher values for each field
        const merged = {
          streak: Math.max(local.streak, data.streak || 0),
          bestStreak: Math.max(local.bestStreak, data.bestStreak || 0),
          totalPnL: Math.max(local.totalPnL, data.totalPnL || 0),
          totalTrades: Math.max(local.totalTrades, data.totalTrades || 0),
          wins: Math.max(local.wins, data.wins || 0),
          shields: Math.max(local.shields, data.shields || 0),
          daysActive: Math.max(local.daysActive, data.daysActive || 1),
          firstTradeDate: local.firstTradeDate || data.firstTradeDate || null,
          predictionScore: Math.max(local.predictionScore, data.predictionScore || 0),
        };

        // Update store
        useStreakStore.setState(merged);

        // Save merged back to localStorage
        try {
          localStorage.setItem("streaktrader", JSON.stringify({
            ...merged,
            trades: local.trades, // Keep local trades (more recent)
          }));
        } catch {}
      }
    } catch (e) {
      console.error("Failed to load from API:", e);
    } finally {
      syncingRef.current = false;
    }
  }, [address]);

  // Save data to API
  const saveToAPI = useCallback(async () => {
    if (!address) return;

    try {
      const state = useStreakStore.getState();
      await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          streak: state.streak,
          bestStreak: state.bestStreak,
          totalPnL: state.totalPnL,
          totalTrades: state.totalTrades,
          wins: state.wins,
          trades: state.trades.slice(0, 20), // Only save last 20 trades
          shields: state.shields,
          daysActive: state.daysActive,
          firstTradeDate: state.firstTradeDate,
          predictionScore: state.predictionScore,
        }),
      });
      lastSyncRef.current = Date.now();
    } catch (e) {
      console.error("Failed to save to API:", e);
    }
  }, [address]);

  // Load on mount and when address changes
  useEffect(() => {
    if (address) {
      loadFromAPI();
    }
  }, [address, loadFromAPI]);

  // Auto-sync periodically
  useEffect(() => {
    if (!address) return;

    const interval = setInterval(() => {
      if (Date.now() - lastSyncRef.current > SYNC_INTERVAL) {
        saveToAPI();
      }
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [address, saveToAPI]);

  // Save before page unload
  useEffect(() => {
    if (!address) return;

    const handleBeforeUnload = () => {
      saveToAPI();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [address, saveToAPI]);

  // Subscribe to store changes and save
  useEffect(() => {
    if (!address) return;

    const unsubscribe = useStreakStore.subscribe((state, prevState) => {
      // Only save if meaningful data changed
      if (
        state.streak !== prevState.streak ||
        state.bestStreak !== prevState.bestStreak ||
        state.totalTrades !== prevState.totalTrades ||
        state.wins !== prevState.wins ||
        state.totalPnL !== prevState.totalPnL
      ) {
        // Debounce: save after 2 seconds of no changes
        const timeout = setTimeout(() => saveToAPI(), 2000);
        return () => clearTimeout(timeout);
      }
    });

    return unsubscribe;
  }, [address, saveToAPI]);

  return { loadFromAPI, saveToAPI };
}
