import { expect } from "chai";
import { ethers } from "hardhat";

describe("SEQToken", function () {
  let seqToken;
  let owner, ico, otherAccount;
  const totalSupply = ethers.parseEther("500000"); // 500,000 SEQ

  beforeEach(async function () {
    [owner, ico, otherAccount] = await ethers.getSigners();
    
    const SEQToken = await ethers.getContractFactory("SEQToken");
    seqToken = await SEQToken.deploy(totalSupply, owner.address, ico.address);
    await seqToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await seqToken.name()).to.equal("SEQ Token");
      expect(await seqToken.symbol()).to.equal("SEQ");
    });

    it("Should mint 10% to owner and 90% to ICO", async function () {
      const ownerBalance = await seqToken.balanceOf(owner.address);
      const icoBalance = await seqToken.balanceOf(ico.address);
      
      const expectedOwnerAmount = (totalSupply * 10n) / 100n; // 10%
      const expectedIcoAmount = totalSupply - expectedOwnerAmount; // 90%
      
      expect(ownerBalance).to.equal(expectedOwnerAmount);
      expect(icoBalance).to.equal(expectedIcoAmount);
    });

    it("Should have correct total supply", async function () {
      const totalSupplyFromContract = await seqToken.totalSupply();
      expect(totalSupplyFromContract).to.equal(totalSupply);
    });

    it("Should revert if owner address is zero", async function () {
      const SEQToken = await ethers.getContractFactory("SEQToken");
      await expect(
        SEQToken.deploy(totalSupply, ethers.ZeroAddress, ico.address)
      ).to.be.revertedWith("Owner address cannot be zero");
    });

    it("Should revert if ICO address is zero", async function () {
      const SEQToken = await ethers.getContractFactory("SEQToken");
      await expect(
        SEQToken.deploy(totalSupply, owner.address, ethers.ZeroAddress)
      ).to.be.revertedWith("ICO address cannot be zero");
    });
  });
});