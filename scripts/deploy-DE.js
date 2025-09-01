import hre from "hardhat";
const { ethers } = hre;

async function main() {
  // Addresses
  const OWNER = "0x4B958C04701616A0ffF821E9b2db130983c5f3E4";
  const usdtAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7"; // USDT mainnet
  const usdcAddress = "0xC217804689327649D4Fd89C9a269395084728BEF"; // USDC contract address

  // Prices (customize if needed)
  const pricePerTokenETH = ethers.parseEther("0.01"); // 0.01 ETH per SEQ
  const pricePerTokenUSDT = 10_000_000; // 10 USDT (6 decimals)
  const pricePerTokenUSDC = 10_000_000; // 10 USDC (6 decimals)

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
