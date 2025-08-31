const { ethers } = require("hardhat");

/**
 * Debug tool for analyzing SEQICO transactions and identifying errors
 * Focuses on price validation revert messages and transaction failures
 */
async function main() {
  console.log("🔍 SEQICO Transaction Debugger");
  console.log("===============================");

  const seqicoAddress = process.env.SEQICO_ADDRESS || "0x...";
  const txHash = process.env.TX_HASH;
  
  if (seqicoAddress === "0x...") {
    console.log("❌ Please set SEQICO_ADDRESS environment variable");
    console.log("Usage: SEQICO_ADDRESS=0x... TX_HASH=0x... npx hardhat run scripts/debug-transactions.js");
    return;
  }

  const [signer] = await ethers.getSigners();
  console.log("🔗 Using signer:", signer.address);
  console.log("📍 Contract address:", seqicoAddress);
  
  try {
    const SEQICO = await ethers.getContractFactory("SEQICO");
    const seqico = SEQICO.attach(seqicoAddress);
    
    // If specific transaction hash provided, analyze it
    if (txHash) {
      console.log("\n🔍 Analyzing Transaction:", txHash);
      await analyzeTransaction(txHash);
      return;
    }
    
    console.log("\n🧪 Simulating Common Error Scenarios:");
    console.log("=====================================");
    
    // Simulate price setting errors
    await simulateCommonErrors(seqico);
    
    // Test purchase scenarios
    await testPurchaseScenarios(seqico);
    
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

async function analyzeTransaction(txHash) {
  try {
    const provider = ethers.provider;
    const tx = await provider.getTransaction(txHash);
    
    if (!tx) {
      console.log("❌ Transaction not found");
      return;
    }
    
    console.log("📋 Transaction Details:");
    console.log("  Hash:", tx.hash);
    console.log("  From:", tx.from);
    console.log("  To:", tx.to);
    console.log("  Value:", ethers.formatEther(tx.value), "ETH");
    console.log("  Gas Limit:", tx.gasLimit.toString());
    console.log("  Gas Price:", ethers.formatUnits(tx.gasPrice, "gwei"), "gwei");
    
    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (receipt) {
      console.log("\n📄 Transaction Receipt:");
      console.log("  Status:", receipt.status === 1 ? "✅ Success" : "❌ Failed");
      console.log("  Gas Used:", receipt.gasUsed.toString());
      console.log("  Block Number:", receipt.blockNumber);
      
      if (receipt.status === 0) {
        console.log("\n🔍 Analyzing Failed Transaction:");
        
        try {
          // Try to simulate the transaction to get the revert reason
          await ethers.provider.call({
            to: tx.to,
            from: tx.from,
            value: tx.value,
            data: tx.data
          }, receipt.blockNumber);
        } catch (error) {
          console.log("  ❌ Revert Reason:", error.message);
          
          // Check for specific price validation errors
          if (error.message.includes("Price must be greater than or equal to $3")) {
            console.log("  🎯 This is a PRICE VALIDATION error");
            console.log("  📝 The transaction tried to set a price below the $3 minimum");
          } else if (error.message.includes("Insufficient ETH sent")) {
            console.log("  🎯 This is an INSUFFICIENT PAYMENT error");
            console.log("  📝 The buyer didn't send enough ETH for the requested tokens");
          } else if (error.message.includes("Ownable: caller is not the owner")) {
            console.log("  🎯 This is an ACCESS CONTROL error");
            console.log("  📝 A non-owner tried to call an owner-only function");
          }
        }
      } else {
        console.log("  ✅ Transaction succeeded");
        
        // Decode events if available
        if (receipt.logs.length > 0) {
          console.log("\n📝 Events Emitted:");
          for (const log of receipt.logs) {
            try {
              // Try to decode as TokensPurchased event
              const iface = new ethers.Interface([
                "event TokensPurchased(address indexed buyer, uint256 amount, string payment)"
              ]);
              const decoded = iface.decodeEventLog("TokensPurchased", log.data, log.topics);
              console.log("  🎉 TokensPurchased:");
              console.log("    Buyer:", decoded.buyer);
              console.log("    Amount:", ethers.formatEther(decoded.amount), "SEQ");
              console.log("    Payment Method:", decoded.payment);
            } catch (e) {
              // Not a TokensPurchased event or different format
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.log("❌ Error analyzing transaction:", error.message);
  }
}

async function simulateCommonErrors(seqico) {
  console.log("\n1. 🚫 Testing Price Validation Errors:");
  
  const testCases = [
    {
      name: "ETH price below minimum",
      action: () => seqico.setPricePerTokenETH.staticCall(ethers.parseEther("0.0001")),
      expectedError: "Price must be greater than or equal to $3"
    },
    {
      name: "USDT price below minimum", 
      action: () => seqico.setPricePerTokenUSDT.staticCall(ethers.parseUnits("2.99", 6)),
      expectedError: "Price must be greater than or equal to $3"
    },
    {
      name: "USDC price below minimum",
      action: () => seqico.setPricePerTokenUSDC.staticCall(ethers.parseUnits("1", 6)),
      expectedError: "Price must be greater than or equal to $3"
    }
  ];
  
  for (const testCase of testCases) {
    try {
      await testCase.action();
      console.log(`  ❌ ${testCase.name}: Expected error but transaction would succeed`);
    } catch (error) {
      if (error.message.includes(testCase.expectedError)) {
        console.log(`  ✅ ${testCase.name}: Correctly rejected with "${testCase.expectedError}"`);
      } else {
        console.log(`  ⚠️  ${testCase.name}: Rejected but with unexpected error: ${error.message}`);
      }
    }
  }
}

async function testPurchaseScenarios(seqico) {
  console.log("\n2. 🛒 Testing Purchase Scenarios:");
  
  try {
    // Get current prices
    const ethPrice = await seqico.pricePerTokenETH();
    const usdtPrice = await seqico.pricePerTokenUSDT();
    const usdcPrice = await seqico.pricePerTokenUSDC();
    
    console.log("  📊 Current Prices:");
    console.log("    ETH:", ethers.formatEther(ethPrice), "ETH per SEQ");
    console.log("    USDT:", ethers.formatUnits(usdtPrice, 6), "USDT per SEQ");
    console.log("    USDC:", ethers.formatUnits(usdcPrice, 6), "USDC per SEQ");
    
    // Test ETH purchase calculations
    const tokenAmount = ethers.parseEther("1"); // 1 SEQ token
    const requiredETH = ethPrice * tokenAmount / ethers.parseEther("1");
    
    console.log("  🧮 Purchase Calculations (for 1 SEQ token):");
    console.log("    Required ETH:", ethers.formatEther(requiredETH), "ETH");
    console.log("    Required USDT:", ethers.formatUnits(usdtPrice * tokenAmount / ethers.parseEther("1"), 6), "USDT");
    console.log("    Required USDC:", ethers.formatUnits(usdcPrice * tokenAmount / ethers.parseEther("1"), 6), "USDC");
    
    // Test insufficient payment scenario
    console.log("\n  🚫 Testing Insufficient Payment:");
    try {
      const insufficientETH = requiredETH / 2n; // Send only half the required amount
      await seqico.buyWithETH.staticCall(tokenAmount, { value: insufficientETH });
      console.log("    ❌ Insufficient ETH payment was accepted (should have been rejected)");
    } catch (error) {
      if (error.message.includes("Insufficient ETH sent")) {
        console.log("    ✅ Insufficient ETH payment correctly rejected");
      } else {
        console.log("    ⚠️  Unexpected error:", error.message);
      }
    }
    
  } catch (error) {
    console.log("  ❌ Error testing purchase scenarios:", error.message);
  }
}

// Utility function to generate debugging report
async function generateDebugReport(seqicoAddress) {
  console.log("\n📊 Generating Debug Report:");
  console.log("===========================");
  
  try {
    const SEQICO = await ethers.getContractFactory("SEQICO");
    const seqico = SEQICO.attach(seqicoAddress);
    
    const ethPrice = await seqico.pricePerTokenETH();
    const usdtPrice = await seqico.pricePerTokenUSDT();
    const usdcPrice = await seqico.pricePerTokenUSDC();
    const minETH = await seqico.MIN_PRICE_ETH();
    const minUSD = await seqico.MIN_PRICE_USD();
    const owner = await seqico.owner();
    
    const report = {
      timestamp: new Date().toISOString(),
      contract: seqicoAddress,
      owner: owner,
      prices: {
        eth: ethers.formatEther(ethPrice),
        usdt: ethers.formatUnits(usdtPrice, 6),
        usdc: ethers.formatUnits(usdcPrice, 6)
      },
      minimums: {
        eth: ethers.formatEther(minETH),
        usd: ethers.formatUnits(minUSD, 6)
      },
      validation: {
        ethValid: ethPrice >= minETH,
        usdtValid: usdtPrice >= minUSD,
        usdcValid: usdcPrice >= minUSD
      }
    };
    
    console.log(JSON.stringify(report, null, 2));
    
  } catch (error) {
    console.log("❌ Error generating report:", error.message);
  }
}

// Command line argument handling
if (process.argv.includes("--report")) {
  const address = process.env.SEQICO_ADDRESS || process.argv[process.argv.indexOf("--report") + 1];
  generateDebugReport(address)
    .then(() => process.exit(0))
    .catch(console.error);
} else {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Script execution failed:", error);
      process.exit(1);
    });
}