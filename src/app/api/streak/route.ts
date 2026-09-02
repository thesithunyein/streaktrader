import { NextRequest, NextResponse } from "next/server";

// Try to import Vercel KV, fallback to in-memory if not configured
let kv: any = null;
try {
  if (process.env.KV_REST_API_URL) {
    const kvModule = await import("@vercel/kv");
    kv = kvModule.kv;
  }
} catch {}

interface StreakData {
  address: string;
  streak: number;
  bestStreak: number;
  totalPnL: number;
  totalTrades: number;
  wins: number;
  trades: any[];
  shields: number;
  daysActive: number;
  firstTradeDate: number | null;
  predictionScore: number;
  lastUpdated: number;
}

// In-memory fallback when KV is not configured
const memoryStore = new Map<string, StreakData>();

async function getKey(key: string): Promise<StreakData | null> {
  if (kv) {
    return (await kv.get(key)) as StreakData | null;
  }
  return memoryStore.get(key) || null;
}

async function setKey(key: string, data: StreakData): Promise<void> {
  if (kv) {
    await kv.set(key, data, { ex: 60 * 60 * 24 * 365 });
  } else {
    memoryStore.set(key, data);
  }
}

// GET /api/streak?address=0x...
export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address");
    if (!address) {
      return NextResponse.json({ error: "Address required" }, { status: 400 });
    }

    const key = `streak:${address.toLowerCase()}`;
    const data = await getKey(key);

    return NextResponse.json({
      exists: !!data,
      data,
      storage: kv ? "kv" : "memory",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/streak { address, ...streakData }
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<StreakData> & { address: string };
    if (!body.address) {
      return NextResponse.json({ error: "Address required" }, { status: 400 });
    }

    const key = `streak:${body.address.toLowerCase()}`;

    // Merge with existing data
    const existing = await getKey(key);
    const merged: StreakData = {
      address: body.address.toLowerCase(),
      streak: body.streak ?? existing?.streak ?? 0,
      bestStreak: body.bestStreak ?? existing?.bestStreak ?? 0,
      totalPnL: body.totalPnL ?? existing?.totalPnL ?? 0,
      totalTrades: body.totalTrades ?? existing?.totalTrades ?? 0,
      wins: body.wins ?? existing?.wins ?? 0,
      trades: body.trades ?? existing?.trades ?? [],
      shields: body.shields ?? existing?.shields ?? 1,
      daysActive: body.daysActive ?? existing?.daysActive ?? 1,
      firstTradeDate: body.firstTradeDate ?? existing?.firstTradeDate ?? null,
      predictionScore: body.predictionScore ?? existing?.predictionScore ?? 0,
      lastUpdated: Date.now(),
    };

    // Keep only last 50 trades to save space
    if (merged.trades.length > 50) {
      merged.trades = merged.trades.slice(0, 50);
    }

    await setKey(key, merged);

    return NextResponse.json({
      success: true,
      data: merged,
      storage: kv ? "kv" : "memory",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT /api/streak — upsert
export async function PUT(req: NextRequest) {
  return POST(req);
}
