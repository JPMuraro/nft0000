// Script Hardhat que consulta o `tokenURI` de um MuraroNFT já implantado, valida se ele está no
// formato on-chain `data:application/json;base64,`, decodifica o Base64 para JSON legível e imprime
// os campos principais (name, description, image e attributes) para inspeção/depuração.
import { ethers } from "hardhat";

async function main() {
  const NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const TOKEN_ID = 1n;

  const nft = await ethers.getContractAt("MuraroNFT", NFT_ADDRESS);

  const uri = await nft.tokenURI(TOKEN_ID);

  console.log("NFT:", NFT_ADDRESS);
  console.log("tokenId:", TOKEN_ID.toString());
  console.log("tokenURI (inicio):", uri.slice(0, 120) + "...");
  console.log("prefix ok:", uri.startsWith("data:application/json;base64,"));

  if (!uri.startsWith("data:application/json;base64,")) {
    console.log("\nERRO: tokenURI não parece ser on-chain (data:application/json;base64,...)");
    console.log("tokenURI completo:", uri);
    return;
  }

  const base64 = uri.replace("data:application/json;base64,", "");
  const jsonStr = Buffer.from(base64, "base64").toString("utf8");

  console.log("\nJSON decodificado:");
  console.log(jsonStr);

  try {
    const json = JSON.parse(jsonStr);
    console.log("\nCampos principais:");
    console.log("name:", json?.name);
    console.log("description:", json?.description);
    console.log(
      "image (inicio):",
      typeof json?.image === "string" ? json.image.slice(0, 80) + "..." : json?.image
    );
    console.log("attributes:", json?.attributes);
  } catch {
    console.log("\nAVISO: JSON não parseou como objeto, mas o conteúdo acima foi impresso.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
