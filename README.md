<p align="center">
  <img src="public/logo.png" alt="StreakTrader Logo" width="150" />
</p>

<h1 align="center">StreakTrader</h1>

<p align="center">
  <strong>Predict. Win. Streak. Multiply.</strong>
</p>

<p align="center">
  <a href="https://streaktrader.sithunyein.com">
    <img src="https://img.shields.io/badge/Live%20Demo-streaktrader.sithunyein.com-blue?style=for-the-badge" alt="Live Demo" />
  </a>
  <a href="https://github.com/thesithunyein/streaktrader/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  </a>
  <a href="https://shannon-explorer.somnia.network/address/0x423b8701da3a251a3a3fc2d241b71e8d05744c91">
    <img src="https://img.shields.io/badge/Network-Shannon%20Testnet-purple?style=for-the-badge" alt="Network" />
  </a>
  <a href="https://github.com/thesithunyein/streaktrader/blob/main/SECURITY.md">
    <img src="https://img.shields.io/badge/Security-Policy-red?style=for-the-badge" alt="Security" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Smart%20Contracts-4%20Deployed-orange?style=flat-square" alt="Contracts" />
  <img src="https://img.shields.io/badge/Tests-21%20Passing-brightgreen?style=flat-square" alt="Tests" />
  <img src="https://img.shields.io/badge/SDK-DreamDEX-success?style=flat-square" alt="SDK" />
  <img src="https://img.shields.io/badge/AI-Copilot%20Integrated-yellow?style=flat-square" alt="AI" />
</p>

---

