import { expect } from "chai";
import { ethers } from "hardhat";

function decodeDataJsonBase64(tokenUri: string) {
  const prefix = "data:application/json;base64,";
  expect(tokenUri.startsWith(prefix)).to.eq(true);

  const b64 = tokenUri.slice(prefix.length);
  const jsonStr = Buffer.from(b64, "base64").toString("utf8");
  return JSON.parse(jsonStr);
}

describe("MuraroNFT tokenURI (on-chain data URI)", function () {
  it("deve retornar JSON padrão OpenSea via data URI", async () => {
    const [deployer, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MuraroToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const price = ethers.parseUnits("10", 18);

    const Nft = await ethers.getContractFactory("MuraroNFT");
    const nft = await Nft.deploy(await token.getAddress(), price);
    await nft.waitForDeployment();

    // Dar tokens ao user e aprovar
    await token.mintAndTransfer(user.address, price);
    await token.connect(user).approve(await nft.getAddress(), price);

    // Mint
    await nft.connect(user).mint();

    // tokenURI(1)
    const uri = await nft.tokenURI(1);
    const json = decodeDataJsonBase64(uri);

    expect(json).to.have.property("name");
    expect(json.name).to.include("#1");

    expect(json).to.have.property("description");
    expect(json).to.have.property("image");
    expect(json.image).to.match(/^data:image\/svg\+xml;base64,/);

    expect(json).to.have.property("attributes");
    expect(json.attributes).to.be.an("array");
  });

  it("setPrice deve ser onlyOwner", async () => {
    const [deployer, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MuraroToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const price = ethers.parseUnits("10", 18);

    const Nft = await ethers.getContractFactory("MuraroNFT");
    const nft = await Nft.deploy(await token.getAddress(), price);
    await nft.waitForDeployment();

    const newPrice = ethers.parseUnits("15", 18);

    await expect(nft.connect(user).setPrice(newPrice)).to.be.reverted; // onlyOwner
    await expect(nft.connect(deployer).setPrice(newPrice)).to.not.be.reverted;

    expect(await nft.price()).to.eq(newPrice);
  });
});
