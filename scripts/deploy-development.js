import { ethers } from "hardhat";

async function main() {
  // Addresses
  const OWNER_ADDRESS = "0x4B958C04701616A0ffF821E9b2db130983c5f3E4";
  const USDT_CONTRACT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7"; // USDT mainnet
  const USDC_CONTRACT_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"; // Your USDC wallet

  // Prices (customize if needed)
  const PRICE_PER_TOKEN_ETH = ethers.parseEther("0.01"); // 0.01 ETH per SEQ
  const PRICE_PER_TOKEN_USDT = 10_000_000; // 10 USDT (6 decimals)
  const PRICE_PER_TOKEN_USDC = 10_000_000; // 10 USDC (6 decimals)

  // 1. Deploy ICO contract first (dummy token address for now)
  const SEQICOFactory = await ethers.getContractFactory("SEQICO");
  const DUMMY_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";
  const seqIcoContract = await SEQICOFactory.deploy(
    DUMMY_TOKEN_ADDRESS,
    USDT_CONTRACT_ADDRESS,
    USDC_CONTRACT_ADDRESS,
    PRICE_PER_TOKEN_ETH,
    PRICE_PER_TOKEN_USDT,
    PRICE_PER_TOKEN_USDC
  );
  await seqIcoContract.waitForDeployment();
  const icoContractAddress = await seqIcoContract.getAddress();
  console.log("SEQICO deployed to:", icoContractAddress);

  // 2. Deploy SEQToken with 10% to owner, 90% to ICO contract
  const TOTAL_SUPPLY = ethers.parseEther("500000");
  const SEQTokenFactory = await ethers.getContractFactory("SEQToken");
  const seqTokenContract = await SEQTokenFactory.deploy(TOTAL_SUPPLY, OWNER_ADDRESS, icoContractAddress);
  await seqTokenContract.waitForDeployment();
  const seqTokenAddress = await seqTokenContract.getAddress();
  console.log("SEQToken deployed to:", seqTokenAddress);

  // 3. Update ICO contract with real SEQ token address
  await seqIcoContract.setSEQToken(seqTokenAddress);
  console.log("SEQICO updated with SEQ token address");

  // 4. (Optional) Print balances for verification
  const ownerBalance = await seqTokenContract.balanceOf(OWNER_ADDRESS);
  const icoBalance = await seqTokenContract.balanceOf(icoContractAddress);
  console.log("Owner balance:", ethers.formatEther(ownerBalance));
  console.log("ICO balance:", ethers.formatEther(icoBalance));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
