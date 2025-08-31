import hre from "hardhat";
import fs from "fs";
import path from "path";

const { ethers } = hre;

async function main() {
  const network = hre.network.name;
  console.log(`Deploying ICO contracts to ${network} network...`);

  // Get deployment parameters from environment or use defaults
  const OWNER = process.env.OWNER_ADDRESS || "0x4B958C04701616A0ffF821E9b2db130983c5f3E4";
  
  // Network-specific USDT and USDC addresses
  const tokenAddresses = {
    mainnet: {
      usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      usdc: "0xA0b86a33E6417c5B6B82Cc45fE1f9d64a0c8ED8D"
    },
    sepolia: {
      usdt: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06", // Example testnet USDT
      usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"  // Example testnet USDC
    },
    polygon: {
      usdt: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      usdc: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
    },
    bsc: {
      usdt: "0x55d398326f99059fF775485246999027B3197955",
      usdc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"
    },
    hardhat: {
      usdt: "0x0000000000000000000000000000000000000001", // Dummy for local testing
      usdc: "0x0000000000000000000000000000000000000002"  // Dummy for local testing
    }
  };

  const { usdt: usdtAddress, usdc: usdcAddress } = tokenAddresses[network] || tokenAddresses.hardhat;

  // Prices (in wei for ETH, and with proper decimals for USDT/USDC)
  const pricePerTokenETH = ethers.parseEther("0.01"); // 0.01 ETH per SEQ
  const pricePerTokenUSDT = 10_000_000; // 10 USDT (6 decimals)
  const pricePerTokenUSDC = 10_000_000; // 10 USDC (6 decimals)

  console.log("Deployment parameters:");
  console.log(`- Owner: ${OWNER}`);
  console.log(`- USDT Address: ${usdtAddress}`);
  console.log(`- USDC Address: ${usdcAddress}`);
  console.log(`- Price per token (ETH): ${ethers.formatEther(pricePerTokenETH)} ETH`);
  console.log(`- Price per token (USDT): ${pricePerTokenUSDT / 1_000_000} USDT`);
  console.log(`- Price per token (USDC): ${pricePerTokenUSDC / 1_000_000} USDC`);

  // 1. Deploy ICO contract first (use a dummy token address initially)
  console.log("\n1. Deploying SEQICO contract...");
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
  console.log("✅ SEQICO deployed to:", ICO);

  // 2. Deploy SEQToken with 10% to owner, 90% to ICO contract
  console.log("\n2. Deploying SEQToken contract...");
  const totalSupply = ethers.parseEther("500000"); // 500,000 SEQ
  const SEQToken = await ethers.getContractFactory("SEQToken");
  const seqToken = await SEQToken.deploy(totalSupply, OWNER, ICO);
  await seqToken.waitForDeployment();
  const seqTokenAddress = await seqToken.getAddress();
  console.log("✅ SEQToken deployed to:", seqTokenAddress);

  // 3. Update ICO contract with real SEQ token address
  console.log("\n3. Updating SEQICO with SEQ token address...");
  await seqICO.setSEQToken(seqTokenAddress);
  console.log("✅ SEQICO updated with SEQ token address");

  // 4. Verify balances
  console.log("\n4. Verifying token distribution...");
  const ownerBal = await seqToken.balanceOf(OWNER);
  const icoBal = await seqToken.balanceOf(ICO);
  console.log(`✅ Owner balance: ${ethers.formatEther(ownerBal)} SEQ (${ethers.formatEther(ownerBal) / ethers.formatEther(totalSupply) * 100}%)`);
  console.log(`✅ ICO balance: ${ethers.formatEther(icoBal)} SEQ (${ethers.formatEther(icoBal) / ethers.formatEther(totalSupply) * 100}%)`);

  // 5. Save deployment information
  const deploymentInfo = {
    network: network,
    timestamp: new Date().toISOString(),
    contracts: {
      SEQICO: {
        address: ICO,
        constructor: {
          seqToken: seqTokenAddress,
          usdt: usdtAddress,
          usdc: usdcAddress,
          pricePerTokenETH: pricePerTokenETH.toString(),
          pricePerTokenUSDT: pricePerTokenUSDT,
          pricePerTokenUSDC: pricePerTokenUSDC
        }
      },
      SEQToken: {
        address: seqTokenAddress,
        constructor: {
          totalSupply: totalSupply.toString(),
          owner: OWNER,
          icoContract: ICO
        }
      }
    },
    verification: {
      ownerBalance: ownerBal.toString(),
      icoBalance: icoBal.toString(),
      totalSupply: totalSupply.toString()
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network}-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📝 Deployment information saved to: ${deploymentFile}`);

  // Save latest deployment info
  const latestFile = path.join(deploymentsDir, `${network}-latest.json`);
  fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📝 Latest deployment info saved to: ${latestFile}`);

  console.log("\n🎉 ICO deployment completed successfully!");
  
  // Environment-specific post-deployment actions
  if (network !== 'hardhat') {
    console.log("\n📋 Next steps:");
    console.log("1. Verify contracts on block explorer");
    console.log("2. Update frontend configuration with new contract addresses");
    console.log("3. Test token purchase functionality");
    console.log("4. Set up monitoring for contract events");
    
    if (process.env.ETHERSCAN_API_KEY) {
      console.log("\n🔍 Contract verification commands:");
      console.log(`npx hardhat verify --network ${network} ${ICO} "${dummyToken}" "${usdtAddress}" "${usdcAddress}" "${pricePerTokenETH}" "${pricePerTokenUSDT}" "${pricePerTokenUSDC}"`);
      console.log(`npx hardhat verify --network ${network} ${seqTokenAddress} "${totalSupply}" "${OWNER}" "${ICO}"`);
    }
  }
}

main().catch((error) => {
  console.error("❌ Deployment failed:");
  console.error(error);
  process.exitCode = 1;
});