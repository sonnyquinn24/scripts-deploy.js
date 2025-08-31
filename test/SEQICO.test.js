import { expect } from "chai";
import { ethers } from "hardhat";

describe("SEQICO Contract", function () {
  let seqico;
  let seqToken;
  let usdt;
  let usdc;
  let owner;
  let buyer;
  let addr1;

  const MINIMUM_USD_PRICE = 3_000_000; // $3 with 6 decimals

  beforeEach(async function () {
    [owner, buyer, addr1] = await ethers.getSigners();

    // Deploy mock ERC20 tokens for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    seqToken = await MockERC20.deploy("SEQ Token", "SEQ", ethers.parseEther("1000000"));
    usdt = await MockERC20.deploy("Tether USD", "USDT", ethers.parseUnits("1000000", 6));
    usdc = await MockERC20.deploy("USD Coin", "USDC", ethers.parseUnits("1000000", 6));

    await seqToken.waitForDeployment();
    await usdt.waitForDeployment();
    await usdc.waitForDeployment();

    // Valid prices for deployment (above $3 minimum)
    const pricePerTokenETH = ethers.parseEther("0.001"); // 0.001 ETH
    const pricePerTokenUSDT = 3_000_000; // $3 USDT
    const pricePerTokenUSDC = 3_000_000; // $3 USDC

    // Deploy SEQICO contract
    const SEQICO = await ethers.getContractFactory("SEQICO");
    seqico = await SEQICO.deploy(
      await seqToken.getAddress(),
      await usdt.getAddress(),
      await usdc.getAddress(),
      pricePerTokenETH,
      pricePerTokenUSDT,
      pricePerTokenUSDC
    );

    await seqico.waitForDeployment();
  });

  describe("Price Validation", function () {
    it("Should enforce minimum $3 USDT price during deployment", async function () {
      const SEQICO = await ethers.getContractFactory("SEQICO");
      
      // Try to deploy with USDT price below $3
      await expect(
        SEQICO.deploy(
          await seqToken.getAddress(),
          await usdt.getAddress(),
          await usdc.getAddress(),
          ethers.parseEther("0.001"),
          2_000_000, // $2 USDT - below minimum
          3_000_000
        )
      ).to.be.revertedWith("USDT price must be at least $3");
    });

    it("Should enforce minimum $3 USDC price during deployment", async function () {
      const SEQICO = await ethers.getContractFactory("SEQICO");
      
      // Try to deploy with USDC price below $3
      await expect(
        SEQICO.deploy(
          await seqToken.getAddress(),
          await usdt.getAddress(),
          await usdc.getAddress(),
          ethers.parseEther("0.001"),
          3_000_000,
          2_500_000 // $2.5 USDC - below minimum
        )
      ).to.be.revertedWith("USDC price must be at least $3");
    });

    it("Should allow valid prices during deployment", async function () {
      const SEQICO = await ethers.getContractFactory("SEQICO");
      
      const contract = await SEQICO.deploy(
        await seqToken.getAddress(),
        await usdt.getAddress(),
        await usdc.getAddress(),
        ethers.parseEther("0.001"),
        3_000_000, // $3 USDT
        5_000_000  // $5 USDC
      );

      await contract.waitForDeployment();
      
      expect(await contract.pricePerTokenUSDT()).to.equal(3_000_000);
      expect(await contract.pricePerTokenUSDC()).to.equal(5_000_000);
    });

    it("Should enforce minimum price when updating USDT price", async function () {
      await expect(
        seqico.updatePriceUSDT(2_000_000) // $2 - below minimum
      ).to.be.revertedWith("USDT price must be at least $3");
    });

    it("Should enforce minimum price when updating USDC price", async function () {
      await expect(
        seqico.updatePriceUSDC(2_900_000) // $2.9 - below minimum
      ).to.be.revertedWith("USDC price must be at least $3");
    });

    it("Should allow valid price updates", async function () {
      await seqico.updatePriceUSDT(4_000_000); // $4
      expect(await seqico.pricePerTokenUSDT()).to.equal(4_000_000);

      await seqico.updatePriceUSDC(3_500_000); // $3.5
      expect(await seqico.pricePerTokenUSDC()).to.equal(3_500_000);
    });

    it("Should emit PriceUpdated events", async function () {
      await expect(seqico.updatePriceUSDT(3_500_000))
        .to.emit(seqico, "PriceUpdated")
        .withArgs("USDT", 3_500_000);

      await expect(seqico.updatePriceUSDC(4_000_000))
        .to.emit(seqico, "PriceUpdated")
        .withArgs("USDC", 4_000_000);

      await expect(seqico.updatePriceETH(ethers.parseEther("0.002")))
        .to.emit(seqico, "PriceUpdated")
        .withArgs("ETH", ethers.parseEther("0.002"));
    });

    it("Should only allow owner to update prices", async function () {
      await expect(
        seqico.connect(buyer).updatePriceUSDT(4_000_000)
      ).to.be.revertedWithCustomError(seqico, "OwnableUnauthorizedAccount");

      await expect(
        seqico.connect(buyer).updatePriceUSDC(4_000_000)
      ).to.be.revertedWithCustomError(seqico, "OwnableUnauthorizedAccount");

      await expect(
        seqico.connect(buyer).updatePriceETH(ethers.parseEther("0.002"))
      ).to.be.revertedWithCustomError(seqico, "OwnableUnauthorizedAccount");
    });
  });

  describe("Token Purchase Functions", function () {
    beforeEach(async function () {
      // Transfer SEQ tokens to the ICO contract
      await seqToken.transfer(await seqico.getAddress(), ethers.parseEther("10000"));
      
      // Give buyer some USDT and USDC for testing
      await usdt.transfer(buyer.address, ethers.parseUnits("1000", 6));
      await usdc.transfer(buyer.address, ethers.parseUnits("1000", 6));
    });

    it("Should calculate correct USDT amount for token purchase", async function () {
      const tokenAmount = ethers.parseEther("1"); // 1 SEQ token
      const expectedUSDT = 3_000_000; // $3 USDT
      
      // Approve USDT spending
      await usdt.connect(buyer).approve(await seqico.getAddress(), expectedUSDT);
      
      // Buy tokens with USDT
      await expect(seqico.connect(buyer).buyWithUSDT(tokenAmount))
        .to.emit(seqico, "TokensPurchased")
        .withArgs(buyer.address, tokenAmount, "USDT");
    });

    it("Should calculate correct USDC amount for token purchase", async function () {
      const tokenAmount = ethers.parseEther("1"); // 1 SEQ token
      const expectedUSDC = 3_000_000; // $3 USDC
      
      // Approve USDC spending
      await usdc.connect(buyer).approve(await seqico.getAddress(), expectedUSDC);
      
      // Buy tokens with USDC
      await expect(seqico.connect(buyer).buyWithUSDC(tokenAmount))
        .to.emit(seqico, "TokensPurchased")
        .withArgs(buyer.address, tokenAmount, "USDC");
    });
  });
});