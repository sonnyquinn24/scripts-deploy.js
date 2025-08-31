import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("=== Testing SEQICO Price Validation ===\n");
  console.log("Ethers available:", !!ethers);
  console.log("hre available:", !!hre);

  // Get signers
  const [owner, user] = await ethers.getSigners();
  console.log("Owner address:", owner.address);
  console.log("User address:", user.address);

  // Mock addresses for tokens
  const mockTokenAddress = "0x0000000000000000000000000000000000000001";
  const usdtAddress = "0x0000000000000000000000000000000000000002";
  const usdcAddress = "0x0000000000000000000000000000000000000003";

  // Test 1: Try to deploy with valid prices (should succeed)
  console.log("\n1. Testing deployment with valid prices...");
  try {
    const SEQICO = await ethers.getContractFactory("SEQICO");
    const validContract = await SEQICO.deploy(
      mockTokenAddress,
      usdtAddress,
      usdcAddress,
      ethers.parseEther("3"), // 3 ETH (minimum)
      3000000n, // 3 USDT
      3000000n  // 3 USDC
    );
    await validContract.waitForDeployment();
    console.log("✅ SUCCESS: Contract deployed with valid prices");
    console.log("ETH price:", ethers.formatEther(await validContract.pricePerTokenETH()));
    console.log("USDT price:", (await validContract.pricePerTokenUSDT()).toString());
    console.log("USDC price:", (await validContract.pricePerTokenUSDC()).toString());
  } catch (error) {
    console.log("❌ FAILED:", error.reason || error.message);
  }

  // Test 2: Try to deploy with invalid ETH price (should fail)
  console.log("\n2. Testing deployment with invalid ETH price...");
  try {
    const SEQICO = await ethers.getContractFactory("SEQICO");
    await SEQICO.deploy(
      mockTokenAddress,
      usdtAddress,
      usdcAddress,
      ethers.parseEther("2.9"), // Below 3 ETH
      3000000n,
      3000000n
    );
    console.log("❌ FAILED: Should have reverted but didn't");
  } catch (error) {
    if (error.message && error.message.includes("Price must be greater than or equal to $3")) {
      console.log("✅ SUCCESS: Correctly rejected low ETH price");
    } else {
      console.log("❌ FAILED: Wrong error:", error.reason || error.message);
    }
  }

  // Test 3: Try to deploy with invalid USDT price (should fail)
  console.log("\n3. Testing deployment with invalid USDT price...");
  try {
    const SEQICO = await ethers.getContractFactory("SEQICO");
    await SEQICO.deploy(
      mockTokenAddress,
      usdtAddress,
      usdcAddress,
      ethers.parseEther("3"),
      2999999n, // Below 3 USDT
      3000000n
    );
    console.log("❌ FAILED: Should have reverted but didn't");
  } catch (error) {
    if (error.message && error.message.includes("Price must be greater than or equal to $3")) {
      console.log("✅ SUCCESS: Correctly rejected low USDT price");
    } else {
      console.log("❌ FAILED: Wrong error:", error.reason || error.message);
    }
  }

  // Test 4: Try to deploy with invalid USDC price (should fail)
  console.log("\n4. Testing deployment with invalid USDC price...");
  try {
    const SEQICO = await ethers.getContractFactory("SEQICO");
    await SEQICO.deploy(
      mockTokenAddress,
      usdtAddress,
      usdcAddress,
      ethers.parseEther("3"),
      3000000n,
      2999999n // Below 3 USDC
    );
    console.log("❌ FAILED: Should have reverted but didn't");
  } catch (error) {
    if (error.message && error.message.includes("Price must be greater than or equal to $3")) {
      console.log("✅ SUCCESS: Correctly rejected low USDC price");
    } else {
      console.log("❌ FAILED: Wrong error:", error.reason || error.message);
    }
  }

  // Test 5: Test price setter functions
  console.log("\n5. Testing price setter functions...");
  try {
    const SEQICO = await ethers.getContractFactory("SEQICO");
    const contract = await SEQICO.deploy(
      mockTokenAddress,
      usdtAddress,
      usdcAddress,
      ethers.parseEther("3"),
      3000000n,
      3000000n
    );
    await contract.waitForDeployment();

    // Test valid price update
    await contract.setPricePerTokenETH(ethers.parseEther("5"));
    console.log("✅ SUCCESS: Updated ETH price to 5 ETH");

    // Test invalid price update
    try {
      await contract.setPricePerTokenETH(ethers.parseEther("1"));
      console.log("❌ FAILED: Should have reverted but didn't");
    } catch (error) {
      if (error.message && error.message.includes("Price must be greater than or equal to $3")) {
        console.log("✅ SUCCESS: Correctly rejected low ETH price update");
      } else {
        console.log("❌ FAILED: Wrong error:", error.reason || error.message);
      }
    }

    // Test non-owner access
    try {
      await contract.connect(user).setPricePerTokenETH(ethers.parseEther("5"));
      console.log("❌ FAILED: Should have reverted but didn't");
    } catch (error) {
      if (error.message && error.message.includes("OwnableUnauthorizedAccount")) {
        console.log("✅ SUCCESS: Correctly rejected non-owner access");
      } else {
        console.log("❌ FAILED: Wrong error:", error.reason || error.message);
      }
    }

  } catch (error) {
    console.log("❌ FAILED in setter tests:", error.reason || error.message);
  }

  console.log("\n=== Test Summary Complete ===");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});