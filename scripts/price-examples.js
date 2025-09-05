// Example values for SEQICO contract deployment
// Token price: $3.79 USD per SEQ token

console.log("=== SEQICO Price Calculation Examples ===");
console.log("Target token price: $3.79 USD per SEQ token\n");

// ETH Price Calculation
// Assuming ETH = $2000 USD (adjust based on current market price)
const ethPriceUSD = 2000; // Current ETH price in USD
const tokenPriceUSD = 3.79;
const tokenPriceETH = tokenPriceUSD / ethPriceUSD; // 3.79 / 2000 = 0.001895 ETH

// Calculate wei value (1 ETH = 1e18 wei)
const pricePerTokenETHWei = Math.floor(tokenPriceETH * 1e18);

console.log(`ETH Price Calculation:`);
console.log(`- ETH price: $${ethPriceUSD} USD`);
console.log(`- Token price in ETH: ${tokenPriceETH} ETH`);
console.log(`- pricePerTokenETH: ${pricePerTokenETHWei} wei`);
console.log(`- For deployment: ethers.parseEther("${tokenPriceETH}")\n`);

// USDT Price Calculation (6 decimal places)
const pricePerTokenUSDT = Math.floor(tokenPriceUSD * 1e6);
console.log(`USDT Price Calculation:`);
console.log(`- Token price: $${tokenPriceUSD} USDT`);
console.log(`- pricePerTokenUSDT: ${pricePerTokenUSDT} (6 decimals)`);
console.log(`- For deployment: ethers.parseUnits("${tokenPriceUSD}", 6)\n`);

// USDC Price Calculation (6 decimal places)
const pricePerTokenUSDC = Math.floor(tokenPriceUSD * 1e6);
console.log(`USDC Price Calculation:`);
console.log(`- Token price: $${tokenPriceUSD} USDC`);
console.log(`- pricePerTokenUSDC: ${pricePerTokenUSDC} (6 decimals)`);
console.log(`- For deployment: ethers.parseUnits("${tokenPriceUSD}", 6)\n`);

console.log("=== Raw Values for Constructor ===");
console.log(`pricePerTokenETH:  ${pricePerTokenETHWei}`);
console.log(`pricePerTokenUSDT: ${pricePerTokenUSDT}`);
console.log(`pricePerTokenUSDC: ${pricePerTokenUSDC}\n`);

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