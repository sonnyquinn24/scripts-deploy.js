import hre from "hardhat";
const { ethers } = hre;

async function main() {
  // Addresses
  const OWNER = "0x4B958C04701616A0ffF821E9b2db130983c5f3E4";
  const usdtAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7"; // USDT mainnet
  const usdcAddress = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"; // Your USDC wallet

  // Prices (customize if needed)
  const pricePerTokenETH = ethers.parseEther("0.01"); // 0.01 ETH per SEQ
  const pricePerTokenUSDT = 10_000_000; // 10 USDT (6 decimals)
  const pricePerTokenUSDC = 10_000_000; // 10 USDC (6 decimals)

  // 1. Deploy ICO contract first (dummy token address for now)
  const SeqIco = await ethers.getContractFactory("SeqIco");
  const dummyToken = "0x0000000000000000000000000000000000000000";
  const seqIco = await SeqIco.deploy(
    dummyToken,
    usdtAddress,
    usdcAddress,
    pricePerTokenETH,
    pricePerTokenUSDT,
    pricePerTokenUSDC
  );
  await seqIco.waitForDeployment();
  const ICO_ADDRESS = await seqIco.getAddress();
  console.log("SeqIco deployed to:", ICO_ADDRESS);

  // 2. Deploy SEQToken with 10% to owner, 90% to ICO contract
  const totalSupply = ethers.parseEther("500000");
  const SeqToken = await ethers.getContractFactory("SeqToken");
  const seqToken = await SeqToken.deploy(totalSupply, OWNER, ICO_ADDRESS);
  await seqToken.waitForDeployment();
  const seqTokenAddress = await seqToken.getAddress();
  console.log("SeqToken deployed to:", seqTokenAddress);

  // 3. Update ICO contract with real SEQ token address
  await seqIco.setSeqToken(seqTokenAddress);
  console.log("SeqIco updated with SEQ token address");

  // 4. (Optional) Print balances for verification
  const ownerBal = await seqToken.balanceOf(OWNER);
  const icoBal = await seqToken.balanceOf(ICO_ADDRESS);
  console.log("Owner balance:", ethers.formatEther(ownerBal));
  console.log("ICO balance:", ethers.formatEther(icoBal));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
