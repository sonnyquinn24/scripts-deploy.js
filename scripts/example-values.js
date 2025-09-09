// Example values for SEQICO contract deployment
// Token price: $3.79 USD per SEQ token

import hre from "hardhat";
const { ethers } = hre;

// Example price values for a $3.79 token
async function calculatePriceValues() {
    console.log("=== SEQICO Price Calculation Examples ===");
    console.log("Target token price: $3.79 USD per SEQ token\n");

    // ETH Price Calculation
    // Assuming ETH = $2000 USD (adjust based on current market price)
    const ethPriceUSD = 2000; // Current ETH price in USD
    const tokenPriceUSD = 3.79;
    const tokenPriceETH = tokenPriceUSD / ethPriceUSD; // 3.79 / 2000 = 0.001895 ETH
    
    const pricePerTokenETH = ethers.parseEther(tokenPriceETH.toString());
    console.log(`ETH Price Calculation:`);
    console.log(`- ETH price: $${ethPriceUSD} USD`);
    console.log(`- Token price in ETH: ${tokenPriceETH} ETH`);
    console.log(`- pricePerTokenETH: ${pricePerTokenETH.toString()} wei`);
    console.log(`- For deployment: ethers.parseEther("${tokenPriceETH}")\n`);

    // USDT Price Calculation
    // USDT has 6 decimal places
    const pricePerTokenUSDT = ethers.parseUnits(tokenPriceUSD.toString(), 6);
    console.log(`USDT Price Calculation:`);
    console.log(`- Token price: $${tokenPriceUSD} USDT`);
    console.log(`- pricePerTokenUSDT: ${pricePerTokenUSDT.toString()} (6 decimals)`);
    console.log(`- For deployment: ethers.parseUnits("${tokenPriceUSD}", 6)\n`);

    // USDC Price Calculation
    // USDC has 6 decimal places
    const pricePerTokenUSDC = ethers.parseUnits(tokenPriceUSD.toString(), 6);
    console.log(`USDC Price Calculation:`);
    console.log(`- Token price: $${tokenPriceUSD} USDC`);
    console.log(`- pricePerTokenUSDC: ${pricePerTokenUSDC.toString()} (6 decimals)`);
    console.log(`- For deployment: ethers.parseUnits("${tokenPriceUSD}", 6)\n`);

    console.log("=== Complete Deployment Example ===");
    console.log(`
const SEQICO = await ethers.getContractFactory("SEQICO");
const seqICO = await SEQICO.deploy(
    seqTokenAddress,
    usdtAddress,
    usdcAddress,
    ethers.parseEther("${tokenPriceETH}"),        // ${tokenPriceETH} ETH per token
    ethers.parseUnits("${tokenPriceUSD}", 6),     // ${tokenPriceUSD} USDT per token
    ethers.parseUnits("${tokenPriceUSD}", 6)      // ${tokenPriceUSD} USDC per token
);
    `);

    return {
        pricePerTokenETH,
        pricePerTokenUSDT,
        pricePerTokenUSDC
    };
}

// Run the calculation
calculatePriceValues().catch(console.error);