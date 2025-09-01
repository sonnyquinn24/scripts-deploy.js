import { expect } from "chai";
import { ethers } from "hardhat";

describe("SEQICO", function () {
  let seqICO;
  let seqToken;
  let usdt;
  let usdc;
  let owner;
  let buyer;
  
  // Test constants
  const INITIAL_ETH_PRICE = ethers.parseEther("0.01"); // 0.01 ETH per token
  const INITIAL_USDT_PRICE = 10_000_000; // $10 with 6 decimals
  const INITIAL_USDC_PRICE = 10_000_000; // $10 with 6 decimals
  
  const MIN_PRICE_USD_STABLECOINS = 3_000_000; // $3 with 6 decimals
  const MIN_PRICE_ETH = ethers.parseEther("0.001"); // 0.001 ETH
  
  beforeEach(async function () {
    [owner, buyer] = await ethers.getSigners();
    
    // Deploy mock USDT and USDC contracts (using standard ERC20)
    const MockToken = await ethers.getContractFactory("MockERC20");
    usdt = await MockToken.deploy("Tether USD", "USDT", 6);
    usdc = await MockToken.deploy("USD Coin", "USDC", 6);
    
    // Deploy SEQ token
    const SEQToken = await ethers.getContractFactory("SEQToken");
    const totalSupply = ethers.parseEther("500000");
    seqToken = await SEQToken.deploy(totalSupply, owner.address, owner.address);
    
    // Deploy SEQICO
    const SEQICO = await ethers.getContractFactory("SEQICO");
    seqICO = await SEQICO.deploy(
      await seqToken.getAddress(),
      await usdt.getAddress(),
      await usdc.getAddress(),
      INITIAL_ETH_PRICE,
      INITIAL_USDT_PRICE,
      INITIAL_USDC_PRICE
    );
    
    // Transfer some SEQ tokens to the ICO contract
    const icoAddress = await seqICO.getAddress();
    await seqToken.transfer(icoAddress, ethers.parseEther("100000"));
  });

  describe("Price Setting Functions", function () {
    describe("setPriceETH", function () {
      it("Should allow owner to set ETH price above minimum", async function () {
        const newPrice = ethers.parseEther("0.02");
        
        await expect(seqICO.setPriceETH(newPrice))
          .to.emit(seqICO, "PriceUpdated")
          .withArgs("ETH", newPrice);
        
        expect(await seqICO.pricePerTokenETH()).to.equal(newPrice);
      });

      it("Should reject ETH price below $3 minimum", async function () {
        const lowPrice = ethers.parseEther("0.0005"); // Below 0.001 ETH minimum
        
        await expect(seqICO.setPriceETH(lowPrice))
          .to.be.revertedWith("ETH price below $3 minimum");
      });

      it("Should allow setting ETH price at exact minimum", async function () {
        await expect(seqICO.setPriceETH(MIN_PRICE_ETH))
          .to.emit(seqICO, "PriceUpdated")
          .withArgs("ETH", MIN_PRICE_ETH);
        
        expect(await seqICO.pricePerTokenETH()).to.equal(MIN_PRICE_ETH);
      });

      it("Should reject non-owner setting ETH price", async function () {
        const newPrice = ethers.parseEther("0.02");
        
        await expect(seqICO.connect(buyer).setPriceETH(newPrice))
          .to.be.revertedWithCustomError(seqICO, "OwnableUnauthorizedAccount");
      });
    });

    describe("setPriceUSDT", function () {
      it("Should allow owner to set USDT price above minimum", async function () {
        const newPrice = 5_000_000; // $5
        
        await expect(seqICO.setPriceUSDT(newPrice))
          .to.emit(seqICO, "PriceUpdated")
          .withArgs("USDT", newPrice);
        
        expect(await seqICO.pricePerTokenUSDT()).to.equal(newPrice);
      });

      it("Should reject USDT price below $3 minimum", async function () {
        const lowPrice = 2_000_000; // $2
        
        await expect(seqICO.setPriceUSDT(lowPrice))
          .to.be.revertedWith("USDT price below $3 minimum");
      });

      it("Should allow setting USDT price at exact minimum", async function () {
        await expect(seqICO.setPriceUSDT(MIN_PRICE_USD_STABLECOINS))
          .to.emit(seqICO, "PriceUpdated")
          .withArgs("USDT", MIN_PRICE_USD_STABLECOINS);
        
        expect(await seqICO.pricePerTokenUSDT()).to.equal(MIN_PRICE_USD_STABLECOINS);
      });

      it("Should reject non-owner setting USDT price", async function () {
        const newPrice = 5_000_000;
        
        await expect(seqICO.connect(buyer).setPriceUSDT(newPrice))
          .to.be.revertedWithCustomError(seqICO, "OwnableUnauthorizedAccount");
      });
    });

    describe("setPriceUSDC", function () {
      it("Should allow owner to set USDC price above minimum", async function () {
        const newPrice = 8_000_000; // $8
        
        await expect(seqICO.setPriceUSDC(newPrice))
          .to.emit(seqICO, "PriceUpdated")
          .withArgs("USDC", newPrice);
        
        expect(await seqICO.pricePerTokenUSDC()).to.equal(newPrice);
      });

      it("Should reject USDC price below $3 minimum", async function () {
        const lowPrice = 1_500_000; // $1.5
        
        await expect(seqICO.setPriceUSDC(lowPrice))
          .to.be.revertedWith("USDC price below $3 minimum");
      });

      it("Should allow setting USDC price at exact minimum", async function () {
        await expect(seqICO.setPriceUSDC(MIN_PRICE_USD_STABLECOINS))
          .to.emit(seqICO, "PriceUpdated")
          .withArgs("USDC", MIN_PRICE_USD_STABLECOINS);
        
        expect(await seqICO.pricePerTokenUSDC()).to.equal(MIN_PRICE_USD_STABLECOINS);
      });

      it("Should reject non-owner setting USDC price", async function () {
        const newPrice = 8_000_000;
        
        await expect(seqICO.connect(buyer).setPriceUSDC(newPrice))
          .to.be.revertedWithCustomError(seqICO, "OwnableUnauthorizedAccount");
      });
    });
  });

  describe("Constructor Validation", function () {
    it("Should reject deployment with ETH price below minimum", async function () {
      const SEQICO = await ethers.getContractFactory("SEQICO");
      const lowETHPrice = ethers.parseEther("0.0005");
      
      await expect(SEQICO.deploy(
        await seqToken.getAddress(),
        await usdt.getAddress(),
        await usdc.getAddress(),
        lowETHPrice,
        INITIAL_USDT_PRICE,
        INITIAL_USDC_PRICE
      )).to.be.revertedWith("ETH price below $3 minimum");
    });

    it("Should reject deployment with USDT price below minimum", async function () {
      const SEQICO = await ethers.getContractFactory("SEQICO");
      const lowUSDTPrice = 2_000_000; // $2
      
      await expect(SEQICO.deploy(
        await seqToken.getAddress(),
        await usdt.getAddress(),
        await usdc.getAddress(),
        INITIAL_ETH_PRICE,
        lowUSDTPrice,
        INITIAL_USDC_PRICE
      )).to.be.revertedWith("USDT price below $3 minimum");
    });

    it("Should reject deployment with USDC price below minimum", async function () {
      const SEQICO = await ethers.getContractFactory("SEQICO");
      const lowUSDCPrice = 2_500_000; // $2.5
      
      await expect(SEQICO.deploy(
        await seqToken.getAddress(),
        await usdt.getAddress(),
        await usdc.getAddress(),
        INITIAL_ETH_PRICE,
        INITIAL_USDT_PRICE,
        lowUSDCPrice
      )).to.be.revertedWith("USDC price below $3 minimum");
    });

    it("Should deploy successfully with all prices at minimum", async function () {
      const SEQICO = await ethers.getContractFactory("SEQICO");
      
      const contract = await SEQICO.deploy(
        await seqToken.getAddress(),
        await usdt.getAddress(),
        await usdc.getAddress(),
        MIN_PRICE_ETH,
        MIN_PRICE_USD_STABLECOINS,
        MIN_PRICE_USD_STABLECOINS
      );
      
      expect(await contract.pricePerTokenETH()).to.equal(MIN_PRICE_ETH);
      expect(await contract.pricePerTokenUSDT()).to.equal(MIN_PRICE_USD_STABLECOINS);
      expect(await contract.pricePerTokenUSDC()).to.equal(MIN_PRICE_USD_STABLECOINS);
    });
  });

  describe("Integration Tests", function () {
    it("Should work with updated prices for token purchases", async function () {
      // Set new prices
      const newETHPrice = ethers.parseEther("0.005");
      const newUSDTPrice = 5_000_000; // $5
      
      await seqICO.setPriceETH(newETHPrice);
      await seqICO.setPriceUSDT(newUSDTPrice);
      
      // Test ETH purchase with new price
      const tokenAmount = ethers.parseEther("10");
      const requiredETH = newETHPrice * 10n; // 10 tokens * 0.005 ETH = 0.05 ETH
      
      await expect(seqICO.connect(buyer).buyWithETH(tokenAmount, { value: requiredETH }))
        .to.emit(seqICO, "TokensPurchased")
        .withArgs(buyer.address, tokenAmount, "ETH");
    });
  });
});