// Contract addresses on Shannon Testnet (Chain 50312)
// These will be updated after deployment
export const CONTRACT_ADDRESSES = {
  StreakRegistry: "0x0000000000000000000000000000000000000000", // TODO: deploy
  ShieldManager: "0x0000000000000000000000000000000000000000",   // TODO: deploy
  ChallengeArena: "0x0000000000000000000000000000000000000000", // TODO: deploy
  ScoreOracle: "0x0000000000000000000000000000000000000000",   // TODO: deploy
} as const;

// ABIs
import StreakRegistryABI from "./abis/StreakRegistry.json";
import ShieldManagerABI from "./abis/ShieldManager.json";
import ChallengeArenaABI from "./abis/ChallengeArena.json";
import ScoreOracleABI from "./abis/ScoreOracle.json";

export const ABIS = {
  StreakRegistry: StreakRegistryABI,
  ShieldManager: ShieldManagerABI,
  ChallengeArena: ChallengeArenaABI,
  ScoreOracle: ScoreOracleABI,
} as const;

// Shannon Testnet chain config
export const SHANNON_CHAIN = {
  chainId: 50312,
  name: "Somnia Shannon Testnet",
  rpcUrl: "https://api.infra.testnet.somnia.network",
  explorerUrl: "https://shannon-explorer.somnia.network",
} as const;
