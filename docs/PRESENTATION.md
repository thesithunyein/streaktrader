# StreakTrader — Hackathon Presentation

## Slide 1: Title

**StreakTrader**
*Predict. Win. Streak. Multiply.*

Built for the Somnia × DreamDEX Event Contracts Hackathon

---

## Slide 2: The Problem

Prediction markets are **boring and intimidating**.

- Complex trading interfaces scare away beginners
- No social features — you trade alone
- No motivation to keep trading after a few bets
- No way to prove your skill to others

**Event contracts have massive potential, but the current UX limits adoption.**

---

## Slide 3: The Solution

StreakTrader makes prediction markets **social, emotional, and rewarding**.

- **One-tap trading** — Pick UP or DOWN, set stake, done
- **Streak multiplier** — Consecutive wins grow your payout
- **Prediction Score** — Your 0-100 skill rating, on-chain verified
- **Streak Shield** — Protect your streak from one loss
- **AI Copilot** — 3 signal agents suggest UP/DOWN with confidence
- **Shareable cards** — Export your streak as a beautiful image

---

## Slide 4: Key Features

| Feature | What It Does | On-Chain? |
|---------|-------------|-----------|
| Streak Multiplier | 1x → 2x → 3x on consecutive wins | ✅ StreakRegistry |
| Prediction Score | 0-100 skill rating | ✅ ScoreOracle |
| Streak Shield | Protect streak from one loss | ✅ ShieldManager |
| AI Copilot | 3 signal agents + 5 risk gates | API |
| Shareable Cards | One-tap export for Twitter | Client-side |
| Leaderboard | Ranked by prediction score | ✅ API + On-chain |

---

## Slide 5: Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Trade    │  │ Settlement│  │  Leaderboard     │  │
│  │  Panel    │  │  View     │  │  (on-chain read) │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       │              │                  │             │
│  ┌────┴──────────────┴──────────────────┴─────────┐  │
│  │              TradeProvider                      │  │
│  │  ┌─────────────┐  ┌──────────────────────────┐ │  │
│  │  │ useExchange  │  │     useOnChain            │ │  │
│  │  │ (SDK trade)  │  │  (4 Smart Contracts)      │ │  │
│  └──┴─────────────┴──┴──────────────────────────┘  │
└────────────┼───────────────────────┼────────────────┘
             │                       │
    ┌────────┴────────┐    ┌─────────┴──────────┐
    │  DreamDEX SDK   │    │  Somnia Blockchain  │
    │  (Markets,      │    │  (4 Smart Contracts)│
    │   Orders,       │    │  Chain 50312        │
    │   Settlement)   │    │                     │
    └─────────────────┘    └─────────────────────┘
```

---

## Slide 6: Smart Contracts

| Contract | Purpose | Functions |
|----------|---------|-----------|
| **StreakRegistry** | On-chain streak tracking | `recordTrade`, `getRecord`, `resetStreak` |
| **ShieldManager** | Shield minting/burning | `claimFreeShield`, `activateShield`, `getShieldState` |
| **ChallengeArena** | Head-to-head challenges | `createChallenge`, `acceptChallenge`, `settleChallenge` |
| **ScoreOracle** | Prediction score computation | `updateScore`, `getScore`, `getScoreData` |

**All 4 contracts deployed to Shannon Testnet (Chain 50312)**

---

## Slide 7: AI Copilot

**3 Signal Agents:**
- **MOMENTUM** — EMA 9/21 crossover + ROC-30
- **VOLATILITY** — Z-score + regime classifier
- **PROBABILITY** — Market-implied edge + contrarian signal

**5 Risk Gates:**
- Min Signal Confidence (≥40%)
- Signal Consensus (≥2/3 agreement)
- Probability Edge (≥5% from neutral)
- Trade Cooldown
- Max Positions (3 concurrent)

**Result:** AI suggests UP/DOWN with confidence, reasoning, and risk level.

---

## Slide 8: User Experience

1. **Connect Wallet** — One click, no sign-up, no KYC
2. **Browse Markets** — Live BTC/ETH event contracts
3. **Get AI Suggestion** — 3 agents analyze, 5 gates vet
4. **Place Trade** — One tap, UP or DOWN
5. **Watch Settlement** — Live BTC price chart, countdown
6. **Build Streak** — Win consecutive trades, multiplier grows
7. **Share** — Export streak card, challenge friends

**Mobile-first, premium dark theme, Framer Motion animations.**

---

## Slide 9: Business Model

| Revenue Stream | How It Works |
|---------------|-------------|
| **Premium Analytics** | Advanced streak tracking, historical performance |
| **Shield Sales** | Buy extra shields for 1 tUSDC each |
| **Viral Growth** | Shareable cards drive organic acquisition |

**Zero trading fees. Revenue from value-added features.**

---

## Slide 10: Technical Depth

| Metric | Count |
|--------|-------|
| Smart Contracts | 4 |
| Unit Tests | 21 (all passing) |
| API Routes | 3 (copilot, streak, leaderboard) |
| Frontend Components | 15+ |
| On-chain Functions | 12 |
| Lines of Solidity | ~450 |
| Lines of TypeScript | ~5,000 |

---

## Slide 11: What Makes Us Different

| Competitor | They Have | We Have |
|-----------|-----------|---------|
| Market Dungeon | Game mechanics | Consumer trading UX |
| DreamDesk | AI autonomy | AI + social + gamification |
| Sigma | Fair-value pricing | Streaks + shields + scores |
| Let It Ride | Auto-streaks | On-chain streaks + sharing |

**We're the only project combining AI + gamification + social features + consumer UX.**

---

## Slide 12: Impact

- **Consumer-facing** — Anyone can use it, not just traders
- **Viral sharing** — Streak cards drive organic growth
- **On-chain verification** — Trustless, transparent
- **Business model** — Sustainable revenue streams
- **Ecosystem growth** — Brings new users to DreamDEX

---

## Slide 13: Future Vision

- **Multi-asset expansion** — ETH, SOL, and more
- **Social feed** — See friends' streaks and trades
- **Tournaments** — Weekly competitions with prizes
- **Mobile app** — Native iOS/Android
- **Mainnet deployment** — Production-ready on Somnia

---

## Slide 14: Demo Links

- **Live App:** https://streaktrader.sithunyein.com
- **GitHub:** https://github.com/thesithunyein/streaktrader
- **SDK Feedback:** docs/SDK_FEEDBACK_REPORT.md
- **Contracts:** Shannon Testnet (Chain 50312)

---

## Slide 15: Thank You

**StreakTrader** — Predict. Win. Streak. Multiply.

Built on Somnia + DreamDEX Event Contracts

*Made with ❤️ by Sithu Nyein*
