// Contract addresses on Shannon Testnet (Chain 50312)
// These will be updated after deployment
export const CONTRACT_ADDRESSES = {
  StreakRegistry: "0x423b8701da3a251a3a3fc2d241b71e8d05744c91",
  ShieldManager: "0xec4efbe18915ed9bb78e928dd637134c1456b7e3",
  ChallengeArena: "0xcc1ef2948269d702c719e6ba1a55d25b3c05b262",
  ScoreOracle: "0x13bb32402bcffdb486c675f943be7b07bba54d60",
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
