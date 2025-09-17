import { expect } from "chai";
import { ethers } from "hardhat";

describe("SEQToken", function () {
  let seqToken;
  let owner;
  let icoContract;
  let user1;
  let user2;
  const totalSupply = ethers.parseEther("500000"); // 500,000 SEQ tokens

  beforeEach(async function () {
    [owner, icoContract, user1, user2] = await ethers.getSigners();
    
    const SEQToken = await ethers.getContractFactory("SEQToken");
    seqToken = await SEQToken.deploy(totalSupply, owner.address, icoContract.address);
    await seqToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with correct name and symbol", async function () {
      expect(await seqToken.name()).to.equal("SEQ Token");
      expect(await seqToken.symbol()).to.equal("SEQ");
    });

    it("Should have correct total supply", async function () {
      expect(await seqToken.totalSupply()).to.equal(totalSupply);
    });

    it("Should distribute tokens correctly (10% to owner, 90% to ICO)", async function () {
      const ownerBalance = await seqToken.balanceOf(owner.address);
      const icoBalance = await seqToken.balanceOf(icoContract.address);
      
      const expectedOwnerAmount = (totalSupply * 10n) / 100n; // 10%
      const expectedIcoAmount = totalSupply - expectedOwnerAmount; // 90%
      
      expect(ownerBalance).to.equal(expectedOwnerAmount);
      expect(icoBalance).to.equal(expectedIcoAmount);
    });

    it("Should set correct owner", async function () {
      expect(await seqToken.owner()).to.equal(owner.address);
    });
  });

  describe("Balance Operations", function () {
    it("Should return correct balances", async function () {
      const ownerBalance = await seqToken.balanceOf(owner.address);
      const icoBalance = await seqToken.balanceOf(icoContract.address);
      
      expect(ownerBalance).to.be.gt(0);
      expect(icoBalance).to.be.gt(0);
      expect(ownerBalance + icoBalance).to.equal(totalSupply);
    });

    it("Should allow token transfers from owner", async function () {
      const transferAmount = ethers.parseEther("1000");
      
      await seqToken.connect(owner).transfer(user1.address, transferAmount);
      
      expect(await seqToken.balanceOf(user1.address)).to.equal(transferAmount);
    });

    it("Should allow approved token transfers", async function () {
      const transferAmount = ethers.parseEther("1000");
      
      // Owner approves user1 to spend tokens
      await seqToken.connect(owner).approve(user1.address, transferAmount);
      
      // user1 transfers from owner to user2
      await seqToken.connect(user1).transferFrom(owner.address, user2.address, transferAmount);
      
      expect(await seqToken.balanceOf(user2.address)).to.equal(transferAmount);
    });
  });

  describe("Access Control", function () {
    it("Should allow only owner to transfer ownership", async function () {
      await seqToken.connect(owner).transferOwnership(user1.address);
      expect(await seqToken.owner()).to.equal(user1.address);
    });

    it("Should not allow non-owner to transfer ownership", async function () {
      await expect(
        seqToken.connect(user1).transferOwnership(user2.address)
      ).to.be.revertedWithCustomError(seqToken, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to renounce ownership", async function () {
      await seqToken.connect(owner).renounceOwnership();
      expect(await seqToken.owner()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("ERC20 Compliance", function () {
    it("Should handle zero transfers", async function () {
      const initialBalance = await seqToken.balanceOf(owner.address);
      
      await seqToken.connect(owner).transfer(user1.address, 0);
      
      expect(await seqToken.balanceOf(owner.address)).to.equal(initialBalance);
      expect(await seqToken.balanceOf(user1.address)).to.equal(0);
    });

    it("Should emit Transfer events", async function () {
      const transferAmount = ethers.parseEther("1000");
      
      await expect(seqToken.connect(owner).transfer(user1.address, transferAmount))
        .to.emit(seqToken, "Transfer")
        .withArgs(owner.address, user1.address, transferAmount);
    });

    it("Should emit Approval events", async function () {
      const approvalAmount = ethers.parseEther("1000");
      
      await expect(seqToken.connect(owner).approve(user1.address, approvalAmount))
        .to.emit(seqToken, "Approval")
        .withArgs(owner.address, user1.address, approvalAmount);
    });
  });
});