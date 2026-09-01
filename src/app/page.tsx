"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Zap,
  Shield,
  TrendingUp,
  Activity,
  ArrowRight,
  Flame,
  Trophy,
  BarChart3,
  Clock,
  ChevronRight,
  Star,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "One-Click Trading",
    desc: "Pick UP or DOWN. Set your stake. Trade instantly. No order books, no complexity.",
  },
  {
    icon: Flame,
    title: "Streak Multiplier",
    desc: "Win consecutive trades to build your streak. Higher streaks mean higher payouts.",
  },
  {
    icon: Clock,
    title: "Live Settlement",
    desc: "Watch real-time countdowns with live price tracking. Feel every second of tension.",
  },
  {
    icon: Shield,
    title: "Zero Fees",
    desc: "No entry, settlement, or winnings fees. Your stake is your maximum risk.",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    desc: "Compete with traders worldwide. Climb the ranks. Prove your edge.",
  },
  {
    icon: BarChart3,
    title: "Track Everything",
    desc: "Full trade history, streak progress, win rate analytics, and P&L tracking.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Connect Wallet",
    desc: "One click to connect your wallet to Shannon Testnet. No sign-up required.",
  },
  {
    num: "02",
    title: "Pick a Market",
    desc: "Browse live BTC and ETH event contracts. 15-minute and 1-hour windows.",
  },
  {
    num: "03",
    title: "Choose Your Side",
    desc: "Will the price close UP or DOWN? Make your call with one tap.",
  },
  {
    num: "04",
    title: "Build Your Streak",
    desc: "Win consecutive trades. Your multiplier grows. Your earnings multiply.",
  },
];

const STATS = [
  { value: "Zero", label: "Trading Fees" },
  { value: "15min", label: "Fastest Windows" },
  { value: "1x–∞", label: "Streak Multiplier" },
  { value: "100%", label: "On-Chain Settlement" },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 rounded-3xl overflow-hidden relative mx-auto mb-8 shadow-2xl shadow-accent/20"
          >
            <Image src="/logo.png" alt="StreakTrader" fill className="object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-accent">
              Live on Shannon Testnet
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-text mb-6 leading-tight"
          >
            Build your streak.
            <br />
            <span className="text-gradient">Ride the wave.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-text-dim max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The prediction market app where every correct call extends your streak
            and multiplies your earnings. Trade Bitcoin and Ethereum event
            contracts on DreamDEX — zero fees, instant settlement, pure skill.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/app"
              className="btn-primary px-8 py-4 rounded-2xl text-base font-bold text-white flex items-center gap-2 shadow-lg shadow-accent/20"
            >
              Start Trading
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://github.com/thesithunyein/streaktrader"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-2xl text-base font-bold text-text-dim border border-border hover:border-accent/30 hover:text-text transition-all flex items-center gap-2"
            >
              View Source
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold font-mono text-gradient">
                  {stat.value}
                </div>
                <div className="text-xs text-text-dim mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">
            How it works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text mt-3">
            From zero to streak in four taps
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 card-hover relative"
            >
              <div className="text-5xl font-black text-accent/10 absolute top-4 right-4">
                {step.num}
              </div>
              <div className="text-sm font-bold text-accent mb-2">
                Step {step.num}
              </div>
              <div className="text-lg font-bold text-text mb-2">{step.title}</div>
              <div className="text-sm text-text-dim leading-relaxed">
                {step.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text mt-3">
            Everything you need to trade smarter
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6 card-hover group"
            >
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-colors">
                <feat.icon className="w-5 h-5 text-accent" />
              </div>
              <div className="text-base font-bold text-text mb-2">
                {feat.title}
              </div>
              <div className="text-sm text-text-dim leading-relaxed">
                {feat.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Built on Somnia */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative">
            <span className="text-xs font-semibold text-accent uppercase tracking-widest">
              Powered by
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-text mt-3 mb-4">
              Built on DreamDEX Event Contracts
            </h2>
            <p className="text-text-dim max-w-xl mx-auto mb-8 leading-relaxed">
              Every trade settles on-chain via Somnia&apos;s high-performance L1.
              Zero fees, provably fair settlement, and complete transparency.
              Your trades are yours — no custody, no counterparty risk.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://docs.dreamdex.io/developers/event-contracts"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2"
              >
                Read the Docs
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://somnia.network"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl text-sm font-bold text-text-dim border border-border hover:border-accent/30 transition-all"
              >
                Somnia Network
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
            Ready to build your streak?
          </h2>
          <p className="text-text-dim mb-8 max-w-lg mx-auto">
            Join the next generation of prediction market traders. Zero fees.
            Instant settlement. Pure skill.
          </p>
          <Link
            href="/app"
            className="inline-flex btn-primary px-10 py-4 rounded-2xl text-lg font-bold text-white items-center gap-2 shadow-lg shadow-accent/20"
          >
            Start Trading
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
