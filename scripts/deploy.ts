// Script Hardhat de deploy local: faz o deploy do MuraroToken (ERC-20), define o preço do NFT em
// unidades do token (parseUnits com 18 decimais), faz o deploy do MuraroNFT (ERC-721) apontando
// para o ERC-20 e salva um arquivo `deployments/localhost.json` com chainId, deployer e endereços
// dos contratos (tokenAddress/nftAddress) para sincronização com o frontend.
import { ethers } from "hardhat";
import { mkdirSync, writeFileSync } from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("Network chainId:", network.chainId.toString());
  console.log("Deployer (carteira que faz o deploy):", deployer.address);

  const Token = await ethers.getContractFactory("MuraroToken");
  const token = await Token.deploy();
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("MuraroToken (ERC-20) deployado em:", tokenAddress);

  const price = ethers.parseUnits("10", 18);
  console.log("Preço do NFT (em unidades do ERC-20):", price.toString());

  const NFT = await ethers.getContractFactory("MuraroNFT");
  const nft = await NFT.deploy(tokenAddress, price);
  await nft.waitForDeployment();

  const nftAddress = await nft.getAddress();
  console.log("MuraroNFT (ERC-721) deployado em:", nftAddress);

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
