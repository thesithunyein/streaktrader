import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";

const SHANNON_RPC = "https://api.infra.testnet.somnia.network";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x" + "0".repeat(64);

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    shannon: {
      url: SHANNON_RPC,
      chainId: 50312,
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
    },
  },
};

export default config;
