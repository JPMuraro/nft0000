import "./setup";
import { expect } from "chai";
import { ethers } from "hardhat";
import { parseUnits } from "ethers";


describe("MuraroToken (ERC-20)", () => {
  it("owner consegue mintAndTransfer", async () => {
    const [owner, alice] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MuraroToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const amount = parseUnits("100", 18);

    await token.connect(owner).mintAndTransfer(alice.address, amount);

    expect(await token.balanceOf(alice.address)).to.equal(amount);
  });

  it("nao-owner nao consegue mintAndTransfer", async () => {
    const [, alice, bob] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MuraroToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const amount = parseUnits("1", 18);

    await expect(token.connect(alice).mintAndTransfer(bob.address, amount))
      .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
  });
});
