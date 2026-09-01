<div align="center">

<img src="public/logo.png" alt="StreakTrader Logo" width="120" />

# StreakTrader 🔥

**Build your streak. Ride the wave.**

The prediction market trading app where every win builds your streak and multiplies your earnings.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://streaktrader.sithunyein.com)
[![Built on Somnia](https://img.shields.io/badge/Built%20on-Somnia-blue?style=flat-square)](https://somnia.network)
[![DreamDEX](https://img.shields.io/badge/Powered%20by-DreamDEX-purple?style=flat-square)](https://dreamdex.io)

**[Live App](https://streaktrader.sithunyein.com)** · **[GitHub](https://github.com/thesithunyein/streaktrader)**

</div>

---

## What is StreakTrader?

StreakTrader is a consumer-facing prediction market app that makes trading Bitcoin and Ethereum event contracts engaging through a streak-based gamification system. Every correct prediction extends your streak. Your streak grows your multiplier. Your multiplier multiplies your earnings.

## Features

- **Live Market Feed** — Real-time BTC and ETH event contracts with live probability bars
- **One-Click Trading** — Pick UP or DOWN, set your stake, trade instantly
- **Streak Mechanic** — Consecutive wins build your streak and increase your payout multiplier
- **Settlement Countdown** — Tension-building countdown with live price tracking
- **Win/Lose Reveals** — Confetti on wins, clean reset on losses
- **Lock Streak** — Cash out your multiplier earnings without risking the next trade
- **Trade History** — Track your streak progress, win rate, and P&L
- **Premium Dark UI** — Glass morphism, gradient buttons, micro-interactions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Animation | Canvas Confetti |
| Blockchain | @somnia-chain/markets-sdk v0.28+ |
| Network | Somnia Shannon Testnet (Chain 50312) |

## Getting Started

```bash
# Clone
git clone https://github.com/thesithunyein/streaktrader.git
cd streaktrader

# Install
npm install

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Connect your wallet** to Shannon Testnet
2. **Pick a live market** — BTC or ETH, 15-min or 1-hour window
3. **Choose UP or DOWN** — will the price close above or below the opening price?
4. **Set your stake** — 1 to 50 tUSDC
5. **Wait for settlement** — watch the countdown with live price tracking
6. **Win → streak grows, multiplier increases** · **Lose → streak resets to 0**

## Built For

- [Somnia × DreamDEX Event Contracts Hackathon](https://dorahacks.io/hackathon/event-contracts)
- Powered by [DreamDEX Event Contracts](https://docs.dreamdex.io/developers/event-contracts)
- Built on [Somnia Shannon Testnet](https://testnet.somnia.network)

## License

MIT
