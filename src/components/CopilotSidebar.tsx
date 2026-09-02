"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowUp, ArrowDown, Pause, Shield, AlertTriangle, Loader2, Sparkles, ChevronRight, X } from "lucide-react";

interface CopilotResult {
  suggestion: "UP" | "DOWN" | "HOLD";
  confidence: number;
  reasoning: string;
  signals: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
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
    return "text-text-dim";
  };

  const suggestionBg = (s: string) => {
    if (s === "UP") return "bg-up/10 border-up/20";
    if (s === "DOWN") return "bg-down/10 border-down/20";
    return "bg-slate-50 border-border";
  };

  const riskColor = (r: string) => {
    if (r === "LOW") return "text-up";
    if (r === "MEDIUM") return "text-yellow-500";
    return "text-down";
  };

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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[380px] bg-white shadow-2xl border-l border-border overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-border px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text">AI Copilot</div>
                    <div className="text-[10px] text-text-dim">Market analysis</div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                  <X className="w-4 h-4 text-text-dim" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Market Info */}
                <div className="bg-slate-50 rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-text-dim">Analyzing</span>
                    <span className="text-xs font-medium text-accent">{market.window}</span>
                  </div>
                  <div className="text-sm font-bold text-text">{market.symbol}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-text-dim">
                    <span>UP: {market.upProbability.toFixed(0)}%</span>
                    <span>DOWN: {(100 - market.upProbability).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Loading */}
                {loading && (
                  <div className="flex flex-col items-center py-8 gap-3">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                    <div className="text-sm text-text-dim">Analyzing market...</div>
                    <div className="text-[10px] text-text-muted">Checking signals and patterns</div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="p-4 rounded-xl bg-down/5 border border-down/15">
                    <div className="text-sm text-down font-medium">Analysis failed</div>
                    <div className="text-xs text-text-dim mt-1">{error}</div>
                    <button onClick={analyze} className="mt-2 text-xs text-accent font-medium hover:underline">
                      Try again
                    </button>
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
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          result.source === "ai" ? "bg-accent/10 text-accent" : "bg-slate-100 text-text-dim"
                        }`}>
                          {result.source === "ai" ? "AI" : "Heuristic"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                          result.suggestion === "UP" ? "bg-up/15" : result.suggestion === "DOWN" ? "bg-down/15" : "bg-slate-100"
                        }`}>
                          {result.suggestion === "UP" ? (
                            <ArrowUp className="w-8 h-8 text-up" />
                          ) : result.suggestion === "DOWN" ? (
                            <ArrowDown className="w-8 h-8 text-down" />
                          ) : (
                            <Pause className="w-8 h-8 text-text-dim" />
                          )}
                        </div>
                        <div>
                          <div className={`text-2xl font-black ${suggestionColor(result.suggestion)}`}>
                            {result.suggestion}
                          </div>
                          <div className="text-xs text-text-dim">{result.confidence}% confidence</div>
                        </div>
                      </div>

                      {/* Confidence bar */}
                      <div className="mt-3 h-2 rounded-full bg-white/50 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className={`h-full rounded-full ${
                            result.suggestion === "UP" ? "bg-up" : result.suggestion === "DOWN" ? "bg-down" : "bg-slate-300"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-border">
                      <div className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-2">Reasoning</div>
                      <div className="text-sm text-text leading-relaxed">{result.reasoning}</div>
                    </div>

                    {/* Signals */}
                    {result.signals.length > 0 && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-border">
                        <div className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-2">Signals Detected</div>
                        <div className="space-y-2">
                          {result.signals.map((signal, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <ChevronRight className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                              <span className="text-xs text-text">{signal}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk Level */}
                    <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-border">
                      <div className="flex items-center gap-2">
                        {result.riskLevel === "HIGH" ? (
                          <AlertTriangle className="w-4 h-4 text-down" />
                        ) : (
                          <Shield className="w-4 h-4 text-up" />
                        )}
                        <span className="text-xs font-semibold text-text">Risk Level</span>
                      </div>
                      <span className={`text-sm font-bold ${riskColor(result.riskLevel)}`}>
                        {result.riskLevel}
                      </span>
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
                        Trade {result.suggestion} with AI Suggestion
                      </motion.button>
                    )}

                    {/* Re-analyze */}
                    <button
                      onClick={analyze}
                      className="w-full py-2.5 rounded-xl text-xs font-medium text-accent bg-accent/5 border border-accent/15 hover:bg-accent/10 transition-colors"
                    >
                      Re-analyze Market
                    </button>

                    {/* Disclaimer */}
                    <div className="text-[10px] text-text-muted text-center leading-relaxed">
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
