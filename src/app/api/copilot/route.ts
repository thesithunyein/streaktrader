import { NextRequest, NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

// ========== TYPES ==========

interface MarketData {
  symbol: string;
  underlying: string;
  window: string;
  upProbability: number;
  currentPrice?: number;
  recentPrices?: number[];
}

interface Signal {
  name: string;
  direction: "UP" | "DOWN" | "NEUTRAL";
  strength: number; // 0-100
  confidence: number; // 0-100
  reasoning: string;
  raw: Record<string, number>;
}

interface RiskGate {
  name: string;
  passed: boolean;
  reason: string;
}

interface CopilotResponse {
  suggestion: "UP" | "DOWN" | "HOLD";
  confidence: number;
  reasoning: string;
  signals: Signal[];
  riskGates: RiskGate[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  consensusScore: number; // -100 to 100
  source: "ai" | "heuristic";
}

// ========== SIGNAL AGENTS ==========

function momentumSignal(market: MarketData): Signal {
  const prices = market.recentPrices || [];
  if (prices.length < 5) {
    return {
      name: "MOMENTUM",
      direction: "NEUTRAL",
      strength: 0,
      confidence: 0,
      reasoning: "Insufficient price data for momentum analysis",
      raw: {},
    };
  }

  // EMA 9/21 crossover simulation
  const recent = prices.slice(-21);
  const ema9 = recent.slice(-9).reduce((a, b) => a + b, 0) / 9;
  const ema21 = recent.reduce((a, b) => a + b, 0) / recent.length;

  // Rate of Change (ROC-30)
  const roc = prices.length >= 30
    ? ((prices[prices.length - 1] - prices[prices.length - 30]) / prices[prices.length - 30]) * 100
    : 0;

  // Signal direction
  const emaCross = ema9 > ema21 ? 1 : ema9 < ema21 ? -1 : 0;
  const rocSignal = roc > 0.1 ? 1 : roc < -0.1 ? -1 : 0;

  const combined = emaCross * 0.6 + rocSignal * 0.4;
  const direction = combined > 0.2 ? "UP" : combined < -0.2 ? "DOWN" : "NEUTRAL";
  const strength = Math.min(100, Math.abs(combined) * 100);
  const confidence = Math.min(85, 50 + Math.abs(combined) * 30);

  return {
    name: "MOMENTUM",
    direction,
    strength,
    confidence,
    reasoning: `EMA9 ${ema9 > ema21 ? ">" : "<"} EMA21. ROC: ${roc.toFixed(2)}%. ${direction === "UP" ? "Bullish crossover" : direction === "DOWN" ? "Bearish crossover" : "No clear trend"}.`,
    raw: { ema9, ema21, roc, emaCross, rocSignal },
  };
}

function volatilitySignal(market: MarketData): Signal {
  const prices = market.recentPrices || [];
  if (prices.length < 10) {
    return {
      name: "VOLATILITY",
      direction: "NEUTRAL",
      strength: 0,
      confidence: 0,
      reasoning: "Insufficient price data for volatility analysis",
      raw: {},
    };
  }

  // Calculate standard deviation
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);

  // Z-score of current price
  const currentPrice = prices[prices.length - 1];
  const zScore = (currentPrice - mean) / stdDev;

  // Volatility regime
  const recentVol = prices.slice(-10).reduce((a, b) => a + b, 0) / 10;
  const historicalVol = mean;
  const volRatio = recentVol / historicalVol;

  // High volatility = mean reversion signal
  // Low volatility = breakout signal
  const isHighVol = volRatio > 1.02;
  const direction = isHighVol
    ? (zScore > 1 ? "DOWN" : zScore < -1 ? "UP" : "NEUTRAL") // Mean reversion
    : (zScore > 0.5 ? "UP" : zScore < -0.5 ? "DOWN" : "NEUTRAL"); // Breakout

  const strength = Math.min(100, Math.abs(zScore) * 50);
  const confidence = Math.min(80, 40 + Math.abs(zScore) * 20);

  return {
    name: "VOLATILITY",
    direction,
    strength,
    confidence,
    reasoning: `Z-score: ${zScore.toFixed(2)}. Volatility regime: ${isHighVol ? "HIGH (mean reversion)" : "LOW (breakout)"}. ${direction === "UP" ? "Price below mean, expect bounce" : direction === "DOWN" ? "Price above mean, expect pullback" : "No clear signal"}.`,
    raw: { stdDev, zScore, volRatio, isHighVol: isHighVol ? 1 : 0 },
  };
}

function probabilitySignal(market: MarketData): Signal {
  const prob = market.upProbability;

  // Market-implied probability analysis
  // If market is strongly skewed, it might be overconfident
  const skew = prob - 50;
  const absSkew = Math.abs(skew);

  // Contrarian signal when market is extreme
  let direction: "UP" | "DOWN" | "NEUTRAL";
  let reasoning: string;

  if (absSkew > 15) {
    // Market is strongly skewed — contrarian signal
    direction = skew > 0 ? "DOWN" : "UP";
    reasoning = `Market strongly favors ${skew > 0 ? "UP" : "DOWN"} (${prob.toFixed(0)}%). Contrarian signal: overconfidence detected.`;
  } else if (absSkew > 5) {
    // Moderate skew — follow the trend
    direction = skew > 0 ? "UP" : "DOWN";
    reasoning = `Market favors ${skew > 0 ? "UP" : "DOWN"} (${prob.toFixed(0)}%). Trend-following signal.`;
  } else {
    direction = "NEUTRAL";
    reasoning = `Market is balanced (${prob.toFixed(0)}%). No clear edge.`;
  }

  const strength = Math.min(100, absSkew * 4);
  const confidence = Math.min(75, 45 + absSkew * 1.5);

  return {
    name: "PROBABILITY",
    direction,
    strength,
    confidence,
    reasoning,
    raw: { prob, skew, absSkew },
  };
}

// ========== RISK GATES ==========

function evaluateRiskGates(
  signals: Signal[],
  market: MarketData,
  userState?: { recentTrades: number; cooldownActive: boolean }
): RiskGate[] {
  const gates: RiskGate[] = [];

  // Gate 1: Minimum Signal Confidence
  const avgConfidence = signals.reduce((a, s) => a + s.confidence, 0) / signals.length;
  gates.push({
    name: "Min Signal Confidence",
    passed: avgConfidence >= 40,
    reason: avgConfidence >= 40
      ? `Average confidence ${avgConfidence.toFixed(0)}% ≥ 40%`
      : `Average confidence ${avgConfidence.toFixed(0)}% < 40% — signals too weak`,
  });

  // Gate 2: Signal Consensus (at least 2/3 agree)
  const directions = signals.filter(s => s.direction !== "NEUTRAL").map(s => s.direction);
  const upCount = directions.filter(d => d === "UP").length;
  const downCount = directions.filter(d => d === "DOWN").length;
  const consensus = Math.max(upCount, downCount);
  const totalSignals = directions.length;

  gates.push({
    name: "Signal Consensus",
    passed: totalSignals > 0 && consensus >= Math.ceil(totalSignals * 0.67),
    reason: totalSignals === 0
      ? "No active signals"
      : consensus >= Math.ceil(totalSignals * 0.67)
        ? `${consensus}/${totalSignals} signals agree — consensus reached`
        : `${consensus}/${totalSignals} signals agree — no consensus (need 2/3)`,
  });

  // Gate 3: Market Probability Edge (min 5% edge from neutral)
  const probEdge = Math.abs(market.upProbability - 50);
  gates.push({
    name: "Probability Edge",
    passed: probEdge >= 5,
    reason: probEdge >= 5
      ? `Edge: ${probEdge.toFixed(1)}% from neutral — sufficient`
      : `Edge: ${probEdge.toFixed(1)}% from neutral — too close to 50/50`,
  });

  // Gate 4: Cooldown Check
  const cooldownActive = userState?.cooldownActive ?? false;
  gates.push({
    name: "Trade Cooldown",
    passed: !cooldownActive,
    reason: cooldownActive
      ? "Cooldown active — wait before next trade"
      : "No cooldown — ready to trade",
  });

  // Gate 5: Max Concurrent Positions
  const recentTrades = userState?.recentTrades ?? 0;
  const maxPositions = 3;
  gates.push({
    name: "Max Positions",
    passed: recentTrades < maxPositions,
    reason: recentTrades < maxPositions
      ? `${recentTrades}/${maxPositions} positions — OK`
      : `${recentTrades}/${maxPositions} positions — max reached`,
  });

  return gates;
}

// ========== HEURISTIC ANALYSIS ==========

function heuristicAnalysis(market: MarketData, userState?: any): CopilotResponse {
  // Run all signal agents
  const signals = [momentumSignal(market), volatilitySignal(market), probabilitySignal(market)];

  // Calculate consensus score (-100 to 100)
  let consensusScore = 0;
  let totalWeight = 0;
  for (const signal of signals) {
    if (signal.direction === "UP") {
      consensusScore += signal.strength * (signal.confidence / 100);
    } else if (signal.direction === "DOWN") {
      consensusScore -= signal.strength * (signal.confidence / 100);
    }
    totalWeight += signal.strength;
  }
  consensusScore = totalWeight > 0 ? (consensusScore / totalWeight) * 100 : 0;

  // Run risk gates
  const riskGates = evaluateRiskGates(signals, market, userState);
  const passedGates = riskGates.filter(g => g.passed).length;
  const totalGates = riskGates.length;

  // Determine suggestion
  let suggestion: "UP" | "DOWN" | "HOLD" = "HOLD";
  if (consensusScore > 15 && passedGates >= 3) suggestion = "UP";
  else if (consensusScore < -15 && passedGates >= 3) suggestion = "DOWN";

  // Confidence based on signal agreement + gate pass rate
  const signalConfidence = signals.reduce((a, s) => a + s.confidence, 0) / signals.length;
  const gatePassRate = passedGates / totalGates;
  const confidence = Math.min(85, Math.round(signalConfidence * 0.6 + gatePassRate * 40));

  // Risk level
  const riskLevel = passedGates >= 4 ? "LOW" : passedGates >= 2 ? "MEDIUM" : "HIGH";

  // Build reasoning
  const activeSignals = signals.filter(s => s.direction !== "NEUTRAL");
  const reasoning = suggestion === "HOLD"
    ? `${activeSignals.length} active signals but risk gates not passed (${passedGates}/${totalGates}). Consider waiting for a clearer setup.`
    : `${activeSignals.length} signals suggest ${suggestion}. Risk gates: ${passedGates}/${totalGates} passed. Consensus score: ${consensusScore.toFixed(0)}.`;

  return {
    suggestion,
    confidence,
    reasoning,
    signals,
    riskGates,
    riskLevel,
    consensusScore: Math.round(consensusScore),
    source: "heuristic",
  };
}

// ========== GROQ LLM ==========

async function callGroq(prompt: string): Promise<string> {
  if (!GROQ_API_KEY) return "";

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
      max_tokens: 500,
    }),
  });

  if (!res.ok) return "";
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// ========== API ROUTE ==========

