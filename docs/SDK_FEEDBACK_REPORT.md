# DreamDEX SDK & Documentation Feedback Report

**Project:** StreakTrader — Gamified Prediction Market Platform  
**Hackathon:** Somnia × DreamDEX Event Contracts Hackathon  
**Date:** September 2026  
**Author:** Sithu Nyein  

---

## Executive Summary

StreakTrader is a consumer-facing prediction market platform that gamifies DreamDEX Event Contracts with streaks, prediction scores, streak shields, and shareable cards. We built 4 on-chain smart contracts, an AI copilot, and a cross-device sync system — all powered by the DreamDEX Markets SDK.

This report documents our experience building with the SDK and documentation, highlighting what worked well, what was confusing, and suggestions for improvement.

---

## What Worked Well

### 1. Market Discovery (`loadMarkets()` + `exchange.markets`)

The market discovery pipeline was the most reliable part of the SDK:

```typescript
const exchange = new SomniaMarkets({ ... });
await exchange.loadMarkets();
const markets = exchange.markets; // keyed by symbol
```

**What we liked:**
- Clean API — `loadMarkets()` populates `exchange.markets` as a dictionary
- Symbol format is consistent: `BTC-95000-31DEC26/USDC#YES`
- Binary markets have both `symbol` (YES) and `downSymbol` (NO) — easy to build UP/DOWN UI

**Suggestion:** Document the market object shape more clearly. We had to inspect `node_modules` to find `downSymbol` and understand the full `BinaryMarket` type.

### 2. Order Creation (`createOrder()`)

The order creation API was straightforward:

```typescript
await exchange.createOrder(
  symbol,    // e.g., "BTC-95000-31DEC26/USDC#YES"
  "market",  // order type
  "buy",     // side
  10,        // amount in USDC
  undefined, // no limit price
  { timeInForce: "IOC" }
);
```

**What we liked:**
- Market orders with IOC (Immediate or Cancel) work perfectly for event contracts
- The SDK handles the complexity of binary market order routing
- Error messages are clear when orders fail

**Suggestion:** Add a `quickBuy(symbol, side, amount)` helper that automatically selects YES/NO based on UP/DOWN intent. This would simplify the most common use case.

### 3. Balance Fetching (`fetchBalance()`)

```typescript
const bal = await exchange.fetchBalance();
// Returns: { [code: string]: { free: number, used: number, total: number } }
```

**What we liked:**
- Returns a clean dictionary of all balances
- `free` field tells you immediately what's available for trading

**Suggestion:** The return type is `UnifiedBalances` but the documentation doesn't explain the structure. A simple example in the docs would help: "Returns `{ USDC: { free: 100, used: 0, total: 100 } }`"

### 4. Position Fetching (`fetchPositions()`)

```typescript
const positions = await exchange.fetchPositions();
// Returns array of positions with { symbol, size, entryPrice, ... }
```

**What we liked:**
- Clean array of positions
- Easy to check if a position is still open (`size > 0`)

**Suggestion:** Document the position object fields. We had to guess what `size === 0` means (settled/closed).

---

## What Was Confusing

### 1. Symbol Format Discovery

**Problem:** The documentation doesn't explain the binary market symbol format clearly.

**What we expected:**
```
BTC-95000-31DEC26/USDC#YES → "Will BTC be above $95,000 at Dec 31 expiry?"
BTC-95000-31DEC26/USDC#NO  → "Will BTC be below $95,000 at Dec 31 expiry?"
```

**What we learned by inspecting code:**
- `symbol` = YES token (UP)
- `downSymbol` = NO token (DOWN)
- The format is `{asset}-{strike}-{expiry}/{collateral}#{outcome}`

**Suggestion:** Add a "Binary Market Symbol Format" section to the docs with a clear diagram.

### 2. Wallet Client vs Private Key

**Problem:** The SDK accepts a `walletClient` parameter, but the documentation examples show `privateKey` usage. This caused confusion about whether to use viem's `createWalletClient` or pass a raw private key.

**What we tried first:**
```typescript
const exchange = new SomniaMarkets({
  walletClient: walletClient, // viem WalletClient
});
```

**What actually works:**
```typescript
const exchange = new SomniaMarkets({
  walletClient: walletClient, // viem WalletClient from MetaMask
} as any); // ← needed the `as any` cast
```

**Suggestion:** Update the TypeScript types to properly accept `WalletClient` without requiring `as any`. The current type definition doesn't match the actual implementation.

### 3. Indexer URL Configuration

