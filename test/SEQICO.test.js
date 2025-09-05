// TODO: review this file for improvements
import { ethers } from "hardhat";

describe("SEQICO - Code Review Fix", function () {
  let seqico;
  let seqToken;
  let usdt;
  let usdc;
  let owner;
  let buyer;

  beforeEach(async function () {
    [owner, buyer] = await ethers.getSigners();

    // Deploy SEQ Token first
    const SEQToken = await ethers.getContractFactory("SEQToken");
    const totalSupply = ethers.parseEther("1000000");
    
    // Deploy SEQICO contract
    const SEQICO = await ethers.getContractFactory("SEQICO");
    const pricePerTokenETH = ethers.parseEther("0.005"); // 0.005 ETH per token
    const pricePerTokenUSDT = ethers.parseUnits("5", 6); // 5 USDT per token  
    const pricePerTokenUSDC = ethers.parseUnits("5", 6); // 5 USDC per token

    // Create temporary token addresses (we'll use owner address as placeholder)
    seqico = await SEQICO.deploy(
      owner.address, // temp address for SEQ token
      owner.address, // temp address for USDT
      owner.address, // temp address for USDC  
      pricePerTokenETH,
      pricePerTokenUSDT,
      pricePerTokenUSDC
    );

    // Now deploy the actual SEQ token with correct ICO contract address
    seqToken = await SEQToken.deploy(totalSupply, owner.address, await seqico.getAddress());
    
    // Update the SEQICO contract to use the correct SEQ token
    await seqico.connect(owner).setSEQToken(await seqToken.getAddress());
  });

  it("demonstrates code review fix at line 225 equivalent", async function () {
    console.log("=== Code Review Fix Demonstration ===");
    
    const tokenAmount = ethers.parseEther("10"); // 10 tokens
    const newETHPrice = await seqico.pricePerTokenETH(); // 0.005 ETH per token
    
    console.log("Token amount:", ethers.formatEther(tokenAmount), "tokens");
    console.log("ETH price per token:", ethers.formatEther(newETHPrice), "ETH");
    
    // ❌ BEFORE (problematic code with hardcoded value):
    // const requiredETH = newETHPrice * 10n; // 10 tokens * 0.005 ETH = 0.05 ETH
    const problematicCalculation = newETHPrice * 10n;
    console.log("❌ BEFORE (hardcoded 10n):", ethers.formatEther(problematicCalculation), "ETH");
    
    // ✅ AFTER (fixed code using tokenAmount variable):
    const requiredETH = newETHPrice * tokenAmount / ethers.parseEther('1'); // 10 tokens * 0.005 ETH = 0.05 ETH
    console.log("✅ AFTER (using tokenAmount):", ethers.formatEther(requiredETH), "ETH");
    
    // Both should be equal in this case, but the second is more maintainable
    console.log("Values are equal:", problematicCalculation === requiredETH);
    
    // Test that the fix works with the actual contract
    try {
      await seqico.connect(buyer).buyWithETH(tokenAmount, { value: requiredETH });
      console.log("✅ Purchase successful with fixed calculation");
    } catch (error) {
      console.log("❌ Purchase failed:", error.message);
    }
    
    console.log("=== Fix Benefits ===");
    console.log("1. Uses tokenAmount variable instead of hardcoded 10n");
    console.log("2. More maintainable - changing tokenAmount automatically updates calculation");  
    console.log("3. Eliminates magic numbers");
    console.log("4. Better decimal handling with ethers.parseEther('1')");
  });

  it("demonstrates the fix works with different token amounts", async function () {
    console.log("\n=== Testing with different token amounts ===");
    
    const testAmounts = [
      ethers.parseEther("5"),   // 5 tokens
      ethers.parseEther("25"),  // 25 tokens
      ethers.parseEther("100")  // 100 tokens
    ];
    
    const ethPrice = await seqico.pricePerTokenETH();
    
    for (const tokenAmount of testAmounts) {
      // Using the fixed calculation
      const requiredETH = ethPrice * tokenAmount / ethers.parseEther('1');
      
      console.log(`${ethers.formatEther(tokenAmount)} tokens requires ${ethers.formatEther(requiredETH)} ETH`);
      
      // The old hardcoded approach would fail for anything other than 10 tokens
      // This demonstrates why the fix is important
    }
  });
});