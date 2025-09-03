import { ethers } from "hardhat";

async function main() {
  // Replace with your actual owner address
  const OWNER = "0x4B958C04701616A0ffF821E9b2db130983c5f3E4";
  // USDT and USDC contract addresses (ensure these are correct for your network)
  const usdtAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7"; // USDT mainnet
  const usdcAddress = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"; // Example USDC

  // Environment-based configuration with fallback defaults
  const pricePerTokenETH = process.env.PRICE_ETH ? 
    ethers.parseEther(process.env.PRICE_ETH) : 
    ethers.parseEther("0.01"); // 0.01 ETH per SEQ
  
  const pricePerTokenUSDT = process.env.PRICE_USDT ? 
    parseInt(process.env.PRICE_USDT) : 
    10_000_000; // 10 USDT (6 decimals) = $10
  
  const pricePerTokenUSDC = process.env.PRICE_USDC ? 
    parseInt(process.env.PRICE_USDC) : 
    10_000_000; // 10 USDC (6 decimals) = $10

  // Minimum price constants for reference
  const MIN_PRICE_ETH = ethers.parseEther("0.001"); // 0.001 ETH minimum
  const MIN_PRICE_USD_STABLECOINS = 3_000_000; // $3 with 6 decimals

  // Validate prices meet minimum requirements
  console.log("Validating prices meet $3 minimum requirement...");
  if (pricePerTokenETH < MIN_PRICE_ETH) {
    throw new Error(`ETH price ${ethers.formatEther(pricePerTokenETH)} is below minimum ${ethers.formatEther(MIN_PRICE_ETH)} ETH`);
  }
  if (pricePerTokenUSDT < MIN_PRICE_USD_STABLECOINS) {
    throw new Error(`USDT price ${pricePerTokenUSDT} is below $3 minimum (${MIN_PRICE_USD_STABLECOINS})`);
  }
  if (pricePerTokenUSDC < MIN_PRICE_USD_STABLECOINS) {
    throw new Error(`USDC price ${pricePerTokenUSDC} is below $3 minimum (${MIN_PRICE_USD_STABLECOINS})`);
  }
  console.log("✅ All prices meet minimum requirements");

  console.log("Initial prices:");
  console.log("- ETH:", ethers.formatEther(pricePerTokenETH), "ETH per token");
  console.log("- USDT:", pricePerTokenUSDT.toString(), `($${(pricePerTokenUSDT / 1_000_000).toFixed(2)})`);
  console.log("- USDC:", pricePerTokenUSDC.toString(), `($${(pricePerTokenUSDC / 1_000_000).toFixed(2)})`);
  console.log();

  // 1. Deploy ICO contract first (use a dummy token address initially)
  const SEQICO = await ethers.getContractFactory("SEQICO");
  const dummyToken = "0x0000000000000000000000000000000000000000";
  const seqICO = await SEQICO.deploy(
    dummyToken,
    usdtAddress,
    usdcAddress,
    pricePerTokenETH,
    pricePerTokenUSDT,
    pricePerTokenUSDC
  );
  await seqICO.waitForDeployment();
  const ICO = await seqICO.getAddress();
  console.log("SEQICO deployed to:", ICO);

  // 2. Deploy SEQToken with 10% to owner, 90% to ICO contract
  const totalSupply = ethers.parseEther("500000"); // 500,000 SEQ
  const SEQToken = await ethers.getContractFactory("SEQToken");
  const seqToken = await SEQToken.deploy(totalSupply, OWNER, ICO);
  await seqToken.waitForDeployment();
  const seqTokenAddress = await seqToken.getAddress();
  console.log("SEQToken deployed to:", seqTokenAddress);

  // 3. Update ICO contract with real SEQ token address
  await seqICO.setSEQToken(seqTokenAddress);
  console.log("SEQICO updated with SEQ token address");

  // 4. (Optional) Print balances for verification
  const ownerBal = await seqToken.balanceOf(OWNER);
  const icoBal = await seqToken.balanceOf(ICO);
  console.log("Owner balance:", ethers.formatEther(ownerBal));
  console.log("ICO balance:", ethers.formatEther(icoBal));

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. To update prices later, use: npx hardhat run scripts/set-prices.js");
  console.log("2. Update the SEQICO_ADDRESS in set-prices.js with:", ICO);
  console.log("3. Remember: all prices must meet the $3 minimum requirement");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
