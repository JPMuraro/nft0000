import { ethers } from "hardhat";
import { mkdirSync, writeFileSync } from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("Network chainId:", network.chainId.toString());
  console.log("Deployer (carteira que faz o deploy):", deployer.address);

  // 1) Deploy ERC-20
  const Token = await ethers.getContractFactory("MuraroToken");
  const token = await Token.deploy();
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("MuraroToken (ERC-20) deployado em:", tokenAddress);

  // 2) Preço do NFT (10 tokens, 18 decimais)
  const price = ethers.parseUnits("10", 18);
  console.log("Preço do NFT (em unidades do ERC-20):", price.toString());

  // 3) Deploy ERC-721
  const NFT = await ethers.getContractFactory("MuraroNFT");
  const nft = await NFT.deploy(tokenAddress, price);
  await nft.waitForDeployment();

  const nftAddress = await nft.getAddress();
  console.log("MuraroNFT (ERC-721) deployado em:", nftAddress);

  // 4) Salvar artifacts de deploy para o front-end
  const deployment = {
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    tokenAddress,
    nftAddress,
    price: price.toString()
  };

  mkdirSync("deployments", { recursive: true });
  writeFileSync("deployments/localhost.json", JSON.stringify(deployment, null, 2));

  console.log("Arquivo salvo em: deployments/localhost.json");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
