import hre from "hardhat";
const { ethers } = hre;

// Replace with your deployed SEQICO contract address
const SEQICO_ADDRESS = "YOUR_DEPLOYED_SEQICO_ADDRESS_HERE"; // <-- Replace with your deployed SEQICO address

// Validation to ensure a proper address is set before running the script
if (
  !SEQICO_ADDRESS ||
  SEQICO_ADDRESS === "YOUR_DEPLOYED_SEQICO_ADDRESS_HERE" ||
  SEQICO_ADDRESS === "0x..." ||
  !/^0x[a-fA-F0-9]{40}$/.test(SEQICO_ADDRESS)
) {
  throw new Error("❌ Please set SEQICO_ADDRESS to your deployed SEQICO contract address before running this script.");
}

async function main() {
  console.log("🚀 Setting new prices for SEQICO contract...");
  console.log("📍 SEQICO Address:", SEQICO_ADDRESS);

  // Get the contract instance
  const SEQICO = await ethers.getContractFactory("SEQICO");
  const seqICO = SEQICO.attach(SEQICO_ADDRESS);

  // New prices (customize as needed)
  const newPricePerTokenETH = ethers.parseEther("0.015"); // 0.015 ETH per SEQ
  const newPricePerTokenUSDT = 15_000_000; // 15 USDT (6 decimals)
  const newPricePerTokenUSDC = 15_000_000; // 15 USDC (6 decimals)

  try {
    // Update ETH price
    console.log("🔄 Updating ETH price...");
    const ethTx = await seqICO.updatePriceETH(newPricePerTokenETH);
    await ethTx.wait();
    console.log("✅ ETH price updated to:", ethers.formatEther(newPricePerTokenETH), "ETH per SEQ");

    // Update USDT price
    console.log("🔄 Updating USDT price...");
    const usdtTx = await seqICO.updatePriceUSDT(newPricePerTokenUSDT);
    await usdtTx.wait();
    console.log("✅ USDT price updated to:", newPricePerTokenUSDT / 1_000_000, "USDT per SEQ");

    // Update USDC price
    console.log("🔄 Updating USDC price...");
    const usdcTx = await seqICO.updatePriceUSDC(newPricePerTokenUSDC);
    await usdcTx.wait();
    console.log("✅ USDC price updated to:", newPricePerTokenUSDC / 1_000_000, "USDC per SEQ");

    console.log("🎉 All prices updated successfully!");

  } catch (error) {
    console.error("❌ Error updating prices:", error.message);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});