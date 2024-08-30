// Imports
// ========================================================
import hre from "hardhat";
import { parseEther } from "viem";

// Main Deployment Script
// ========================================================
async function main() {
  console.log("Deploying HelloWorld contract...");

  // Get the deployer's wallet
  const [deployer] = await hre.viem.getWalletClients();

  console.log("Deploying with account:", deployer.account.address);

  // Deploy the contract
  const contract = await hre.viem.deployContract("HelloWorld", [
    "Hello from the contract!",
  ]);

  console.log("HelloWorld deployed to:", contract.address);
}

// Init
// ========================================================
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
