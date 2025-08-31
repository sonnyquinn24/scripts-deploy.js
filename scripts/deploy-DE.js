import { ethers } from "hardhat";

async function main() {
  // Addresses
  const OWNER = "0x4B958C04701616A0ffF821E9b2db130983c5f3E4";
  const usdtAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7"; // USDT mainnet
  const usdcAddress = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"; // Your USDC wallet

  // Prices (customize if needed) - Ensuring $3 minimum price validation
  const pricePerTokenETH = ethers.parseEther("0.001"); // 0.001 ETH per SEQ (~$2-3 depending on ETH price)
  const pricePerTokenUSDT = 3_000_000; // $3 USDT (6 decimals) - minimum allowed
  const pricePerTokenUSDC = 3_000_000; // $3 USDC (6 decimals) - minimum allowed

  // 1. Deploy ICO contract first (dummy token address for now)
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
  const totalSupply = ethers.parseEther("500000");
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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
