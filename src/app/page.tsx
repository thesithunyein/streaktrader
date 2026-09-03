"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Zap, Shield, TrendingUp, ArrowRight, Flame,
  Trophy, Clock, Award, Share2, ShieldCheck, Brain,
} from "lucide-react";

function Animate({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "scale";
}) {
  const dirMap: Record<string, string> = {
    up: "animate-fade-up",
    down: "animate-fade-down",
    left: "animate-fade-left",
    right: "animate-fade-right",
    scale: "animate-fade-scale",
  };
  return (
    <div
      className={`opacity-0 ${dirMap[direction]} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const FEATURES = [
  { icon: Zap, title: "One-Tap Trading", desc: "Pick UP or DOWN, set your stake, confirm. No order books, no complexity." },
  { icon: Brain, title: "AI Copilot", desc: "AI-powered market analysis suggests UP or DOWN with confidence scores." },
  { icon: Flame, title: "Streak Multiplier", desc: "Every consecutive win grows your multiplier. The longer your streak, the higher your payout." },
  { icon: ShieldCheck, title: "Streak Shield", desc: "Protect your streak from a single loss. Free shields refresh daily." },
  { icon: Award, title: "Prediction Score", desc: "Your 0-100 skill rating based on win rate, streak, and consistency." },
  { icon: Share2, title: "Shareable Cards", desc: "One-tap export your streak as a beautiful image. Share on Twitter." },
  { icon: Clock, title: "Live Settlement", desc: "Watch real-time BTC price during settlement. Feel every second." },
];

// Text colors for white cards on dark background
const CARD_TEXT = "#0f172a";
const CARD_TEXT_DIM = "#64748b";

const STEPS = [
  { num: "01", title: "Connect Wallet", desc: "One click to connect. No sign-up, no emails, no KYC." },
  { num: "02", title: "Pick a Market", desc: "Browse live BTC and ETH event contracts with 15-minute windows." },
  { num: "03", title: "Make Your Call", desc: "Will the price close UP or DOWN? Choose your side with one tap." },
  { num: "04", title: "Build Your Streak", desc: "Win consecutive trades to grow your multiplier and maximize earnings." },
];

const BAR_HEIGHTS = [
  23, 40, 53, 40, 33, 14, 7, 17, 75, 65,
  88, 75, 65, 47, 33, 88, 4, 7, 9, 14,
  95, 65, 79, 37, 7, 40, 17, 20, 62, 47,
  92, 72,
];

function StreakCard() {
  const maxHeight = Math.max(...BAR_HEIGHTS);
  return (
    <Animate delay={900} direction="scale" className="w-full max-w-[405px] mx-auto lg:mx-0">
      <div className="w-full rounded-[24px] sm:rounded-[33px] glass p-5 sm:p-8 pb-5 sm:pb-6">
        <p className="text-[16px] sm:text-[20px] font-[450] leading-[20px] mb-3 sm:mb-4" style={{color: CARD_TEXT}}>Streak Performance</p>
        <p className="mb-2 sm:mb-3">
          <span className="text-[28px] sm:text-[46px] font-[450] leading-[1]" style={{color: CARD_TEXT}}>5x</span>
          <span className="text-[28px] sm:text-[46px] font-[450] leading-[1]" style={{color: CARD_TEXT_DIM, opacity: 0.4}}> current</span>
        </p>
        <div className="flex items-center gap-[10px] mb-6 sm:mb-8">
          <span className="px-[6px] py-[7px] bg-accent/10 rounded-[6px] text-accent text-[12px] sm:text-[14px] font-[450] leading-[14px]">+32.4%</span>
          <span className="text-[12px] sm:text-[14px] font-[450] leading-[14px]" style={{color: CARD_TEXT_DIM, opacity: 0.7}}>win rate this session</span>
        </div>
        <div className="relative">
          <div className="flex items-end gap-[1.5px] h-[80px] sm:h-[100px]">
            {BAR_HEIGHTS.map((h, i) => {
              const isProjected = i >= 28;
              const heightPercent = (h / maxHeight) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-[0.5px] animate-bar-grow origin-bottom"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: isProjected ? "rgba(37,99,235,0.1)" : "#2563eb",
                    animationDelay: `${1100 + i * 30}ms`,
                  }}
                />
              );
            })}
          </div>
          <div className="absolute inset-0 pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-slate-200"
                style={{ left: `${((i + 1) / 5) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-3">
            {["10:00", "12:00", "14:00", "16:00", "16:00"].map((t, i) => (
              <span
                key={i}
                className="text-[9px] sm:text-[10px] font-[450] leading-[10px]" style={{color: CARD_TEXT_DIM, opacity: i >= 3 ? 0.4 : 1}}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Animate>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative w-full h-screen overflow-hidden bg-[#080A19]">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260813_092641_de52eb87-daf2-41db-92cb-7a56eae012a5.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="relative z-10 h-full flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center py-8">
            <div className="w-full max-w-[1800px] mx-auto px-5 sm:px-8 md:px-[82px] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-12">
              <div className="max-w-[593px]">
                <Animate delay={300} direction="up">
                  <h1 className="text-white text-[36px] sm:text-[52px] md:text-[64px] lg:text-[72px] font-normal leading-[0.95] mb-5 sm:mb-8">
                    Build your streak.
                    <br />
                    <span className="text-gradient">Ride the wave.</span>
                  </h1>
                </Animate>
                <Animate delay={500} direction="up">
                  <p className="text-white/80 text-[16px] sm:text-[18px] md:text-[20px] font-[450] leading-[1.3] max-w-[370px] mb-7 sm:mb-10">
                    Predict BTC and ETH price movements. Win consecutive trades to grow your streak multiplier. Zero fees, instant settlement.
                  </p>
                </Animate>
                <Animate delay={700} direction="up">
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <Link
                      href="/app"
                      className="h-[46px] sm:h-[51px] px-5 sm:px-[27px] btn-primary rounded-[12px] text-white text-[14px] sm:text-[15.5px] font-[450] leading-[15.5px] flex items-center gap-2"
                    >
                      Start Trading <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href="https://github.com/thesithunyein/streaktrader"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-[46px] sm:h-[51px] px-5 sm:px-[27px] rounded-[12px] border border-white text-white text-[14px] sm:text-[15.5px] font-[450] leading-[15.5px] flex items-center gap-2 transition-opacity hover:opacity-80"
                    >
                      View Source
                    </a>
                  </div>
                </Animate>
              </div>
              <StreakCard />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <Animate delay={0} direction="up" className="text-center mb-12">
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">How it works</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">From zero to streak in four taps</h2>
        </Animate>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STEPS.map((step, i) => (
            <Animate key={step.num} delay={200 + i * 100} direction="up">
              <div className="glass rounded-[20px] p-5 sm:p-6 card-hover relative">
                <div className="text-5xl font-black text-slate-100 absolute top-4 right-4">{step.num}</div>
                <div className="text-sm font-bold text-accent mb-2">Step {step.num}</div>
                <div className="text-base sm:text-lg font-bold mb-2" style={{color: CARD_TEXT}}>{step.title}</div>
                <div className="text-sm leading-relaxed" style={{color: CARD_TEXT_DIM}}>{step.desc}</div>
              </div>
            </Animate>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <Animate delay={0} direction="up" className="text-center mb-12">
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">Built for serious traders</h2>
        </Animate>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((feat, i) => (
            <Animate key={feat.title} delay={200 + i * 80} direction="up">
              <div className="glass rounded-[20px] p-5 sm:p-6 card-hover group">
                <div className="w-11 h-11 rounded-[12px] bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-colors">
                  <feat.icon className="w-5 h-5 text-accent" />
                </div>
                <div className="text-base font-bold mb-2" style={{color: CARD_TEXT}}>{feat.title}</div>
                <div className="text-sm leading-relaxed" style={{color: CARD_TEXT_DIM}}>{feat.desc}</div>
              </div>
            </Animate>
          ))}
        </div>
      </section>

      {/* Powered by DreamDEX */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <Animate delay={0} direction="scale">
          <div className="glass rounded-[32px] p-8 sm:p-12 text-center relative overflow-hidden">
            <span className="text-xs font-semibold text-accent uppercase tracking-widest">Powered by</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-3 mb-4" style={{color: CARD_TEXT}}>DreamDEX Event Contracts</h2>
            <p className="max-w-xl mx-auto mb-8 leading-relaxed" style={{color: CARD_TEXT_DIM}}>
              Every trade settles on-chain via Somnia&apos;s high-performance L1.
              Zero fees, provably fair, fully transparent.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://docs.dreamdex.io/developers/event-contracts"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-6 py-3 rounded-[12px] text-sm font-bold text-white flex items-center gap-2"
              >
                Read the Docs <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://somnia.network"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-[12px] text-sm font-bold border border-slate-200 hover:border-accent/30 transition-all" style={{color: CARD_TEXT_DIM}}
              >
                Somnia Network
              </a>
            </div>
          </div>
        </Animate>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
        <Animate delay={0} direction="up">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Ready to trade?</h2>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto">
            Start predicting. Build your streak. Multiply your earnings.
          </p>
          <Link
            href="/app"
            className="inline-flex h-[51px] px-[27px] btn-primary rounded-[12px] text-white text-[15.5px] font-[450] items-center gap-2"
          >
            Start Trading <ArrowRight className="w-4 h-4" />
          </Link>
        </Animate>
      </section>

      <Footer />
    </div>
  );
}