StreakTrader is a gamified prediction market platform built on [DreamDEX Event Contracts](https://docs.dreamdex.io/developers/event-contracts) and the [Somnia](https://somnia.network) blockchain. Users predict whether BTC or ETH will go UP or DOWN within 15-minute windows, building winning streaks that multiply their payouts.

Unlike traditional prediction market interfaces, StreakTrader wraps event contracts in an emotional, social experience — with on-chain streak tracking, streak shields, prediction scores, and shareable streak cards.

---

## What Makes StreakTrader Unique

| Feature | What It Does | On-Chain? |
|---------|-------------|-----------|
| **Streak Multiplier** | Consecutive wins grow your multiplier (1x, 2x, 3x...) | StreakRegistry |
| **Prediction Score** | 0-100 skill rating based on win rate, streak, volume, consistency | ScoreOracle |
| **Streak Shield** | Protect your streak from one loss. Free daily, max 3 stored | ShieldManager |
| **Head-to-Head Challenges** | Challenge a friend on the same market | ChallengeArena |
| **Shareable Streak Cards** | One-tap export beautiful streak images for Twitter | Client-side |
| **Live Price Chart** | Real-time BTC price during settlement countdown | Binance API |
| **AI Copilot** | Suggests UP/DOWN with confidence scores and risk analysis | API |

---

## Architecture

```
flowchart TB
    User[Trader] --> Frontend[StreakTrader App]
    Frontend --> Landing[Landing Page]
    Frontend --> Trading[Trading Page]
    Frontend --> Leaderboard[Leaderboard]
    Frontend --> History[Trade History]

    Trading --> Exchange[DreamDEX SDK]
    Trading --> AI[AI Copilot]
    Trading --> OnChain[On-Chain Contracts]

    Exchange --> MarketDiscovery[Market Discovery]
    Exchange --> OrderExecution[Order Execution]
    Exchange --> Settlement[Settlement Detection]

    OnChain --> StreakReg[StreakRegistry]
    OnChain --> ShieldMgr[ShieldManager]
    OnChain --> ChallengeA[ChallengeArena]
    OnChain --> ScoreOrc[ScoreOracle]

    AI --> Momentum[Momentum Signal]
    AI --> Volatility[Volatility Signal]
    AI --> Probability[Probability Signal]
    AI --> RiskGates[Risk Gates]

    StreakReg --> Blockchain[Somnia Shannon Testnet]
    ShieldMgr --> Blockchain
    ChallengeA --> Blockchain
    ScoreOrc --> Blockchain

    MarketDiscovery --> DreamDEX[DreamDEX Indexer]
    OrderExecution --> DreamDEX
    Settlement --> DreamDEX

    Landing --> AnimatedBG[Animated Canvas Background]
    Landing --> CursorGlow[Cursor Glow Effect]
```

### Data Flow

```
flowchart LR
    Connect[Connect Wallet] --> Select[Select Market]
    Select --> Predict[Predict UP or DOWN]
    Predict --> Execute[Execute Trade via SDK]
    Execute --> Watch[Watch Live BTC Price]
    Watch --> Settle[Settlement Window Closes]
    Settle --> Result{Win or Lose?}
    Result -->|Win| Streak[Streak Grows]
    Result -->|Lose| Shield{Shield Active?}
    Shield -->|Yes| Protect[Shield Absorbs Loss]
    Shield -->|No| Reset[Streak Resets]
    Streak --> Score[Score Updates On-Chain]
    Protect --> Score
    Reset --> Score
    Score --> Share[Share Streak Card]
```

---

## Deployed Contracts (Shannon Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| **StreakRegistry** | [`0x423b8701da3a251a3a3fc2d241b71e8d05744c91`](https://shannon-explorer.somnia.network/address/0x423b8701da3a251a3a3fc2d241b71e8d05744c91) | Records streak, bestStreak, totalTrades, wins per wallet |
| **ShieldManager** | [`0xec4efbe18915ed9bb78e928dd637134c1456b7e3`](https://shannon-explorer.somnia.network/address/0xec4efbe18915ed9bb78e928dd637134c1456b7e3) | Manages shield minting, activation, and daily claims |
| **ChallengeArena** | [`0xcc1ef2948269d702c719e6ba1a55d25b3c05b262`](https://shannon-explorer.somnia.network/address/0xcc1ef2948269d702c719e6ba1a55d25b3c05b262) | Head-to-head challenges with on-chain stakes |
| **ScoreOracle** | [`0x13bb32402bcffdb486c675f943be7b07bba54d60`](https://shannon-explorer.somnia.network/address/0x13bb32402bcffdb486c675f943be7b07bba54d60) | Computes prediction score (0-100) on-chain |

| Network | Details |
|---------|---------|
| **Chain** | Somnia Shannon Testnet (Chain ID: 50312) |
| **RPC** | `https://api.infra.testnet.somnia.network` |
| **Explorer** | [shannon-explorer.somnia.network](https://shannon-explorer.somnia.network) |
| **SDK** | [@somnia-chain/markets-sdk](https://www.npmjs.com/package/@somnia-chain/markets-sdk) |

---

## Live Demo

**[streaktrader.sithunyein.com](https://streaktrader.sithunyein.com)**

### How to Test

1. Connect MetaMask to Shannon Testnet (Chain 50312)
2. Get STT from the [Google Cloud faucet](https://cloud.google.com/application/web3/faucet/somnia/shannon)
3. Go to the [Trading page](https://streaktrader.sithunyein.com/app)
4. Select UP or DOWN, set your stake, and place a trade
5. Watch the live BTC price chart during settlement
6. Your streak is recorded on-chain — check the [Leaderboard](https://streaktrader.sithunyein.com/leaderboard)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Animations | Framer Motion, canvas-confetti |
| State | Zustand (local), viem (on-chain) |
| Wallet | MetaMask via viem custom transport |
| Blockchain | Somnia Shannon Testnet (EVM-compatible L1) |
| Trading | @somnia-chain/markets-sdk (DreamDEX) |
| Smart Contracts | Solidity 0.8.24, Hardhat |
| Shareable Cards | html-to-image |
| Price Data | Binance API (real-time BTC price) |
| Hosting | Vercel |

---

## Project Structure

```
streaktrader/
  contracts/                    # Solidity smart contracts
    StreakRegistry.sol          # On-chain streak tracking
    ShieldManager.sol           # Shield minting/burning
    ChallengeArena.sol          # Head-to-head challenges
    ScoreOracle.sol             # Prediction score computation
  scripts/
    deploy.ts                   # Contract deployment script
  src/
    app/
      page.tsx                  # Landing page
      app/page.tsx              # Trading app
      leaderboard/page.tsx      # On-chain leaderboard
      history/page.tsx          # Trade history
      api/copilot/route.ts      # AI copilot endpoint
      api/streak/route.ts       # Streak persistence API
      api/leaderboard/route.ts  # Leaderboard API
    components/
      AnimatedBackground.tsx    # Canvas animated waves
      MouseEffect.tsx           # Cursor glow effect
      Navbar.tsx                # Navigation with wallet connect
      TradePanel.tsx            # Trade execution panel
      SettlementView.tsx        # Settlement countdown + live chart
      StreakBadge.tsx           # Stats bar with on-chain data
      StreakCard.tsx            # Shareable streak card generator
      MarketCard.tsx            # Market display card
      ChallengeModal.tsx        # Challenge creation
      ChallengeBanner.tsx       # Active challenge display
      TradeProvider.tsx         # Context provider
      CopilotSidebar.tsx        # AI copilot sidebar
      Footer.tsx                # Site footer
    hooks/
      useWallet.ts              # MetaMask wallet connection
      useExchange.ts            # DreamDEX SDK integration
      useOnChain.ts             # Smart contract read/write
      useMarkets.ts             # Live market discovery
      useStreakSync.ts          # Cross-device streak sync
    lib/
      store.ts                  # Zustand store
      contracts.ts              # Contract addresses + ABIs
      abis/                     # Contract ABI files
  test/
    StreakRegistry.test.ts      # 8 tests
    ShieldManager.test.ts       # 6 tests
    ScoreOracle.test.ts         # 7 tests
  docs/
    SDK_FEEDBACK_REPORT.md      # DreamDEX SDK feedback
    PRESENTATION.md             # Hackathon presentation
  hardhat.config.ts
  package.json
```

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/thesithunyein/streaktrader.git
cd streaktrader

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run tests
npx hardhat test
```

---

## Smart Contract Functions

### StreakRegistry
- `recordTrade(user, won)` — Records a trade result, updates streak
- `getRecord(user)` — Returns streak, bestStreak, totalTrades, wins, winRate
- `resetStreak(user)` — Owner-only streak reset

### ShieldManager
- `claimFreeShield(user)` — Claim 1 free shield every 24h (max 3)
- `activateShield(user)` — Consume a shield on trade
- `purchaseShields(user, amount)` — Buy extra shields for 1 tUSDC each
- `getShieldState(user)` — Returns shield count, canClaimFree, totalUsed

### ChallengeArena
- `createChallenge(creator, marketSymbol, side, stake)` — Create a challenge
- `acceptChallenge(id, opponent, side)` — Accept a challenge
- `settleChallenge(id, winner)` — Settle and distribute payout
- `getChallenge(id)` — Read challenge details

### ScoreOracle
- `updateScore(user, streak, bestStreak, totalTrades, wins)` — Recompute score
- `getScore(user)` — Returns score (0-100)
- `getScoreData(user)` — Full breakdown (winRateScore, streakScore, volumeScore, consistencyScore)

---

## Documentation

| Document | Purpose |
|----------|---------|
| [SDK Feedback Report](docs/SDK_FEEDBACK_REPORT.md) | DreamDEX SDK experience and suggestions |
| [Presentation Deck](docs/PRESENTATION.md) | Hackathon presentation slides |
| [Security Policy](SECURITY.md) | Vulnerability reporting guidelines |
| [Code of Conduct](CODE_OF_CONDUCT.md) | Community standards |
| [Contributing Guide](CONTRIBUTING.md) | How to contribute |
| [License](LICENSE) | MIT License |

---

## Hackathon Submission

**Somnia x DreamDEX Event Contracts Hackathon**

| Field | Value |
|-------|-------|
| **Project** | StreakTrader |
| **Category** | Consumer-facing prediction market with gamification |
| **Innovation** | On-chain streak tracking, prediction scores, streak shields, shareable cards |
| **Network** | Somnia Shannon Testnet (Chain 50312) |
| **Author** | Sithu Nyein |
| **Contact** | sithunyein.mailto@gmail.com |

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
