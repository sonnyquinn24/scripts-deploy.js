import { ethers } from "hardhat";

async function main() {
  // Configuration - set SEQICO_ADDRESS as an environment variable before running this script
  const SEQICO_ADDRESS = process.env.SEQICO_ADDRESS;
  if (
    !SEQICO_ADDRESS ||
    SEQICO_ADDRESS === "YOUR_DEPLOYED_SEQICO_ADDRESS_HERE" ||
    SEQICO_ADDRESS === "0x..." ||
    !/^0x[a-fA-F0-9]{40}$/.test(SEQICO_ADDRESS)
  ) {
    throw new Error("❌ Please set the SEQICO_ADDRESS environment variable to your deployed SEQICO contract address before running this script.\nExample: SEQICO_ADDRESS=0x1234... npx hardhat run scripts/set-prices.js");
  }
  
  // New prices to set (must be >= $3 minimum)
  const newPriceETH = ethers.parseEther("0.015"); // 0.015 ETH per token
  const newPriceUSDT = 5_000_000; // $5 USDT (6 decimals)
  const newPriceUSDC = 4_500_000; // $4.5 USDC (6 decimals)
  
  console.log("Setting new prices for SEQICO contract...");
  console.log("Contract address:", SEQICO_ADDRESS);
  
  // Get the contract instance
  const SEQICO = await ethers.getContractFactory("SEQICO");
  const seqICO = SEQICO.attach(SEQICO_ADDRESS);
  
  // Verify minimum price constants
  const minPriceETH = await seqICO.MIN_PRICE_ETH();
  const minPriceUSD = await seqICO.MIN_PRICE_USD_STABLECOINS();
  
  console.log("Minimum price ETH:", ethers.formatEther(minPriceETH), "ETH");
  console.log("Minimum price USD stablecoins:", minPriceUSD.toString(), "(representing $3)");
  
  // Check current prices
  console.log("\nCurrent prices:");
  console.log("ETH:", ethers.formatEther(await seqICO.pricePerTokenETH()), "ETH per token");
  console.log("USDT:", (await seqICO.pricePerTokenUSDT()).toString(), "(6 decimals)");
  console.log("USDC:", (await seqICO.pricePerTokenUSDC()).toString(), "(6 decimals)");
  
  // Validate new prices meet minimum requirements
  if (newPriceETH < minPriceETH) {
    console.error("Error: New ETH price is below minimum!");
    return;
  }
  if (newPriceUSDT < minPriceUSD) {
    console.error("Error: New USDT price is below $3 minimum!");
    return;
  }
  if (newPriceUSDC < minPriceUSD) {
    console.error("Error: New USDC price is below $3 minimum!");
    return;
  }
  
  try {
    // Set new ETH price
    console.log("\nSetting new ETH price...");
    const tx1 = await seqICO.setPriceETH(newPriceETH);
    await tx1.wait();
    console.log("✅ ETH price updated to:", ethers.formatEther(newPriceETH), "ETH per token");
    
    // Set new USDT price
    console.log("Setting new USDT price...");
    const tx2 = await seqICO.setPriceUSDT(newPriceUSDT);
    await tx2.wait();
    console.log("✅ USDT price updated to:", newPriceUSDT.toString(), "($" + (newPriceUSDT / 1_000_000).toFixed(2) + ")");
    
    // Set new USDC price
    console.log("Setting new USDC price...");
    const tx3 = await seqICO.setPriceUSDC(newPriceUSDC);
    await tx3.wait();
    console.log("✅ USDC price updated to:", newPriceUSDC.toString(), "($" + (newPriceUSDC / 1_000_000).toFixed(2) + ")");
    
    console.log("\n🎉 All prices updated successfully!");
    
    // Verify the updates
    console.log("\nUpdated prices:");
    console.log("ETH:", ethers.formatEther(await seqICO.pricePerTokenETH()), "ETH per token");
    console.log("USDT:", (await seqICO.pricePerTokenUSDT()).toString(), "(6 decimals)");
    console.log("USDC:", (await seqICO.pricePerTokenUSDC()).toString(), "(6 decimals)");
    
  } catch (error) {
    console.error("Error setting prices:", error.message);
    if (error.message.includes("price below $3 minimum")) {
      console.error("Make sure all prices meet the $3 minimum requirement!");
    }
    if (error.message.includes("OwnableUnauthorizedAccount")) {
      console.error("Only the contract owner can set prices!");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});