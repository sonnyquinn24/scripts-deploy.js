import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("ICO Deployment", function () {
  let seqToken;
  let seqICO;
  let owner;
  let user1;
  let mockUSDT;
  let mockUSDC;

  const totalSupply = ethers.parseEther("500000"); // 500,000 SEQ
  const pricePerTokenETH = ethers.parseEther("0.01"); // 0.01 ETH per SEQ
  const pricePerTokenUSDT = 10_000_000; // 10 USDT (6 decimals)
  const pricePerTokenUSDC = 10_000_000; // 10 USDC (6 decimals)

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    // Deploy mock USDT and USDC tokens for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUSDT = await MockERC20.deploy("Mock USDT", "USDT", 6);
    mockUSDC = await MockERC20.deploy("Mock USDC", "USDC", 6);

    // Deploy ICO contract with dummy token address
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

    // Deploy SEQ token with 10% to owner, 90% to ICO contract
    const SEQToken = await ethers.getContractFactory("SEQToken");
    seqToken = await SEQToken.deploy(
      totalSupply,
      owner.address,
      await seqICO.getAddress()
    );

    // Update ICO contract with real SEQ token address
    await seqICO.setSEQToken(await seqToken.getAddress());
  });

  describe("Deployment", function () {
    it("Should deploy all contracts successfully", async function () {
      expect(await seqToken.getAddress()).to.be.properAddress;
      expect(await seqICO.getAddress()).to.be.properAddress;
    });

    it("Should distribute tokens correctly", async function () {
      const ownerBalance = await seqToken.balanceOf(owner.address);
      const icoBalance = await seqToken.balanceOf(await seqICO.getAddress());
      
      expect(ownerBalance).to.equal(ethers.parseEther("50000")); // 10% of 500,000
      expect(icoBalance).to.equal(ethers.parseEther("450000")); // 90% of 500,000
    });

    it("Should set correct token prices", async function () {
      expect(await seqICO.pricePerTokenETH()).to.equal(pricePerTokenETH);
      expect(await seqICO.pricePerTokenUSDT()).to.equal(pricePerTokenUSDT);
      expect(await seqICO.pricePerTokenUSDC()).to.equal(pricePerTokenUSDC);
    });
  });

  describe("Token Purchase with ETH", function () {
    it("Should allow buying tokens with ETH", async function () {
      const tokenAmount = ethers.parseEther("100"); // 100 SEQ tokens
      const requiredETH = pricePerTokenETH * tokenAmount / ethers.parseEther("1");

      await seqICO.connect(user1).buyWithETH(tokenAmount, { value: requiredETH });
      
      const userBalance = await seqToken.balanceOf(user1.address);
      expect(userBalance).to.equal(tokenAmount);
    });

    it("Should refund excess ETH", async function () {
      const tokenAmount = ethers.parseEther("100");
      const requiredETH = pricePerTokenETH * tokenAmount / ethers.parseEther("1");
      const excessETH = ethers.parseEther("0.1");

      const initialBalance = await ethers.provider.getBalance(user1.address);
      
      const tx = await seqICO.connect(user1).buyWithETH(tokenAmount, { 
        value: requiredETH + excessETH 
      });
      const receipt = await tx.wait();
      
      const finalBalance = await ethers.provider.getBalance(user1.address);
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      
      // Should only pay for tokens + gas, excess should be refunded
      expect(finalBalance).to.be.closeTo(
        initialBalance - requiredETH - gasCost,
        ethers.parseEther("0.001") // Small tolerance for gas variations
      );
    });

    it("Should reject insufficient ETH", async function () {
      const tokenAmount = ethers.parseEther("100");
      const insufficientETH = ethers.parseEther("0.5"); // Less than required

      await expect(
        seqICO.connect(user1).buyWithETH(tokenAmount, { value: insufficientETH })
      ).to.be.revertedWith("Insufficient ETH sent");
    });
  });

  describe("Access Control", function () {
    it("Should allow only owner to set SEQ token address", async function () {
      const newTokenAddress = ethers.Wallet.createRandom().address;
      
      await expect(seqICO.setSEQToken(newTokenAddress)).to.not.be.reverted;
      
      await expect(
        seqICO.connect(user1).setSEQToken(newTokenAddress)
      ).to.be.revertedWithCustomError(seqICO, "OwnableUnauthorizedAccount");
    });

    it("Should allow only owner to withdraw ETH", async function () {
      // First buy some tokens to have ETH in contract
      const tokenAmount = ethers.parseEther("100");
      const requiredETH = pricePerTokenETH * tokenAmount / ethers.parseEther("1");
      await seqICO.connect(user1).buyWithETH(tokenAmount, { value: requiredETH });

      await expect(seqICO.withdrawETH(owner.address)).to.not.be.reverted;
      
      await expect(
        seqICO.connect(user1).withdrawETH(user1.address)
      ).to.be.revertedWithCustomError(seqICO, "OwnableUnauthorizedAccount");
    });
  });
});