import { NextRequest, NextResponse } from "next/server";

// Free LLM API - Groq (fastest, free tier)
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

interface MarketData {
  symbol: string;
  underlying: string;
  window: string;
  upProbability: number;
  currentPrice?: number;
  recentPrices?: number[];
}

interface CopilotResponse {
  suggestion: "UP" | "DOWN" | "HOLD";
  confidence: number;
  reasoning: string;
  signals: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

async function callGroq(prompt: string): Promise<string> {
  if (!GROQ_API_KEY) {
    // Fallback: simple heuristic without API key
    return "";
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
    }),
  });

  if (!res.ok) return "";
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function heuristicAnalysis(market: MarketData): CopilotResponse {
  const prob = market.upProbability;
  const prices = market.recentPrices || [];
  const currentPrice = market.currentPrice || 0;

  // Simple momentum analysis
  let momentum = 0;
  if (prices.length >= 2) {
    const recent = prices.slice(-5);
    momentum = recent[recent.length - 1] - recent[0];
  }

  // Mean reversion signal
  const avg = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const meanReversion = currentPrice > avg * 1.001 ? -1 : currentPrice < avg * 0.999 ? 1 : 0;

  // Combined signal
  let score = 0;
  const signals: string[] = [];

  // Probability-based signal
  if (prob > 55) {
    score += 1;
    signals.push(`Market favors UP (${prob.toFixed(0)}%)`);
  } else if (prob < 45) {
    score -= 1;
    signals.push(`Market favors DOWN (${(100 - prob).toFixed(0)}%)`);
  }

  // Momentum signal
  if (momentum > 50) {
    score += 1;
    signals.push("Positive momentum detected");
  } else if (momentum < -50) {
    score -= 1;
    signals.push("Negative momentum detected");
  }

  // Mean reversion signal
  if (meanReversion > 0) {
    score += 1;
    signals.push("Below average price — potential bounce");
  } else if (meanReversion < 0) {
    score -= 1;
    signals.push("Above average price — potential pullback");
  }

  // Determine suggestion
  let suggestion: "UP" | "DOWN" | "HOLD" = "HOLD";
  if (score >= 2) suggestion = "UP";
  else if (score <= -2) suggestion = "DOWN";

  // Confidence based on signal agreement
  const confidence = Math.min(85, 50 + Math.abs(score) * 12);

  // Risk level
  const riskLevel = confidence > 70 ? "LOW" : confidence > 55 ? "MEDIUM" : "HIGH";

  // Reasoning
  const reasoning = suggestion === "HOLD"
    ? "Signals are mixed. Consider waiting for a clearer setup."
    : `Based on ${signals.length} signal${signals.length > 1 ? "s" : ""}, the model suggests ${suggestion} with ${confidence}% confidence.`;

  return { suggestion, confidence, reasoning, signals, riskLevel };
}

export async function POST(req: NextRequest) {
  try {
    const { market } = (await req.json()) as { market: MarketData };

    if (!market) {
      return NextResponse.json({ error: "Market data required" }, { status: 400 });
    }

    // Try Groq LLM first
    const prompt = `You are a prediction market analyst. Analyze this BTC event contract and suggest UP or DOWN.

Market: ${market.symbol}
Underlying: ${market.underlying}
Window: ${market.window}
Current UP Probability: ${market.upProbability}%
Current Price: $${market.currentPrice || "unknown"}
Recent Prices: ${market.recentPrices?.slice(-10).join(", ") || "unknown"}

Respond in JSON only:
{"suggestion": "UP" or "DOWN", "confidence": 0-100, "reasoning": "brief reason", "signals": ["signal1", "signal2"], "riskLevel": "LOW" or "MEDIUM" or "HIGH"}`;

    const llmResponse = await callGroq(prompt);

    if (llmResponse) {
      try {
        // Parse LLM response
        const cleaned = llmResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return NextResponse.json({
          suggestion: parsed.suggestion || "HOLD",
          confidence: Math.min(85, Math.max(30, parsed.confidence || 50)),
          reasoning: parsed.reasoning || "Analysis complete.",
          signals: parsed.signals || [],
          riskLevel: parsed.riskLevel || "MEDIUM",
          source: "ai",
        });
      } catch {
        // LLM returned invalid JSON, fall through to heuristic
      }
    }

    // Fallback to heuristic analysis
    const result = heuristicAnalysis(market);
    return NextResponse.json({ ...result, source: "heuristic" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
