import { expect } from "chai";
import { ethers } from "hardhat";

describe("SEQICO Price Validation", function () {
  let SEQICO;
  let seqICO;
  let SEQToken;
  let seqToken;
  let MockERC20;
  let usdt;
  let usdc;
  let owner;
  let addr1;
  let addr2;

  // Minimum price constants
  const MIN_PRICE_ETH = ethers.parseEther("3"); // 3 ETH
  const MIN_PRICE_USDT = 3n * 10n**6n; // 3 USDT (6 decimals)
  const MIN_PRICE_USDC = 3n * 10n**6n; // 3 USDC (6 decimals)

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy mock ERC20 tokens for USDT and USDC
    MockERC20 = await ethers.getContractFactory("SEQToken");
    usdt = await MockERC20.deploy(
      ethers.parseEther("1000000"), // 1M supply
      owner.address,
      owner.address
    );
    usdc = await MockERC20.deploy(
      ethers.parseEther("1000000"), // 1M supply
      owner.address,
      owner.address
    );

    // Deploy SEQ token
    SEQToken = await ethers.getContractFactory("SEQToken");
    seqToken = await SEQToken.deploy(
      ethers.parseEther("500000"), // 500K supply
      owner.address,
      owner.address
    );

    // Deploy SEQICO contract
    SEQICO = await ethers.getContractFactory("SEQICO");
  });

  describe("Constructor price validation", function () {
    it("Should deploy successfully with valid prices", async function () {
      seqICO = await SEQICO.deploy(
        await seqToken.getAddress(),
        await usdt.getAddress(),
        await usdc.getAddress(),
        MIN_PRICE_ETH, // 3 ETH
        MIN_PRICE_USDT, // 3 USDT
        MIN_PRICE_USDC  // 3 USDC
      );
      await seqICO.waitForDeployment();

      expect(await seqICO.pricePerTokenETH()).to.equal(MIN_PRICE_ETH);
      expect(await seqICO.pricePerTokenUSDT()).to.equal(MIN_PRICE_USDT);
      expect(await seqICO.pricePerTokenUSDC()).to.equal(MIN_PRICE_USDC);
    });

    it("Should revert when ETH price is below minimum", async function () {
      await expect(
        SEQICO.deploy(
          await seqToken.getAddress(),
          await usdt.getAddress(),
          await usdc.getAddress(),
          ethers.parseEther("2.9"), // Below 3 ETH
          MIN_PRICE_USDT,
          MIN_PRICE_USDC
        )
      ).to.be.revertedWith("Price must be greater than or equal to $3");
    });

    it("Should revert when USDT price is below minimum", async function () {
      await expect(
        SEQICO.deploy(
          await seqToken.getAddress(),
          await usdt.getAddress(),
          await usdc.getAddress(),
          MIN_PRICE_ETH,
          2999999n, // Below 3 USDT (2.999999)
          MIN_PRICE_USDC
        )
      ).to.be.revertedWith("Price must be greater than or equal to $3");
    });

    it("Should revert when USDC price is below minimum", async function () {
      await expect(
        SEQICO.deploy(
          await seqToken.getAddress(),
          await usdt.getAddress(),
          await usdc.getAddress(),
          MIN_PRICE_ETH,
          MIN_PRICE_USDT,
          2999999n // Below 3 USDC (2.999999)
        )
      ).to.be.revertedWith("Price must be greater than or equal to $3");
    });
  });

  describe("Price setter functions", function () {
    beforeEach(async function () {
      seqICO = await SEQICO.deploy(
        await seqToken.getAddress(),
        await usdt.getAddress(),
        await usdc.getAddress(),
        MIN_PRICE_ETH,
        MIN_PRICE_USDT,
        MIN_PRICE_USDC
      );
      await seqICO.waitForDeployment();
    });

    describe("setPricePerTokenETH", function () {
      it("Should set valid ETH price", async function () {
        const newPrice = ethers.parseEther("5");
        await seqICO.setPricePerTokenETH(newPrice);
        expect(await seqICO.pricePerTokenETH()).to.equal(newPrice);
      });

      it("Should accept exactly 3 ETH", async function () {
        await seqICO.setPricePerTokenETH(MIN_PRICE_ETH);
        expect(await seqICO.pricePerTokenETH()).to.equal(MIN_PRICE_ETH);
      });

      it("Should revert when setting ETH price below minimum", async function () {
        await expect(
          seqICO.setPricePerTokenETH(ethers.parseEther("2.9"))
        ).to.be.revertedWith("Price must be greater than or equal to $3");
      });

      it("Should revert when called by non-owner", async function () {
        await expect(
          seqICO.connect(addr1).setPricePerTokenETH(ethers.parseEther("5"))
        ).to.be.revertedWithCustomError(seqICO, "OwnableUnauthorizedAccount");
      });
    });

    describe("setPricePerTokenUSDT", function () {
      it("Should set valid USDT price", async function () {
        const newPrice = 5n * 10n**6n; // 5 USDT
        await seqICO.setPricePerTokenUSDT(newPrice);
        expect(await seqICO.pricePerTokenUSDT()).to.equal(newPrice);
      });

      it("Should accept exactly 3 USDT", async function () {
        await seqICO.setPricePerTokenUSDT(MIN_PRICE_USDT);
        expect(await seqICO.pricePerTokenUSDT()).to.equal(MIN_PRICE_USDT);
      });

      it("Should revert when setting USDT price below minimum", async function () {
        await expect(
          seqICO.setPricePerTokenUSDT(2999999n) // 2.999999 USDT
        ).to.be.revertedWith("Price must be greater than or equal to $3");
      });

      it("Should revert when called by non-owner", async function () {
        await expect(
          seqICO.connect(addr1).setPricePerTokenUSDT(5n * 10n**6n)
        ).to.be.revertedWithCustomError(seqICO, "OwnableUnauthorizedAccount");
      });
    });

    describe("setPricePerTokenUSDC", function () {
      it("Should set valid USDC price", async function () {
        const newPrice = 5n * 10n**6n; // 5 USDC
        await seqICO.setPricePerTokenUSDC(newPrice);
        expect(await seqICO.pricePerTokenUSDC()).to.equal(newPrice);
      });

      it("Should accept exactly 3 USDC", async function () {
        await seqICO.setPricePerTokenUSDC(MIN_PRICE_USDC);
        expect(await seqICO.pricePerTokenUSDC()).to.equal(MIN_PRICE_USDC);
      });

      it("Should revert when setting USDC price below minimum", async function () {
        await expect(
          seqICO.setPricePerTokenUSDC(2999999n) // 2.999999 USDC
        ).to.be.revertedWith("Price must be greater than or equal to $3");
      });

      it("Should revert when called by non-owner", async function () {
        await expect(
          seqICO.connect(addr1).setPricePerTokenUSDC(5n * 10n**6n)
        ).to.be.revertedWithCustomError(seqICO, "OwnableUnauthorizedAccount");
      });
    });
  });

  describe("Integration tests", function () {
    beforeEach(async function () {
      seqICO = await SEQICO.deploy(
        await seqToken.getAddress(),
        await usdt.getAddress(),
        await usdc.getAddress(),
        MIN_PRICE_ETH,
        MIN_PRICE_USDT,
        MIN_PRICE_USDC
      );
      await seqICO.waitForDeployment();
    });

    it("Should maintain price floor across multiple updates", async function () {
      // Set higher prices
      await seqICO.setPricePerTokenETH(ethers.parseEther("10"));
      await seqICO.setPricePerTokenUSDT(10n * 10n**6n);
      await seqICO.setPricePerTokenUSDC(15n * 10n**6n);

      // Verify prices are set
      expect(await seqICO.pricePerTokenETH()).to.equal(ethers.parseEther("10"));
      expect(await seqICO.pricePerTokenUSDT()).to.equal(10n * 10n**6n);
      expect(await seqICO.pricePerTokenUSDC()).to.equal(15n * 10n**6n);

      // Attempt to set below minimum should fail
      await expect(
        seqICO.setPricePerTokenETH(ethers.parseEther("1"))
      ).to.be.revertedWith("Price must be greater than or equal to $3");

      await expect(
        seqICO.setPricePerTokenUSDT(1n * 10n**6n)
      ).to.be.revertedWith("Price must be greater than or equal to $3");

      await expect(
        seqICO.setPricePerTokenUSDC(2n * 10n**6n)
      ).to.be.revertedWith("Price must be greater than or equal to $3");
    });
  });
});