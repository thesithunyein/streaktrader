"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowUp, ArrowDown, Pause, Shield, AlertTriangle, Loader2, Sparkles, ChevronRight, X, Activity, Gauge, CheckCircle, XCircle, Zap } from "lucide-react";

interface Signal {
  name: string;
  direction: "UP" | "DOWN" | "NEUTRAL";
  strength: number;
  confidence: number;
  reasoning: string;
}

interface RiskGate {
  name: string;
  passed: boolean;
  reason: string;
}

interface CopilotResult {
  suggestion: "UP" | "DOWN" | "HOLD";
  confidence: number;
  reasoning: string;
  signals: Signal[];
  riskGates: RiskGate[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  consensusScore: number;
  source: "ai" | "heuristic";
}

interface CopilotSidebarProps {
  market: {
    symbol: string;
    underlying: string;
    window: string;
    upProbability: number;
    currentPrice?: number;
  };
  onSuggestion?: (suggestion: "UP" | "DOWN") => void;
}

export default function CopilotSidebar({ market, onSuggestion }: CopilotSidebarProps) {
  const [result, setResult] = useState<CopilotResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ market }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Failed to analyze");
    } finally {
      setLoading(false);
    }
  }, [market]);

  const suggestionColor = (s: string) => {
    if (s === "UP") return "text-up";
    if (s === "DOWN") return "text-down";
    return "text-slate-500";
  };

  const suggestionBg = (s: string) => {
    if (s === "UP") return "bg-up/10 border-up/20";
    if (s === "DOWN") return "bg-down/10 border-down/20";
    return "bg-slate-50 border-slate-200";
  };

  const signalIcon = (d: string) => {
    if (d === "UP") return <ArrowUp className="w-4 h-4 text-up" />;
    if (d === "DOWN") return <ArrowDown className="w-4 h-4 text-down" />;
    return <Pause className="w-4 h-4 text-slate-500" />;
  };

  const passedGates = result?.riskGates?.filter(g => g.passed).length ?? 0;
  const totalGates = result?.riskGates?.length ?? 0;

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setIsOpen(true); if (!result) analyze(); }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-blue-600 text-white shadow-lg shadow-accent/30 flex items-center justify-center hover:shadow-xl hover:shadow-accent/40 transition-shadow"
      >
        <Brain className="w-6 h-6" />
      </motion.button>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-200 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">AI Copilot</div>
                    <div className="text-[10px] text-slate-500">3 agents · 5 risk gates</div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Market Info */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Analyzing</span>
                    <span className="text-xs font-medium text-accent">{market.window}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{market.symbol}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>UP: {market.upProbability.toFixed(0)}%</span>
                    <span>DOWN: {(100 - market.upProbability).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Loading */}
                {loading && (
                  <div className="flex flex-col items-center py-8 gap-3">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                    <div className="text-sm text-slate-500">Running 3 signal agents...</div>
                    <div className="text-[10px] text-slate-400">Checking momentum, volatility, probability</div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="p-4 rounded-xl bg-down/5 border border-down/15">
                    <div className="text-sm text-down font-medium">Analysis failed</div>
                    <div className="text-xs text-slate-500 mt-1">{error}</div>
                    <button onClick={analyze} className="mt-2 text-xs text-accent font-medium hover:underline">Try again</button>
                  </div>
                )}

                {/* Result */}
                {result && !loading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                    {/* Suggestion Card */}
                    <div className={`rounded-2xl p-5 border-2 ${suggestionBg(result.suggestion)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-accent" />
                          <span className="text-xs font-semibold text-accent uppercase tracking-wider">Suggestion</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            result.source === "ai" ? "bg-accent/10 text-accent" : "bg-slate-100 text-slate-500"
                          }`}>
                            {result.source === "ai" ? "AI" : "Heuristic"}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            result.riskLevel === "LOW" ? "bg-up/10 text-up" : result.riskLevel === "MEDIUM" ? "bg-yellow-500/10 text-yellow-600" : "bg-down/10 text-down"
                          }`}>
                            {result.riskLevel} RISK
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                          result.suggestion === "UP" ? "bg-up/15" : result.suggestion === "DOWN" ? "bg-down/15" : "bg-slate-100"
                        }`}>
                          {result.suggestion === "UP" ? <ArrowUp className="w-8 h-8 text-up" /> :
                           result.suggestion === "DOWN" ? <ArrowDown className="w-8 h-8 text-down" /> :
                           <Pause className="w-8 h-8 text-slate-500" />}
                        </div>
                        <div>
                          <div className={`text-2xl font-black ${suggestionColor(result.suggestion)}`}>{result.suggestion}</div>
                          <div className="text-xs text-slate-500">{result.confidence}% confidence</div>
                        </div>
                        <div className="ml-auto text-right">
                          <div className="text-xs text-slate-500">Consensus</div>
                          <div className={`text-lg font-bold font-mono ${result.consensusScore > 0 ? "text-up" : result.consensusScore < 0 ? "text-down" : "text-slate-500"}`}>
                            {result.consensusScore > 0 ? "+" : ""}{result.consensusScore}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 h-2 rounded-full bg-white/50 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className={`h-full rounded-full ${result.suggestion === "UP" ? "bg-up" : result.suggestion === "DOWN" ? "bg-down" : "bg-slate-300"}`}
                        />
                      </div>
                    </div>

                    {/* Signal Agents */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-accent" />
                        <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Signal Agents</span>
                      </div>
                      <div className="space-y-2.5">
                        {result.signals.map((signal) => (
                          <div key={signal.name} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                              {signalIcon(signal.direction)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">{signal.name}</span>
                                <span className={`text-[10px] font-medium ${
                                  signal.direction === "UP" ? "text-up" : signal.direction === "DOWN" ? "text-down" : "text-slate-500"
                                }`}>
                                  {signal.direction}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">{signal.reasoning}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-xs font-bold font-mono text-slate-900">{signal.strength}%</div>
                              <div className="text-[10px] text-slate-400">str</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk Gates */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-accent" />
                          <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Risk Gates</span>
                        </div>
                        <span className={`text-xs font-bold ${passedGates >= 4 ? "text-up" : passedGates >= 2 ? "text-yellow-600" : "text-down"}`}>
                          {passedGates}/{totalGates} passed
                        </span>
                      </div>
                      <div className="space-y-2">
                        {result.riskGates.map((gate) => (
                          <div key={gate.name} className="flex items-center gap-2">
                            {gate.passed ? (
                              <CheckCircle className="w-3.5 h-3.5 text-up shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-down shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium text-slate-900">{gate.name}</span>
                              <span className="text-[10px] text-slate-500 ml-1.5">{gate.reason}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Reasoning</div>
                      <div className="text-sm text-slate-900 leading-relaxed">{result.reasoning}</div>
                    </div>

                    {/* Apply Suggestion */}
                    {result.suggestion !== "HOLD" && onSuggestion && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSuggestion(result.suggestion as "UP" | "DOWN")}
                        className={`w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 ${
                          result.suggestion === "UP" ? "bg-up hover:bg-up/90" : "bg-down hover:bg-down/90"
                        }`}
                      >
                        <Zap className="w-4 h-4" /> Trade {result.suggestion} with AI Suggestion
                      </motion.button>
                    )}

                    <button onClick={analyze} className="w-full py-2.5 rounded-xl text-xs font-medium text-accent bg-accent/5 border border-accent/15 hover:bg-accent/10 transition-colors">
                      Re-analyze Market
                    </button>

                    <div className="text-[10px] text-slate-400 text-center leading-relaxed">
                      AI suggestions are for informational purposes only. Not financial advice. Always DYOR.
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
