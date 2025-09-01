import hre from "hardhat";
const { ethers } = hre;
import { expect } from "chai";

describe("SEQICO Integration Tests", function () {
  let seqToken;
  let seqICO;
  let owner;
  let buyer;
  let mockUSDT;
  let mockUSDC;

  beforeEach(async function () {
    [owner, buyer] = await ethers.getSigners();

    // Deploy mock USDT and USDC tokens for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUSDT = await MockERC20.deploy("Mock USDT", "USDT", 6);
    mockUSDC = await MockERC20.deploy("Mock USDC", "USDC", 6);
    await mockUSDT.waitForDeployment();
    await mockUSDC.waitForDeployment();

    // Initial prices
    const pricePerTokenETH = ethers.parseEther("0.01"); // 0.01 ETH per SEQ
    const pricePerTokenUSDT = 10_000_000; // 10 USDT (6 decimals)
    const pricePerTokenUSDC = 10_000_000; // 10 USDC (6 decimals)

    // Deploy SEQICO contract
    const SEQICO = await ethers.getContractFactory("SEQICO");
    const dummyToken = "0x0000000000000000000000000000000000000000";
    seqICO = await SEQICO.deploy(
      dummyToken,
      await mockUSDT.getAddress(),
      await mockUSDC.getAddress(),
      pricePerTokenETH,
      pricePerTokenUSDT,
      pricePerTokenUSDC
    );
    await seqICO.waitForDeployment();

    // Deploy SEQToken
    const totalSupply = ethers.parseEther("500000"); // 500,000 SEQ
    const SEQToken = await ethers.getContractFactory("SEQToken");
    seqToken = await SEQToken.deploy(
      totalSupply,
      owner.address,
      await seqICO.getAddress()
    );
    await seqToken.waitForDeployment();

    // Update ICO contract with real SEQ token address
    await seqICO.setSEQToken(await seqToken.getAddress());
  });

  describe("Price Updates", function () {
    it("Should work with updated prices for token purchases", async function () {
      // Update ETH price
      const newETHPrice = ethers.parseEther("0.02"); // 0.02 ETH per SEQ
      await seqICO.connect(owner).updatePriceETH(newETHPrice);

      const tokenAmount = ethers.parseEther("100"); // 100 SEQ tokens
      const requiredETH = (newETHPrice * tokenAmount) / ethers.parseEther('1');

      // Buyer purchases tokens with updated price
      await expect(
        seqICO.connect(buyer).buyWithETH(tokenAmount, { value: requiredETH })
      ).to.not.be.reverted;

      // Verify buyer received tokens
      const buyerBalance = await seqToken.balanceOf(buyer.address);
      expect(buyerBalance).to.equal(tokenAmount);
    });
  });
});