import { expect } from "chai";
import { ethers } from "hardhat";

function decodeDataJsonBase64(tokenUri: string) {
  const prefix = "data:application/json;base64,";
  expect(tokenUri.startsWith(prefix)).to.eq(true);

  const b64 = tokenUri.slice(prefix.length);
  const jsonStr = Buffer.from(b64, "base64").toString("utf8");
  return JSON.parse(jsonStr);
}

describe("MuraroNFT (ERC-721 pago com ERC-20)", function () {
  it("constructor seta paymentToken e price (publico)", async () => {
    const [deployer] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MuraroToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const price = ethers.parseUnits("10", 18);

    const Nft = await ethers.getContractFactory("MuraroNFT");
    const nft = await Nft.deploy(await token.getAddress(), price);
    await nft.waitForDeployment();

    expect(await nft.price()).to.eq(price);
    expect(await nft.paymentToken()).to.eq(await token.getAddress());
    expect(await nft.owner()).to.eq(deployer.address);
  });

  it("setPrice só owner", async () => {
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

  it("mint exige approve e transfere ERC-20 do comprador para o owner do ERC-721", async () => {
    const [deployer, buyer] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MuraroToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const price = ethers.parseUnits("10", 18);

    const Nft = await ethers.getContractFactory("MuraroNFT");
    const nft = await Nft.deploy(await token.getAddress(), price);
    await nft.waitForDeployment();

    // buyer recebe tokens (mint feito pelo owner do ERC-20)
    await token.mintAndTransfer(buyer.address, price);

    // approve
    await token.connect(buyer).approve(await nft.getAddress(), price);

    const ownerBalBefore = await token.balanceOf(deployer.address);
    const buyerBalBefore = await token.balanceOf(buyer.address);

    // mint
    await expect(nft.connect(buyer).mint()).to.not.be.reverted;

    const ownerBalAfter = await token.balanceOf(deployer.address);
    const buyerBalAfter = await token.balanceOf(buyer.address);

    expect(ownerBalAfter - ownerBalBefore).to.eq(price);
    expect(buyerBalBefore - buyerBalAfter).to.eq(price);

    // deve ter cunhado tokenId 1 para buyer
    expect(await nft.ownerOf(1n)).to.eq(buyer.address);
  });

  it("sem approve, mint falha", async () => {
    const [deployer, buyer] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MuraroToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const price = ethers.parseUnits("10", 18);

    const Nft = await ethers.getContractFactory("MuraroNFT");
    const nft = await Nft.deploy(await token.getAddress(), price);
    await nft.waitForDeployment();

    await token.mintAndTransfer(buyer.address, price);

    // sem approve
    await expect(nft.connect(buyer).mint()).to.be.reverted;
  });

  it("owner não tem privilégio: sem approve também falha para ele", async () => {
    const [deployer] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MuraroToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const price = ethers.parseUnits("10", 18);

    const Nft = await ethers.getContractFactory("MuraroNFT");
    const nft = await Nft.deploy(await token.getAddress(), price);
    await nft.waitForDeployment();

    // owner (deployer) até pode ter saldo, mas sem approve deve falhar
    await token.mintAndTransfer(deployer.address, price);

    await expect(nft.connect(deployer).mint()).to.be.reverted;
  });

  it("tokenURI retorna JSON padrão OpenSea via data URI (on-chain)", async () => {
    const [deployer, buyer] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MuraroToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const price = ethers.parseUnits("10", 18);

    const Nft = await ethers.getContractFactory("MuraroNFT");
    const nft = await Nft.deploy(await token.getAddress(), price);
    await nft.waitForDeployment();

    // buyer recebe tokens e aprova
    await token.mintAndTransfer(buyer.address, price);
    await token.connect(buyer).approve(await nft.getAddress(), price);

    // mint tokenId 1
    await nft.connect(buyer).mint();

    const uri = await nft.tokenURI(1n);
    const json = decodeDataJsonBase64(uri);

    expect(json).to.have.property("name");
    expect(json.name).to.include("#1");
    expect(json).to.have.property("description");
    expect(json).to.have.property("image");
    expect(json.image).to.match(/^data:image\/svg\+xml;base64,/);
    expect(json).to.have.property("attributes");
    expect(json.attributes).to.be.an("array");
  });

  it("usuario transfere NFT para outra carteira", async () => {
    const [deployer, buyer, other] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MuraroToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const price = ethers.parseUnits("10", 18);

    const Nft = await ethers.getContractFactory("MuraroNFT");
    const nft = await Nft.deploy(await token.getAddress(), price);
    await nft.waitForDeployment();

    await token.mintAndTransfer(buyer.address, price);
    await token.connect(buyer).approve(await nft.getAddress(), price);
    await nft.connect(buyer).mint(); // tokenId 1

    expect(await nft.ownerOf(1n)).to.eq(buyer.address);

    await expect(
      nft.connect(buyer).transferFrom(buyer.address, other.address, 1n)
    ).to.not.be.reverted;

    expect(await nft.ownerOf(1n)).to.eq(other.address);
  });
});
