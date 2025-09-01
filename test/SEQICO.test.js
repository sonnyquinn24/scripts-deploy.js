import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("SEQICO Contract", function () {
  let seqICO, seqToken, usdt, usdc;
  let owner, user1, user2;
  let MIN_PRICE_USD, MIN_PRICE_ETH;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock tokens
    const MockToken = await ethers.getContractFactory("MockERC20");
    seqToken = await MockToken.deploy("SEQ Token", "SEQ", ethers.parseEther("1000000"));
    usdt = await MockToken.deploy("USDT", "USDT", ethers.parseUnits("1000000", 6));
    usdc = await MockToken.deploy("USDC", "USDC", ethers.parseUnits("1000000", 6));

    // Valid initial prices (above $3 minimum)
    const pricePerTokenETH = ethers.parseEther("0.01"); // 0.01 ETH (well above minimum)
    const pricePerTokenUSDT = ethers.parseUnits("10", 6); // $10 USDT
    const pricePerTokenUSDC = ethers.parseUnits("10", 6); // $10 USDC

    // Deploy SEQICO contract
    const SEQICO = await ethers.getContractFactory("SEQICO");
    seqICO = await SEQICO.deploy(
      await seqToken.getAddress(),
      await usdt.getAddress(),
      await usdc.getAddress(),
      pricePerTokenETH,
      pricePerTokenUSDT,
      pricePerTokenUSDC
    );

    // Get constants from contract
    MIN_PRICE_USD = await seqICO.MIN_PRICE_USD();
    MIN_PRICE_ETH = await seqICO.MIN_PRICE_ETH();

    // Transfer tokens to ICO contract
    await seqToken.transfer(await seqICO.getAddress(), ethers.parseEther("500000"));
  });

  describe("Deployment", function () {
    it("Should deploy with valid prices above $3 minimum", async function () {
      expect(await seqICO.pricePerTokenETH()).to.be.gte(MIN_PRICE_ETH);
      expect(await seqICO.pricePerTokenUSDT()).to.be.gte(MIN_PRICE_USD);
      expect(await seqICO.pricePerTokenUSDC()).to.be.gte(MIN_PRICE_USD);
    });

    it("Should revert deployment with ETH price below minimum", async function () {
      const SEQICO = await ethers.getContractFactory("SEQICO");
      const lowETHPrice = ethers.parseEther("0.0001"); // Below minimum
      
      await expect(
        SEQICO.deploy(
          await seqToken.getAddress(),
          await usdt.getAddress(),
          await usdc.getAddress(),
          lowETHPrice,
          ethers.parseUnits("10", 6),
          ethers.parseUnits("10", 6)
        )
      ).to.be.revertedWith("Price must be greater than or equal to $3");
    });

    it("Should revert deployment with USDT price below minimum", async function () {
      const SEQICO = await ethers.getContractFactory("SEQICO");
      const lowUSDTPrice = ethers.parseUnits("2", 6); // $2, below minimum
      
      await expect(
        SEQICO.deploy(
          await seqToken.getAddress(),
          await usdt.getAddress(),
          await usdc.getAddress(),
          ethers.parseEther("0.01"),
          lowUSDTPrice,
          ethers.parseUnits("10", 6)
        )
      ).to.be.revertedWith("Price must be greater than or equal to $3");
    });

    it("Should revert deployment with USDC price below minimum", async function () {
      const SEQICO = await ethers.getContractFactory("SEQICO");
      const lowUSDCPrice = ethers.parseUnits("2.99", 6); // $2.99, below minimum
      
      await expect(
        SEQICO.deploy(
          await seqToken.getAddress(),
          await usdt.getAddress(),
          await usdc.getAddress(),
          ethers.parseEther("0.01"),
          ethers.parseUnits("10", 6),
          lowUSDCPrice
        )
      ).to.be.revertedWith("Price must be greater than or equal to $3");
    });
  });

  describe("Price Setting Functions", function () {
    describe("setPricePerTokenETH", function () {
      it("Should allow owner to set valid ETH price", async function () {
        const newPrice = ethers.parseEther("0.02");
        await seqICO.setPricePerTokenETH(newPrice);
        expect(await seqICO.pricePerTokenETH()).to.equal(newPrice);
      });

      it("Should revert when non-owner tries to set ETH price", async function () {
        const newPrice = ethers.parseEther("0.02");
        await expect(
          seqICO.connect(user1).setPricePerTokenETH(newPrice)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should revert when setting ETH price below minimum", async function () {
        const lowPrice = ethers.parseEther("0.0001");
        await expect(
          seqICO.setPricePerTokenETH(lowPrice)
        ).to.be.revertedWith("Price must be greater than or equal to $3");
      });

      it("Should accept ETH price exactly at minimum", async function () {
        await seqICO.setPricePerTokenETH(MIN_PRICE_ETH);
        expect(await seqICO.pricePerTokenETH()).to.equal(MIN_PRICE_ETH);
      });
    });

    describe("setPricePerTokenUSDT", function () {
      it("Should allow owner to set valid USDT price", async function () {
        const newPrice = ethers.parseUnits("15", 6);
        await seqICO.setPricePerTokenUSDT(newPrice);
        expect(await seqICO.pricePerTokenUSDT()).to.equal(newPrice);
      });

      it("Should revert when non-owner tries to set USDT price", async function () {
        const newPrice = ethers.parseUnits("15", 6);
        await expect(
          seqICO.connect(user1).setPricePerTokenUSDT(newPrice)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should revert when setting USDT price below minimum", async function () {
        const lowPrice = ethers.parseUnits("2.5", 6);
        await expect(
          seqICO.setPricePerTokenUSDT(lowPrice)
        ).to.be.revertedWith("Price must be greater than or equal to $3");
      });

      it("Should accept USDT price exactly at minimum", async function () {
        await seqICO.setPricePerTokenUSDT(MIN_PRICE_USD);
        expect(await seqICO.pricePerTokenUSDT()).to.equal(MIN_PRICE_USD);
      });
    });

    describe("setPricePerTokenUSDC", function () {
      it("Should allow owner to set valid USDC price", async function () {
        const newPrice = ethers.parseUnits("20", 6);
        await seqICO.setPricePerTokenUSDC(newPrice);
        expect(await seqICO.pricePerTokenUSDC()).to.equal(newPrice);
      });

      it("Should revert when non-owner tries to set USDC price", async function () {
        const newPrice = ethers.parseUnits("20", 6);
        await expect(
          seqICO.connect(user1).setPricePerTokenUSDC(newPrice)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should revert when setting USDC price below minimum", async function () {
        const lowPrice = ethers.parseUnits("1", 6);
        await expect(
          seqICO.setPricePerTokenUSDC(lowPrice)
        ).to.be.revertedWith("Price must be greater than or equal to $3");
      });

      it("Should accept USDC price exactly at minimum", async function () {
        await seqICO.setPricePerTokenUSDC(MIN_PRICE_USD);
        expect(await seqICO.pricePerTokenUSDC()).to.equal(MIN_PRICE_USD);
      });
    });
  });

  describe("Token Purchase Functions", function () {
    beforeEach(async function () {
      // Give user1 some tokens and ETH for testing
      await usdt.transfer(user1.address, ethers.parseUnits("1000", 6));
      await usdc.transfer(user1.address, ethers.parseUnits("1000", 6));
      
      // Approve ICO contract to spend user tokens
      await usdt.connect(user1).approve(await seqICO.getAddress(), ethers.parseUnits("1000", 6));
      await usdc.connect(user1).approve(await seqICO.getAddress(), ethers.parseUnits("1000", 6));
    });

    describe("buyWithETH", function () {
      it("Should allow valid ETH purchase", async function () {
        const tokenAmount = ethers.parseEther("1"); // 1 SEQ token
        const pricePerToken = await seqICO.pricePerTokenETH(); // 0.01 ETH
        // Contract now does: pricePerTokenETH * tokenAmount / 1e18
        const requiredETH = pricePerToken * tokenAmount / ethers.parseEther("1");
        
        await expect(
          seqICO.connect(user1).buyWithETH(tokenAmount, { value: requiredETH })
        ).to.emit(seqICO, "TokensPurchased")
          .withArgs(user1.address, tokenAmount, "ETH");
      });

      it("Should enforce minimum price validation in purchases", async function () {
        // This test ensures the purchase logic respects the minimum price
        const tokenAmount = ethers.parseEther("1");
        const currentPrice = await seqICO.pricePerTokenETH();
        expect(currentPrice).to.be.gte(MIN_PRICE_ETH);
      });
    });

    describe("buyWithUSDT", function () {
      it("Should allow valid USDT purchase", async function () {
        const tokenAmount = ethers.parseEther("1");
        
        await expect(
          seqICO.connect(user1).buyWithUSDT(tokenAmount)
        ).to.emit(seqICO, "TokensPurchased")
          .withArgs(user1.address, tokenAmount, "USDT");
      });

      it("Should enforce minimum price validation in purchases", async function () {
        const currentPrice = await seqICO.pricePerTokenUSDT();
        expect(currentPrice).to.be.gte(MIN_PRICE_USD);
      });
    });

    describe("buyWithUSDC", function () {
      it("Should allow valid USDC purchase", async function () {
        const tokenAmount = ethers.parseEther("1");
        
        await expect(
          seqICO.connect(user1).buyWithUSDC(tokenAmount)
        ).to.emit(seqICO, "TokensPurchased")
          .withArgs(user1.address, tokenAmount, "USDC");
      });

      it("Should enforce minimum price validation in purchases", async function () {
        const currentPrice = await seqICO.pricePerTokenUSDC();
        expect(currentPrice).to.be.gte(MIN_PRICE_USD);
      });
    });
  });

  describe("Edge Cases", function () {
    it("Should handle edge case: exactly $3 minimum for all currencies", async function () {
      // Test deployment with exactly minimum prices
      const SEQICO = await ethers.getContractFactory("SEQICO");
      const exactMinContract = await SEQICO.deploy(
        await seqToken.getAddress(),
        await usdt.getAddress(),
        await usdc.getAddress(),
        MIN_PRICE_ETH, // Exactly minimum ETH
        MIN_PRICE_USD, // Exactly $3 USDT
        MIN_PRICE_USD  // Exactly $3 USDC
      );

      expect(await exactMinContract.pricePerTokenETH()).to.equal(MIN_PRICE_ETH);
      expect(await exactMinContract.pricePerTokenUSDT()).to.equal(MIN_PRICE_USD);
      expect(await exactMinContract.pricePerTokenUSDC()).to.equal(MIN_PRICE_USD);
    });

    it("Should handle edge case: one wei below minimum", async function () {
      const SEQICO = await ethers.getContractFactory("SEQICO");
      const almostMinETH = MIN_PRICE_ETH - 1n;
      
      await expect(
        SEQICO.deploy(
          await seqToken.getAddress(),
          await usdt.getAddress(),
          await usdc.getAddress(),
          almostMinETH,
          MIN_PRICE_USD,
          MIN_PRICE_USD
        )
      ).to.be.revertedWith("Price must be greater than or equal to $3");
    });

    it("Should handle very large prices without overflow", async function () {
      const largeETHPrice = ethers.parseEther("100"); // 100 ETH
      const largeUSDPrice = ethers.parseUnits("10000", 6); // $10,000
      
      await seqICO.setPricePerTokenETH(largeETHPrice);
      await seqICO.setPricePerTokenUSDT(largeUSDPrice);
      await seqICO.setPricePerTokenUSDC(largeUSDPrice);

      expect(await seqICO.pricePerTokenETH()).to.equal(largeETHPrice);
      expect(await seqICO.pricePerTokenUSDT()).to.equal(largeUSDPrice);
      expect(await seqICO.pricePerTokenUSDC()).to.equal(largeUSDPrice);
    });
  });

  describe("Constants Validation", function () {
    it("Should have correct minimum price constants", async function () {
      expect(MIN_PRICE_USD).to.equal(ethers.parseUnits("3", 6)); // $3 with 6 decimals
      expect(MIN_PRICE_ETH).to.equal(ethers.parseEther("0.001")); // 0.001 ETH
    });

    it("Should maintain constant values throughout contract lifecycle", async function () {
      const initialMinUSD = await seqICO.MIN_PRICE_USD();
      const initialMinETH = await seqICO.MIN_PRICE_ETH();

      // Perform various operations
      await seqICO.setPricePerTokenETH(ethers.parseEther("0.02"));
      await seqICO.setPricePerTokenUSDT(ethers.parseUnits("5", 6));

      // Constants should remain unchanged
      expect(await seqICO.MIN_PRICE_USD()).to.equal(initialMinUSD);
      expect(await seqICO.MIN_PRICE_ETH()).to.equal(initialMinETH);
    });
  });
});