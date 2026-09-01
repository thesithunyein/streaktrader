import { SomniaMarkets, SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";
import { somniaShannon } from "@somnia-chain/markets-sdk/chains";

let readInstance: SomniaMarkets | null = null;

export function getReadExchange(): SomniaMarkets {
  if (readInstance) return readInstance;

  readInstance = new SomniaMarkets({
    indexerUrl: "https://dev.smk.somnia.host/v1/graphql",
    chain: somniaShannon,
    wsRpcUrl: "wss://api.infra.testnet.somnia.network/ws",
    addresses: SOMNIA_TESTNET_ADDRESSES,
  });

  return readInstance;
}
