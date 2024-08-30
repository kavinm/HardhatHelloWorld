// Imports
// ========================================================
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import dotenv from "dotenv";

// Load Environment Variables
// ========================================================
dotenv.config();

// Main Hardhat Config
// ========================================================
const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    // For localhost network
    hardhat: {
      chainId: 1337,
    },
    // NOTE: hardhat viem currently doesn't yet support this method for custom chains through Hardhat config ↴
    SunriseTestnet: {
      chainId: parseInt(`${process.env.CHAIN_ID}`),
      url: `${process.env.RPC_URL || ""}`,
      accounts: process.env.WALLET_PRIVATE_KEY
        ? [`${process.env.WALLET_PRIVATE_KEY}`]
        : [],
    },
  },
};

// Exports
// ========================================================
export default config;
