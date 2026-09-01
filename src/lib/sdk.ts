import { SomniaMarkets, SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";
import { somniaShannon } from "@somnia-chain/markets-sdk/chains";

let exchangeInstance: SomniaMarkets | null = null;

export function getExchange(): SomniaMarkets {
  if (exchangeInstance) return exchangeInstance;

  exchangeInstance = new SomniaMarkets({
    indexerUrl: "https://dev.smk.somnia.host/v1/graphql",
    chain: somniaShannon,
    wsRpcUrl: "wss://api.infra.testnet.somnia.network/ws",
    addresses: SOMNIA_TESTNET_ADDRESSES,
  });

  return exchangeInstance;
}

// Testnet faucet for getting tUSDC
export async function requestFaucet(amount?: bigint) {
  const exchange = getExchange();
  try {
    const tx = await (exchange.trader as any).faucet(amount ? { amount } : undefined);
    return tx;
  } catch (e) {
    console.error("Faucet error:", e);
    throw e;
  }
}
