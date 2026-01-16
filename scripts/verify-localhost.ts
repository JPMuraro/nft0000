// Script Hardhat de diagnóstico local: lê `deployments/localhost.json`, extrai os endereços do
// MuraroToken e MuraroNFT (aceitando variações de chaves), verifica se há bytecode nesses endereços
// na instância atual do Hardhat (getCode), e se estiver tudo ok, conecta nos contratos e imprime
// leituras principais (owners, symbol/decimals do ERC-20 e price do ERC-721) para validar o deploy.
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

function pickAddress(obj: any, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.startsWith("0x") && v.length === 42) return v;
  }
  return null;
}

async function main() {
  const file = path.join(__dirname, "..", "deployments", "localhost.json");

  if (!fs.existsSync(file)) {
    console.log("Arquivo deployments/localhost.json não existe.");
    console.log("Rode: npx hardhat run scripts/deploy.ts --network localhost");
    process.exit(1);
  }

  const raw = fs.readFileSync(file, "utf8");
  const json = JSON.parse(raw);

  const tokenAddress =
    pickAddress(json, ["tokenAddress", "MuraroToken", "muraroToken", "token"]) ?? "";
  const nftAddress =
    pickAddress(json, ["nftAddress", "MuraroNFT", "muraroNft", "nft"]) ?? "";

  if (!tokenAddress || !nftAddress) {
    console.log("Não consegui localizar tokenAddress/nftAddress dentro de deployments/localhost.json");
    console.log("Conteúdo do JSON:", json);
    process.exit(1);
  }

  console.log("Token:", tokenAddress);
  console.log("NFT:", nftAddress);

  const codeToken = await ethers.provider.getCode(tokenAddress);
  const codeNft = await ethers.provider.getCode(nftAddress);

  console.log("Bytecode ERC-20:", codeToken === "0x" ? "NÃO ENCONTRADO" : "OK");
  console.log("Bytecode ERC-721:", codeNft === "0x" ? "NÃO ENCONTRADO" : "OK");

  if (codeToken === "0x" || codeNft === "0x") {
    console.log("\nOs contratos NÃO estão implantados nesta instância do Hardhat.");
    console.log("Solução: mantenha o 'npx hardhat node' rodando e rode o deploy novamente.");
    process.exit(1);
  }

  const token = await ethers.getContractAt("MuraroToken", tokenAddress);
  const nft = await ethers.getContractAt("MuraroNFT", nftAddress);

  const [tokenOwner, nftOwner, symbol, decimals, price] = await Promise.all([
    token.owner(),
    nft.owner(),
    token.symbol(),
    token.decimals(),
    nft.price(),
  ]);

  console.log("\n--- LEITURAS ---");
  console.log("Owner ERC-20:", tokenOwner);
  console.log("Owner ERC-721:", nftOwner);
  console.log("Symbol:", symbol);
  console.log("Decimals:", decimals.toString());
  console.log("Price (raw):", price.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