**Problem:** The SDK requires an `indexerUrl` parameter, but the documentation doesn't explain what this is or where to find it.

**What we used:**
```typescript
indexerUrl: "https://dev.smk.somnia.host/v1/graphql"
```

**Suggestion:** Add a "Configuration" section that lists all required parameters with their production and testnet values:
- `indexerUrl`: `https://dev.smk.somnia.host/v1/graphql` (testnet)
- `wsRpcUrl`: `wss://api.infra.testnet.somnia.network/ws`
- `chain`: `somniaShannon`

### 4. Settlement Detection

**Problem:** How to detect when a position has settled is not documented. We had to poll `fetchPositions()` every 3 seconds and check if `size === 0`.

**What we built:**
```typescript
const pollSettlement = setInterval(async () => {
  const positions = await exchange.fetchPositions();
  const marketPos = positions.find(p => p.symbol === symbol && p.size > 0);
  if (!marketPos || marketPos.size === 0) {
    // Position settled
    clearInterval(pollSettlement);
  }
}, 3000);
```

**Suggestion:** Add a `watchSettlement(symbol, callback)` helper or document the polling pattern. Also consider WebSocket-based settlement notifications.

### 5. Error Handling

**Problem:** SDK errors don't always have clear messages. When an order fails, the error might be a generic "Missing or invalid parameters" without explaining which parameter is wrong.

**Suggestion:** Add error codes or more descriptive error messages. For example:
- `MARKET_NOT_FOUND` instead of generic error
- `INSUFFICIENT_BALANCE` instead of silent failure
- `MARKET_CLOSED` when trying to trade after expiry

---

## Suggestions for Improvement

### 1. Add a `quickTrade()` Helper

The most common use case is "buy YES or NO for X USDC." A helper would simplify this:

```typescript
// Current (verbose)
await exchange.createOrder(symbol, "market", "buy", 10, undefined, { timeInForce: "IOC" });

// Suggested
await exchange.quickTrade(symbol, "UP", 10); // Automatically selects YES token
```

### 2. Add WebSocket Settlement Notifications

Instead of polling `fetchPositions()`, add a WebSocket subscription:

```typescript
exchange.onSettlement(symbol, (result) => {
  console.log(`Market settled: ${result.outcome}`); // "YES" or "NO"
});
```

### 3. Add TypeScript Generics for Market Types

```typescript
const market = exchange.markets[symbol]; // currently `any`
// Suggested
const market = exchange.markets[symbol] as BinaryMarket; // typed
```

### 4. Add a React Hook for Market Data

```typescript
// Suggested
const { market, odds, settlement } = useDreamDEXMarket(symbol);
```

### 5. Add More Examples in Documentation

The current documentation has examples but they're scattered. Suggested sections:
- Quick Start (5 minutes)
- Market Discovery
- Placing Orders
- Settlement Detection
- Error Handling
- React Integration

### 6. Add a Sandbox Mode

For hackathon developers, a sandbox mode that simulates order execution without real funds would be valuable:

```typescript
const exchange = new SomniaMarkets({
  sandbox: true, // Simulates orders locally
});
```

---

## How We Used the SDK in StreakTrader

| Feature | SDK Usage | Notes |
|---------|-----------|-------|
| Market discovery | `loadMarkets()` + `exchange.markets` | Reliable, fast |
| Order placement | `createOrder()` with IOC | Works well for event contracts |
| Balance display | `fetchBalance()` | Clean API |
| Settlement detection | `fetchPositions()` polling | Works but needs documentation |
| Wallet connection | viem `WalletClient` | Required `as any` cast |
| Position tracking | `fetchPositions()` | Clean but fields undocumented |

---

## Impact on Our Project

The SDK was essential for building StreakTrader. Without it, we would have had to build market discovery, order routing, and settlement detection from scratch — which would have taken weeks.

**What the SDK enabled:**
- Real on-chain trading in under 2 hours
- Live market data with zero configuration
- Settlement detection via position polling

**What would have helped:**
- Better TypeScript types (no `as any` needed)
- Settlement WebSocket events
- Quick trade helper
- More examples

---

## Conclusion

The DreamDEX Markets SDK is a powerful tool that makes building on DreamDEX accessible. With better documentation, TypeScript types, and a few quality-of-life improvements, it could be the gold standard for prediction market SDKs.

We're grateful for the opportunity to build with it and look forward to seeing the ecosystem grow.

---

*Report prepared for the Somnia × DreamDEX Event Contracts Hackathon*  
*StreakTrader — streaktrader.sithunyein.com*
