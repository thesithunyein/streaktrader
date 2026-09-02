import { NextRequest, NextResponse } from "next/server";

// Try to import Vercel KV
let kv: any = null;
try {
  if (process.env.KV_REST_API_URL) {
    const kvModule = await import("@vercel/kv");
    kv = kvModule.kv;
  }
} catch {}

// In-memory fallback
const memoryStore = new Map<string, any>();

// GET /api/leaderboard
export async function GET(req: NextRequest) {
  try {
    const entries: any[] = [];

    if (kv) {
      // Use KV scan
      let cursor = 0;
      const result = await kv.scan(cursor, { match: "streak:*", count: 100 });
      const keys = result[0] || [];

      for (const key of keys) {
        try {
          const data = await kv.get(key);
          if (data && data.totalTrades > 0) {
            entries.push(data);
          }
        } catch {}
      }
    } else {
      // Use in-memory store
      for (const [, data] of memoryStore) {
        if (data && data.totalTrades > 0) {
          entries.push(data);
        }
      }
    }

    // Sort by predictionScore descending, then by bestStreak
    entries.sort((a, b) => b.predictionScore - a.predictionScore || b.bestStreak - a.bestStreak);

    // Return top 50
    return NextResponse.json({
      leaderboard: entries.slice(0, 50).map((e, i) => ({
        rank: i + 1,
        address: e.address,
        streak: e.streak,
        bestStreak: e.bestStreak,
        totalTrades: e.totalTrades,
        wins: e.wins,
        winRate: e.totalTrades > 0 ? Math.round((e.wins / e.totalTrades) * 100) : 0,
        predictionScore: e.predictionScore,
        totalPnL: e.totalPnL,
        lastUpdated: e.lastUpdated,
      })),
      total: entries.length,
      storage: kv ? "kv" : "memory",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
