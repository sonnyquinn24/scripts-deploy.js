import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("SEQICO Deployment Test", function () {
  let seqICO;
  let seqToken;
  let owner;
  let buyer;

  beforeEach(async function () {
    [owner, buyer] = await ethers.getSigners();

    // Deploy with deployment script logic
    const OWNER = owner.address;
    const usdtAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7";
    const usdcAddress = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
    
    const pricePerTokenETH = ethers.parseEther("0.01");
    const pricePerTokenUSDT = 10_000_000;
    const pricePerTokenUSDC = 10_000_000;

    // Deploy ICO contract first
    const SEQICO = await ethers.getContractFactory("SEQICO");
    const dummyToken = "0x0000000000000000000000000000000000000000";
    seqICO = await SEQICO.deploy(
      dummyToken,
      usdtAddress,
      usdcAddress,
      pricePerTokenETH,
      pricePerTokenUSDT,
      pricePerTokenUSDC
    );
    await seqICO.waitForDeployment();

    // Deploy SEQToken
    const totalSupply = ethers.parseEther("500000");
    const SEQToken = await ethers.getContractFactory("SEQToken");
    seqToken = await SEQToken.deploy(totalSupply, OWNER, await seqICO.getAddress());
    await seqToken.waitForDeployment();

    // Update ICO with real token
    await seqICO.setSEQToken(await seqToken.getAddress());
  });

  it("Should deploy contracts correctly", async function () {
    expect(await seqToken.name()).to.equal("SEQ Token");
    expect(await seqToken.symbol()).to.equal("SEQ");
    expect(await seqToken.totalSupply()).to.equal(ethers.parseEther("500000"));
  });

  it("Should distribute tokens correctly", async function () {
    const ownerBalance = await seqToken.balanceOf(owner.address);
    const icoBalance = await seqToken.balanceOf(await seqICO.getAddress());
    
    expect(ownerBalance).to.equal(ethers.parseEther("50000")); // 10%
    expect(icoBalance).to.equal(ethers.parseEther("450000")); // 90%
  });

  it("Should set contract properties correctly", async function () {
    expect(await seqICO.pricePerTokenETH()).to.equal(ethers.parseEther("0.01"));
    expect(await seqICO.pricePerTokenUSDT()).to.equal(10_000_000);
    expect(await seqICO.pricePerTokenUSDC()).to.equal(10_000_000);
    expect(await seqICO.seqToken()).to.equal(await seqToken.getAddress());
  });
});