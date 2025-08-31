import hre from "hardhat";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required environment variable is missing
 */
function validateEnvironmentVariables() {
  const REQUIRED_VARS = [
    'OWNER_ADDRESS',
    'USDT_ADDRESS', 
    'USDC_ADDRESS',
    'PRICE_PER_TOKEN_ETH',
    'PRICE_PER_TOKEN_USDT',
    'PRICE_PER_TOKEN_USDC',
    'TOTAL_SUPPLY'
  ];

  const missingVars = REQUIRED_VARS.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

/**
 * Main deployment function for production environment
 * Deploys SEQICO and SEQToken contracts with configuration from environment variables
 */
async function main() {
  console.log("🚀 Starting production deployment...");
  
  // Additional production safety checks
  if (process.env.NODE_ENV !== 'production') {
    console.warn("⚠️  NODE_ENV is not set to 'production'. Continuing anyway...");
  }
  
  // Validate environment variables
  validateEnvironmentVariables();
  
  // Load configuration from environment
  const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
  const usdtAddress = process.env.USDT_ADDRESS;
  const usdcAddress = process.env.USDC_ADDRESS;
  
  // Convert string values to proper types  
  const pricePerTokenETH = hre.ethers.parseEther(
    hre.ethers.formatEther(process.env.PRICE_PER_TOKEN_ETH)
  );
  const pricePerTokenUSDT = parseInt(process.env.PRICE_PER_TOKEN_USDT);
  const pricePerTokenUSDC = parseInt(process.env.PRICE_PER_TOKEN_USDC);
  const totalSupply = hre.ethers.parseEther(
    hre.ethers.formatEther(process.env.TOTAL_SUPPLY)
  );

  console.log("📋 Production Deployment Configuration:");
  console.log(`   Owner: ${OWNER_ADDRESS}`);
  console.log(`   USDT: ${usdtAddress}`);
  console.log(`   USDC: ${usdcAddress}`);
  console.log(`   ETH Price: ${hre.ethers.formatEther(pricePerTokenETH)} ETH per token`);
  console.log(`   Total Supply: ${hre.ethers.formatEther(totalSupply)} tokens`);
  console.log(`   Network: ${process.env.NETWORK || 'mainnet'}`);

  // Production confirmation prompt
  console.log("\n⚠️  PRODUCTION DEPLOYMENT - Please verify configuration above");
  
  // 1. Deploy ICO contract first (use dummy token address initially)
  console.log("\n📦 Deploying SEQICO contract...");
  const SEQICOFactory = await hre.ethers.getContractFactory("SEQICO");
  const dummyTokenAddress = "0x0000000000000000000000000000000000000000";
  
  const seqICO = await SEQICOFactory.deploy(
    dummyTokenAddress,
    usdtAddress,
    usdcAddress,
    pricePerTokenETH,
    pricePerTokenUSDT,
    pricePerTokenUSDC
  );
  
  await seqICO.waitForDeployment();
  const icoContractAddress = await seqICO.getAddress();
  console.log(`✅ SEQICO deployed to: ${icoContractAddress}`);

  // 2. Deploy SEQToken with 10% to owner, 90% to ICO contract
  console.log("\n📦 Deploying SEQToken contract...");
  const SEQTokenFactory = await hre.ethers.getContractFactory("SEQToken");
  const seqToken = await SEQTokenFactory.deploy(totalSupply, OWNER_ADDRESS, icoContractAddress);
  
  await seqToken.waitForDeployment();
  const seqTokenAddress = await seqToken.getAddress();
  console.log(`✅ SEQToken deployed to: ${seqTokenAddress}`);

  // 3. Update ICO contract with real SEQ token address
  console.log("\n🔧 Updating SEQICO with SEQ token address...");
  await seqICO.setSEQToken(seqTokenAddress);
  console.log("✅ SEQICO updated with SEQ token address");

  // 4. Verify balances
  console.log("\n📊 Verifying token distribution:");
  const ownerBalance = await seqToken.balanceOf(OWNER_ADDRESS);
  const icoBalance = await seqToken.balanceOf(icoContractAddress);
  
  console.log(`   Owner balance: ${hre.ethers.formatEther(ownerBalance)} SEQ`);
  console.log(`   ICO balance: ${hre.ethers.formatEther(icoBalance)} SEQ`);

  console.log("\n🎉 Production deployment completed successfully!");
  console.log("\n📋 PRODUCTION Deployment Summary:");
  console.log(`   SEQICO Contract: ${icoContractAddress}`);
  console.log(`   SEQToken Contract: ${seqTokenAddress}`);
  console.log(`   Owner: ${OWNER_ADDRESS}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`   Network: ${process.env.NETWORK || 'mainnet'}`);
  
  console.log("\n⚠️  IMPORTANT: Save these contract addresses securely!");
}

main().catch((error) => {
  console.error("❌ Production deployment failed:", error);
  process.exitCode = 1;
});
