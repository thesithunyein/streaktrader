"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import { MouseParallax, InteractiveText, CursorGlow } from "@/components/MouseEffect";
import {
  Zap, Shield, TrendingUp, Activity, ArrowRight, Flame,
  Trophy, BarChart3, Clock, ChevronRight, Award, Share2, ShieldCheck, Brain,
} from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "One-Tap Trading", desc: "Pick UP or DOWN, set your stake, confirm. No order books, no complexity — just a prediction." },
  { icon: Brain, title: "AI Copilot", desc: "AI-powered market analysis suggests UP or DOWN with confidence scores and reasoning. Your edge in every trade." },
  { icon: Flame, title: "Streak Multiplier", desc: "Every consecutive win grows your multiplier. The longer your streak, the higher your payout on every trade." },
  { icon: ShieldCheck, title: "Streak Shield", desc: "Protect your streak from a single loss. Free shields refresh daily — or buy extra for peace of mind." },
  { icon: Award, title: "Prediction Score", desc: "Your 0-100 skill rating based on win rate, streak, and consistency. Share it to prove your edge." },
  { icon: Share2, title: "Shareable Streak Cards", desc: "One-tap export your streak as a beautiful image. Share on Twitter, challenge friends to beat you." },
  { icon: Clock, title: "Live Settlement", desc: "Watch real-time BTC price during settlement. Feel every second as the countdown ticks." },
];

const STEPS = [
  { num: "01", title: "Connect Wallet", desc: "One click to connect. No sign-up, no emails, no KYC." },
  { num: "02", title: "Pick a Market", desc: "Browse live BTC and ETH event contracts with 15-minute and 1-hour windows." },
  { num: "03", title: "Make Your Call", desc: "Will the price close UP or DOWN? Choose your side with one tap." },
  { num: "04", title: "Build Your Streak", desc: "Win consecutive trades to grow your multiplier and maximize earnings." },
];

const STATS = [
  { value: "$0", label: "Trading Fees" },
  { value: "15m", label: "Settlement Windows" },
  { value: "1x–∞", label: "Streak Multiplier" },
  { value: "100%", label: "On-Chain Settlement" },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      <CursorGlow />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        <AnimatedBackground />
        <MouseParallax className="max-w-5xl mx-auto px-4 pt-20 pb-16 sm:pt-24 sm:pb-24 text-center relative z-10 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/[0.08] border border-accent/15 mb-8">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-semibold text-accent tracking-wide">Live on Shannon Testnet</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="text-5xl sm:text-6xl lg:text-[5.5rem] font-extrabold text-text mb-7 leading-[1.08] tracking-tight">
            <InteractiveText text="Build your streak." className="block" />
            <span className="block text-gradient mt-1"><InteractiveText text="Ride the wave." /></span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="text-lg sm:text-xl text-text-dim max-w-2xl mx-auto mb-10 leading-relaxed">
            Predict BTC and ETH price movements. Win consecutive trades to grow your streak
            multiplier. Zero fees, instant on-chain settlement.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/app" className="btn-primary px-9 py-4 rounded-2xl text-base font-bold text-white flex items-center gap-2.5 shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 transition-all">
              Start Trading <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="https://github.com/thesithunyein/streaktrader" target="_blank" rel="noopener noreferrer"
              className="px-9 py-4 rounded-2xl text-base font-bold text-text-dim border border-border hover:border-accent/30 hover:text-text hover:bg-white/60 transition-all flex items-center gap-2 backdrop-blur-sm">
              View Source <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold font-mono text-gradient">{stat.value}</div>
                <div className="text-xs text-text-dim mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </MouseParallax>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">How it works</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text mt-3">From zero to streak in four taps</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STEPS.map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-5 sm:p-6 card-hover relative">
              <div className="text-5xl font-black text-accent/10 absolute top-4 right-4">{step.num}</div>
              <div className="text-sm font-bold text-accent mb-2">Step {step.num}</div>
              <div className="text-base sm:text-lg font-bold text-text mb-2">{step.title}</div>
              <div className="text-sm text-text-dim leading-relaxed">{step.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text mt-3">Built for serious traders</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((feat, i) => (
            <motion.div key={feat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-5 sm:p-6 card-hover group">
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-colors">
                <feat.icon className="w-5 h-5 text-accent" />
              </div>
              <div className="text-base font-bold text-text mb-2">{feat.title}</div>
              <div className="text-sm text-text-dim leading-relaxed">{feat.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Built on Somnia */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">Powered by</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-text mt-3 mb-4">DreamDEX Event Contracts</h2>
          <p className="text-text-dim max-w-xl mx-auto mb-8 leading-relaxed">
            Every trade settles on-chain via Somnia&apos;s high-performance L1.
            Zero fees, provably fair, fully transparent. No custody, no counterparty risk.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://docs.dreamdex.io/developers/event-contracts" target="_blank" rel="noopener noreferrer"
              className="btn-primary px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2">
              Read the Docs <ArrowRight className="w-4 h-4" />
            </a>
            <a href="https://somnia.network" target="_blank" rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl text-sm font-bold text-text-dim border border-border hover:border-accent/30 transition-all">
              Somnia Network
            </a>
          </div>
        </motion.div>
      </section>

      {/* Business Model */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">Built for Growth</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text mt-3">How StreakTrader sustains</h2>
        </motion.div>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {[
            { icon: Zap, title: "Free to Trade", desc: "Zero fees on all trades. StreakTrader is free for everyone — no hidden costs, no minimums." },
            { icon: Trophy, title: "Premium Analytics", desc: "Advanced streak tracking, historical performance, and market intelligence for power users." },
            { icon: TrendingUp, title: "Viral Growth", desc: "Shareable streak cards drive organic acquisition. Every share brings new traders to DreamDEX." },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center card-hover">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-accent" />
              </div>
              <div className="text-base font-bold text-text mb-2">{item.title}</div>
              <div className="text-sm text-text-dim leading-relaxed">{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">Ready to trade?</h2>
          <p className="text-text-dim mb-8 max-w-lg mx-auto">
            Start predicting. Build your streak. Multiply your earnings.
          </p>
          <Link href="/app" className="inline-flex btn-primary px-10 py-4 rounded-2xl text-lg font-bold text-white items-center gap-2 shadow-lg shadow-accent/20">
            Start Trading <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