export async function POST(req: NextRequest) {
  try {
    const { market, userState } = (await req.json()) as { market: MarketData; userState?: any };

    if (!market) {
      return NextResponse.json({ error: "Market data required" }, { status: 400 });
    }

    // Try Groq LLM for enhanced reasoning
    const signalSummary = [momentumSignal(market), volatilitySignal(market), probabilitySignal(market)]
      .map(s => `${s.name}: ${s.direction} (${s.strength}%, ${s.confidence}% confidence) — ${s.reasoning}`)
      .join("\n");

    const prompt = `You are a prediction market risk manager. Analyze these signals and risk gates for a BTC event contract.

Market: ${market.symbol}
UP Probability: ${market.upProbability}%
Current Price: $${market.currentPrice || "unknown"}

Signal Agents:
${signalSummary}

Respond in JSON only:
{"suggestion": "UP" or "DOWN" or "HOLD", "confidence": 0-100, "reasoning": "brief risk-adjusted reason", "riskLevel": "LOW" or "MEDIUM" or "HIGH"}`;

    let result: CopilotResponse;

    const llmResponse = await callGroq(prompt);
    if (llmResponse) {
      try {
        const cleaned = llmResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);

        // Merge LLM with heuristic analysis
        const heuristic = heuristicAnalysis(market, userState);
        result = {
          ...heuristic,
          suggestion: parsed.suggestion || heuristic.suggestion,
          confidence: Math.min(85, Math.max(30, parsed.confidence || heuristic.confidence)),
          reasoning: parsed.reasoning || heuristic.reasoning,
          riskLevel: parsed.riskLevel || heuristic.riskLevel,
          source: "ai",
        };
      } catch {
        result = heuristicAnalysis(market, userState);
      }
    } else {
      result = heuristicAnalysis(market, userState);
    }

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
