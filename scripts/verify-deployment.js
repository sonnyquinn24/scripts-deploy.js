import { ethers } from "hardhat";

/**
 * Verification script to check deployed contracts
 * Usage: npx hardhat run scripts/verify-deployment.js --network <network>
 */
async function main() {
  console.log("=== Deployment Verification Script ===");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Verifying with account:", deployer.address);
  
  // Log current balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  
  // Note: To verify specific contract addresses, you would need to save them during deployment
  // and then load them here. This script demonstrates the verification structure.
  
  console.log("\n=== Contract Verification Complete ===");
  console.log("To verify specific deployed contracts:");
  console.log("1. Save contract addresses during deployment");
  console.log("2. Load and verify contract state");
  console.log("3. Check contract balances and permissions");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});